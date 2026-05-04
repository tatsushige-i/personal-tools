import { NextResponse } from "next/server";
import { chromium, type Browser, type BrowserContext } from "playwright";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import { validateRequestUrl } from "@/lib/url-validator";
import { calculateOverallScore } from "@/features/page-performance-checker/lib/scoring";
import {
  DEVICE_PRESETS,
  isDevice,
  toResourceType,
  type CoreMetrics,
  type Device,
  type DeviceResult,
  type NavTimings,
  type ResourceEntry,
} from "@/features/page-performance-checker/lib/types";

export const runtime = "nodejs";

const rateLimit = createRateLimit({ limit: 5, windowMs: 60_000 });

const NAVIGATION_TIMEOUT_MS = 20_000;
const POST_LOAD_WAIT_MS = 3_000;

type RequestBody = {
  url?: unknown;
  devices?: unknown;
};

type RawResource = {
  name: string;
  initiatorType: string;
  transferSize: number;
  decodedBodySize: number;
  duration: number;
};

type RawPerf = {
  lcp: number | null;
  cls: number;
  fcp: number | null;
  longtasks: { startTime: number; duration: number }[];
};

type EvalResult = {
  perf: RawPerf;
  nav: { responseStart: number; domContentLoadedEventEnd: number; loadEventEnd: number } | null;
  resources: RawResource[];
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (ip !== "unknown") {
    const result = rateLimit.check(ip);
    if (!result.allowed) {
      return rateLimitResponse(result.retryAfterMs);
    }
  }

  let payload: RequestBody;
  try {
    payload = (await request.json()) as RequestBody;
  } catch {
    return errorResponse(400, "VALIDATION_ERROR", "リクエストボディの形式が正しくありません。");
  }

  const validation = validateRequestUrl(typeof payload.url === "string" ? payload.url : "");
  if (!validation.ok) {
    return errorResponse(400, validation.errorCode.toUpperCase(), validation.message);
  }

  if (!Array.isArray(payload.devices) || payload.devices.length === 0) {
    return errorResponse(400, "VALIDATION_ERROR", "デバイスを1つ以上選択してください。");
  }
  const devices: Device[] = [];
  for (const v of payload.devices) {
    if (!isDevice(v)) {
      return errorResponse(400, "VALIDATION_ERROR", "未対応のデバイスが含まれています。");
    }
    if (!devices.includes(v)) devices.push(v);
  }

  const targetUrl = validation.url.toString();
  const start = performance.now();

  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    console.error("[page-performance] failed to launch chromium", e);
    return errorResponse(
      500,
      "BROWSER_LAUNCH_FAILED",
      "ブラウザの起動に失敗しました。Playwrightのインストール状態を確認してください。",
    );
  }

  try {
    const results = await Promise.all(devices.map((device) => measureDevice(browser, targetUrl, device)));
    const failed = results.find((r) => "error" in r);
    if (failed && "error" in failed) {
      return errorResponse(failed.error.status, failed.error.code, failed.error.message);
    }

    return NextResponse.json({
      url: targetUrl,
      results: results as DeviceResult[],
      durationMs: Math.round(performance.now() - start),
    });
  } finally {
    await browser.close().catch(() => {});
  }
}

type DeviceMeasureOutput =
  | DeviceResult
  | { error: { status: number; code: string; message: string } };

async function measureDevice(
  browser: Browser,
  url: string,
  device: Device,
): Promise<DeviceMeasureOutput> {
  const preset = DEVICE_PRESETS[device];
  let context: BrowserContext | undefined;

  try {
    context = await browser.newContext({
      viewport: { width: preset.width, height: preset.height },
      isMobile: preset.isMobile,
      userAgent: preset.userAgent,
    });
    await context.addInitScript(initPerformanceObservers);

    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load", timeout: NAVIGATION_TIMEOUT_MS });
    await page.waitForTimeout(POST_LOAD_WAIT_MS);

    const evalResult = (await page.evaluate(collectPerformanceData)) as EvalResult;

    const metrics = computeMetrics(evalResult.perf);
    const timings = computeTimings(evalResult.nav);
    const resources = mapResources(evalResult.resources);
    const totalTransferSize = resources.reduce((sum, r) => sum + r.transferSize, 0);
    const score = calculateOverallScore(metrics);

    return {
      device,
      viewport: { width: preset.width, height: preset.height },
      metrics,
      timings,
      resources,
      totalTransferSize,
      score,
    };
  } catch (e) {
    const isTimeout = e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
    return {
      error: {
        status: isTimeout ? 504 : 502,
        code: isTimeout ? "TIMEOUT" : "MEASURE_FAILED",
        message: isTimeout
          ? `${device}: ページ読み込みが${NAVIGATION_TIMEOUT_MS / 1000}秒以内に完了しませんでした。`
          : `${device}: パフォーマンス計測に失敗しました。`,
      },
    };
  } finally {
    if (context) await context.close().catch(() => {});
  }
}

