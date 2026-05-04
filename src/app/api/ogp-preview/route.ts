import { NextResponse } from "next/server";
import { chromium, type Browser, type BrowserContext } from "playwright";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import { validateRequestUrl } from "@/lib/url-validator";
import type {
  JsonLdEntry,
  MetaTag,
  OgpPreviewData,
} from "@/features/ogp-preview/lib/types";

export const runtime = "nodejs";

const rateLimit = createRateLimit({ limit: 5, windowMs: 60_000 });

const NAVIGATION_TIMEOUT_MS = 20_000;
const NETWORK_IDLE_TIMEOUT_MS = 5_000;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OgpPreviewBot/1.0";

type RequestBody = { url?: unknown };

type ExtractedRaw = {
  title: string;
  metas: { name: string | null; property: string | null; content: string }[];
  canonical: string | null;
  iconLink: string | null;
  jsonLd: string[];
  baseUrl: string;
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

  const start = performance.now();

  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    console.error("[ogp-preview] failed to launch chromium", e);
    return errorResponse(
      500,
      "BROWSER_LAUNCH_FAILED",
      "ブラウザの起動に失敗しました。Playwrightのインストール状態を確認してください。",
    );
  }

  let context: BrowserContext | undefined;
  try {
    context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();
    const targetUrl = validation.url.toString();

    let upstreamStatus: number;
    try {
      const response = await page.goto(targetUrl, {
        waitUntil: "domcontentloaded",
        timeout: NAVIGATION_TIMEOUT_MS,
      });
      upstreamStatus = response?.status() ?? 0;
      await page
        .waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS })
        .catch(() => {});
    } catch (e) {
      const isTimeout = e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
      if (isTimeout) {
        return errorResponse(
          504,
          "TIMEOUT",
          `ページ読み込みが${NAVIGATION_TIMEOUT_MS / 1000}秒以内に完了しませんでした。`,
        );
      }
      console.error("[ogp-preview] navigation failed", e);
      return errorResponse(502, "EXTRACTION_FAILED", "ページの取得に失敗しました。");
    }

    if (upstreamStatus >= 400) {
      return NextResponse.json(
        {
          error: `アクセス先が ${upstreamStatus} を返しました。`,
          errorCode: "UPSTREAM_ERROR",
          upstreamStatus,
        },
        { status: 502 },
      );
    }

    let raw: ExtractedRaw;
    try {
      raw = await page.evaluate((): ExtractedRaw => {
        const metas = Array.from(document.querySelectorAll("meta")).map((m) => ({
          name: m.getAttribute("name"),
          property: m.getAttribute("property"),
          content: m.getAttribute("content") ?? "",
        }));
        const canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        const iconEl = document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null;
        const jsonLd = Array.from(
          document.querySelectorAll('script[type="application/ld+json"]'),
        ).map((s) => s.textContent ?? "");
        return {
          title: document.title,
          metas,
          canonical: canonicalEl?.href ?? null,
          iconLink: iconEl?.href ?? null,
          jsonLd,
          baseUrl: document.baseURI,
        };
      });
    } catch (e) {
      console.error("[ogp-preview] extraction failed", e);
      return errorResponse(502, "EXTRACTION_FAILED", "メタ情報の抽出に失敗しました。");
    }

    const finalUrl = page.url();
    const data = buildResponse({
      raw,
      requestUrl: targetUrl,
      finalUrl,
      upstreamStatus,
      durationMs: Math.round(performance.now() - start),
    });
    return NextResponse.json(data);
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

function buildResponse(input: {
  raw: ExtractedRaw;
  requestUrl: string;
  finalUrl: string;
  upstreamStatus: number;
  durationMs: number;
}): OgpPreviewData {
  const { raw, requestUrl, finalUrl, upstreamStatus, durationMs } = input;

  const ogTags: MetaTag[] = [];
  const twitterTags: MetaTag[] = [];
  const generalTags: MetaTag[] = [];

  for (const m of raw.metas) {
    const key = m.property ?? m.name;
    if (!key) continue;
    const content = URL_VALUE_KEYS.has(key)
      ? resolveUrl(m.content, raw.baseUrl)
      : m.content;
    const tag: MetaTag = { key, content };
    if (key.startsWith("og:")) {
      ogTags.push(tag);
    } else if (key.startsWith("twitter:")) {
      twitterTags.push(tag);
    } else {
      generalTags.push(tag);
    }
  }

  const faviconUrl = raw.iconLink ?? defaultFavicon(finalUrl);

  const jsonLd: JsonLdEntry[] = raw.jsonLd.map((rawText) => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      return { raw: rawText, parsed: null, parseError: "空のスクリプトです。" };
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return { raw: rawText, parsed };
    } catch (e) {
      const message = e instanceof Error ? e.message : "JSONとしてパースできませんでした。";
      return { raw: rawText, parsed: null, parseError: message };
    }
  });

  return {
    requestUrl,
    finalUrl,
    upstreamStatus,
    title: raw.title,
    ogTags,
    twitterTags,
    generalTags,
    canonical: raw.canonical,
    faviconUrl,
    jsonLd,
    durationMs,
  };
}

const URL_VALUE_KEYS = new Set([
  "og:url",
  "og:image",
  "og:image:url",
  "og:image:secure_url",
  "og:video",
  "og:video:url",
  "og:video:secure_url",
  "og:audio",
  "og:audio:url",
  "og:audio:secure_url",
  "twitter:url",
  "twitter:image",
  "twitter:image:src",
  "twitter:player",
]);

function resolveUrl(content: string, baseUrl: string): string {
  if (!content) return content;
  try {
    return new URL(content, baseUrl).toString();
  } catch {
    return content;
  }
}

function defaultFavicon(pageUrl: string): string | null {
  try {
    const u = new URL(pageUrl);
    return `${u.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function errorResponse(status: number, errorCode: string, message: string): Response {
  return NextResponse.json({ error: message, errorCode }, { status });
}
