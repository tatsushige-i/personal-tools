import { NextResponse } from "next/server";
import { chromium, type Browser, type BrowserContext } from "playwright";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import { validateRequestUrl } from "@/lib/url-validator";
import {
  MAX_MATCHES_PER_SELECTOR,
  MAX_SELECTORS,
  NAVIGATION_TIMEOUT_MS,
  isSelectorInput,
  type ScrapedElement,
  type ScraperResponse,
  type ScraperSelectorInput,
  type SelectorResult,
} from "@/features/web-scraper/lib/types";

export const runtime = "nodejs";

const rateLimit = createRateLimit({ limit: 5, windowMs: 60_000 });

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

type RequestBody = {
  url?: unknown;
  selectors?: unknown;
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

  const selectors = parseSelectors(payload.selectors);
  if ("error" in selectors) {
    return errorResponse(400, "VALIDATION_ERROR", selectors.error);
  }

  const targetUrl = validation.url.toString();
  const start = performance.now();

  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    console.error("[web-scraper] failed to launch chromium", e);
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
    await page.goto(targetUrl, { waitUntil: "load", timeout: NAVIGATION_TIMEOUT_MS });

    // SSRF guard against redirects: the initial URL passed validation, but `page.goto`
    // follows redirects that may land on a private/loopback host. Re-validate the final URL.
    const finalValidation = validateRequestUrl(page.url());
    if (!finalValidation.ok) {
      return errorResponse(
        400,
        finalValidation.errorCode.toUpperCase(),
        "リダイレクト先がローカル/プライベートネットワークのため、抽出を中止しました。",
      );
    }

    const results: SelectorResult[] = [];
    for (const sel of selectors.value) {
      results.push(await extractForSelector(page, sel));
    }

    const response: ScraperResponse = {
      url: targetUrl,
      results,
      durationMs: Math.round(performance.now() - start),
    };
    return NextResponse.json(response);
  } catch (e) {
    const isTimeout = e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
    return errorResponse(
      isTimeout ? 504 : 502,
      isTimeout ? "TIMEOUT" : "SCRAPE_FAILED",
      isTimeout
        ? `ページ読み込みが${NAVIGATION_TIMEOUT_MS / 1000}秒以内に完了しませんでした。`
        : "ページの読み込みに失敗しました。",
    );
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

type SelectorParse =
  | { value: ScraperSelectorInput[] }
  | { error: string };

function parseSelectors(input: unknown): SelectorParse {
  if (!Array.isArray(input)) {
    return { error: "selectors は配列で指定してください。" };
  }
  if (input.length === 0) {
    return { error: "セレクタを1つ以上指定してください。" };
  }
  if (input.length > MAX_SELECTORS) {
    return { error: `セレクタは最大${MAX_SELECTORS}件までです。` };
  }
  const parsed: ScraperSelectorInput[] = [];
  for (const item of input) {
    if (!isSelectorInput(item)) {
      return { error: "セレクタの形式が正しくありません。" };
    }
    const selector = item.selector.trim();
    if (!selector) {
      return { error: "空のセレクタは指定できません。" };
    }
    parsed.push({ name: item.name.trim(), selector });
  }
  return { value: parsed };
}

async function extractForSelector(
  page: import("playwright").Page,
  sel: ScraperSelectorInput,
): Promise<SelectorResult> {
  try {
    // Truncate inside the browser so at most MAX + 1 elements cross the IPC boundary.
    // The +1 is a sentinel that lets us flag `truncated` without serializing every match.
    const limited = (await page.$$eval(
      sel.selector,
      (els, max) =>
        els.slice(0, max + 1).map((el) => ({
          text: (el.textContent ?? "").trim(),
          html: el.innerHTML,
          href: el instanceof HTMLAnchorElement ? el.href : undefined,
          src: el instanceof HTMLImageElement ? el.src : undefined,
        })),
      MAX_MATCHES_PER_SELECTOR,
    )) as ScrapedElement[];

    const truncated = limited.length > MAX_MATCHES_PER_SELECTOR;
    const matches = truncated ? limited.slice(0, MAX_MATCHES_PER_SELECTOR) : limited;
    return { name: sel.name, selector: sel.selector, matches, truncated };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      name: sel.name,
      selector: sel.selector,
      matches: [],
      truncated: false,
      error: `セレクタの実行に失敗しました: ${message}`,
    };
  }
}

function errorResponse(status: number, errorCode: string, message: string): Response {
  return NextResponse.json({ error: message, errorCode }, { status });
}
