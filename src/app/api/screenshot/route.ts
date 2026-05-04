import { NextResponse } from "next/server";
import { chromium, type Browser } from "playwright";
import sharp from "sharp";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import { validateRequestUrl } from "@/lib/url-validator";
import {
  DEVICE_PRESETS,
  isDevice,
  isImageFormat,
  isScale,
  type Device,
  type ImageFormat,
  type Scale,
  type ScreenshotShot,
} from "@/features/screenshot-tool/lib/types";

export const runtime = "nodejs";

const rateLimit = createRateLimit({ limit: 5, windowMs: 60_000 });

const NAVIGATION_TIMEOUT_MS = 20_000;

type RequestBody = {
  url?: unknown;
  devices?: unknown;
  fullPage?: unknown;
  format?: unknown;
  scale?: unknown;
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

  const fullPage = payload.fullPage === true;

  const format: ImageFormat = isImageFormat(payload.format) ? payload.format : "png";
  const scale: Scale = isScale(payload.scale) ? payload.scale : 1;

  const start = performance.now();

  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    console.error("[screenshot] failed to launch chromium", e);
    return errorResponse(
      500,
      "BROWSER_LAUNCH_FAILED",
      "ブラウザの起動に失敗しました。Playwrightのインストール状態を確認してください。",
    );
  }

  try {
    const shots = await Promise.all(
      devices.map((device) => captureShot(browser, validation.url.toString(), device, fullPage, format, scale)),
    );
    const failed = shots.find((s) => "error" in s);
    if (failed && "error" in failed) {
      return errorResponse(failed.error.status, failed.error.code, failed.error.message);
    }

    return NextResponse.json({
      shots: shots as ScreenshotShot[],
      durationMs: Math.round(performance.now() - start),
    });
  } finally {
    await browser.close().catch(() => {});
  }
}

type ShotOrError =
  | ScreenshotShot
  | { error: { status: number; code: string; message: string } };

async function captureShot(
  browser: Browser,
  url: string,
  device: Device,
  fullPage: boolean,
  format: ImageFormat,
  scale: Scale,
): Promise<ShotOrError> {
  const preset = DEVICE_PRESETS[device];
  const context = await browser.newContext({
    viewport: { width: preset.width, height: preset.height },
    deviceScaleFactor: scale,
    isMobile: preset.isMobile,
    userAgent: preset.userAgent,
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "load", timeout: NAVIGATION_TIMEOUT_MS });
    const png = await page.screenshot({ type: "png", fullPage });
    const buffer = format === "webp" ? await sharp(png).webp({ quality: 90 }).toBuffer() : png;
    const dataUrl = `data:image/${format};base64,${buffer.toString("base64")}`;
    return {
      device,
      width: preset.width,
      height: preset.height,
      scale,
      format,
      dataUrl,
    };
  } catch (e) {
    const isTimeout = e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
    return {
      error: {
        status: isTimeout ? 504 : 502,
        code: isTimeout ? "TIMEOUT" : "CAPTURE_FAILED",
        message: isTimeout
          ? `${device}: ページ読み込みが${NAVIGATION_TIMEOUT_MS / 1000}秒以内に完了しませんでした。`
          : `${device}: スクリーンショット取得に失敗しました。`,
      },
    };
  } finally {
    await context.close().catch(() => {});
  }
}

function errorResponse(status: number, errorCode: string, message: string): Response {
  return NextResponse.json({ error: message, errorCode }, { status });
}