function initPerformanceObservers(): void {
  // Runs in the browser context. window.__perf__ collects raw measurements.
  type PerfBucket = {
    lcp: number | null;
    cls: number;
    fcp: number | null;
    longtasks: { startTime: number; duration: number }[];
  };
  const bucket: PerfBucket = { lcp: null, cls: 0, fcp: null, longtasks: [] };
  (window as unknown as { __perf__: PerfBucket }).__perf__ = bucket;

  const observe = (type: string, cb: (entries: PerformanceEntry[]) => void) => {
    try {
      const observer = new PerformanceObserver((list) => cb(list.getEntries()));
      observer.observe({ type, buffered: true });
    } catch {
      // entry type not supported; skip
    }
  };

  observe("largest-contentful-paint", (entries) => {
    if (entries.length > 0) {
      bucket.lcp = entries[entries.length - 1].startTime;
    }
  });

  observe("layout-shift", (entries) => {
    for (const entry of entries) {
      const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!e.hadRecentInput) bucket.cls += e.value;
    }
  });

  observe("paint", (entries) => {
    for (const entry of entries) {
      if (entry.name === "first-contentful-paint") {
        bucket.fcp = entry.startTime;
      }
    }
  });

  observe("longtask", (entries) => {
    for (const entry of entries) {
      bucket.longtasks.push({ startTime: entry.startTime, duration: entry.duration });
    }
  });
}

function collectPerformanceData(): EvalResult {
  const w = window as unknown as { __perf__: RawPerf };
  const perf = w.__perf__;
  const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const nav = navEntry
    ? {
        responseStart: navEntry.responseStart,
        domContentLoadedEventEnd: navEntry.domContentLoadedEventEnd,
        loadEventEnd: navEntry.loadEventEnd,
      }
    : null;
  const resources = performance.getEntriesByType("resource").map((entry) => {
    const r = entry as PerformanceResourceTiming;
    return {
      name: r.name,
      initiatorType: r.initiatorType,
      transferSize: r.transferSize,
      decodedBodySize: r.decodedBodySize,
      duration: r.duration,
    };
  });
  return { perf, nav, resources };
}

function computeMetrics(raw: RawPerf): CoreMetrics {
  const fcp = raw.fcp;
  const tbt = raw.longtasks.reduce((sum, task) => {
    if (task.duration <= 50) return sum;
    if (fcp !== null && task.startTime + task.duration <= fcp) return sum;
    const blockingStart = fcp !== null ? Math.max(task.startTime, fcp) : task.startTime;
    const blockingEnd = task.startTime + task.duration;
    const blockingDuration = blockingEnd - blockingStart;
    return sum + Math.max(0, blockingDuration - 50);
  }, 0);
  return {
    lcp: raw.lcp,
    cls: raw.cls,
    fcp,
    tbt: Math.round(tbt),
  };
}

function computeTimings(nav: EvalResult["nav"]): NavTimings {
  if (!nav) return { ttfb: 0, dcl: 0, load: 0 };
  return {
    ttfb: Math.max(0, Math.round(nav.responseStart)),
    dcl: Math.max(0, Math.round(nav.domContentLoadedEventEnd)),
    load: Math.max(0, Math.round(nav.loadEventEnd)),
  };
}

function mapResources(resources: RawResource[]): ResourceEntry[] {
  return resources.map((r) => ({
    name: r.name,
    type: toResourceType(r.initiatorType, r.name),
    transferSize: r.transferSize,
    decodedSize: r.decodedBodySize,
    duration: Math.round(r.duration),
  }));
}

function errorResponse(status: number, errorCode: string, message: string): Response {
  return NextResponse.json({ error: message, errorCode }, { status });
}
