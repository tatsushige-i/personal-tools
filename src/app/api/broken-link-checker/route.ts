import { NextResponse } from "next/server";
import { chromium, type APIRequestContext, type Browser, type BrowserContext } from "playwright";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import { validateRequestUrl } from "@/lib/url-validator";
import {
  LINK_REQUEST_TIMEOUT_MS,
  MAX_LINKS_TO_CHECK,
  NAVIGATION_TIMEOUT_MS,
  REQUEST_CONCURRENCY,
  classifyStatus,
  isDepth,
  type CheckerResponse,
  type Depth,
  type LinkResult,
} from "@/features/broken-link-checker/lib/types";

export const runtime = "nodejs";

const rateLimit = createRateLimit({ limit: 5, windowMs: 60_000 });

// Max number of internal pages to crawl when depth=2 (1 entry page + N internal pages).
const MAX_INTERNAL_CRAWL_PAGES = 5;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

type RequestBody = {
  url?: unknown;
  depth?: unknown;
};

type DiscoveredLink = {
  url: string;
  isInternal: boolean;
  sourcePage: string;
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

  if (!isDepth(payload.depth)) {
    return errorResponse(400, "VALIDATION_ERROR", "階層は 1 または 2 を指定してください。");
  }
  const depth: Depth = payload.depth;

  const targetUrl = validation.url.toString();
  const targetHost = validation.url.hostname.toLowerCase();
  const start = performance.now();

  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    console.error("[broken-link-checker] failed to launch chromium", e);
    return errorResponse(
      500,
      "BROWSER_LAUNCH_FAILED",
      "ブラウザの起動に失敗しました。Playwrightのインストール状態を確認してください。",
    );
  }

  let context: BrowserContext | undefined;
  try {
    context = await browser.newContext({ userAgent: USER_AGENT });

    const discovery = await discoverLinks(context, targetUrl, targetHost, depth);
    if ("error" in discovery) {
      return errorResponse(discovery.error.status, discovery.error.code, discovery.error.message);
    }

    const totalFound = discovery.links.length;
    const truncated = totalFound > MAX_LINKS_TO_CHECK;
    const toCheck = truncated ? discovery.links.slice(0, MAX_LINKS_TO_CHECK) : discovery.links;

    const checked = await checkLinks(context.request, toCheck);

    const response: CheckerResponse = {
      url: targetUrl,
      depth,
      links: checked,
      totalFound,
      totalChecked: checked.length,
      truncated,
      durationMs: Math.round(performance.now() - start),
    };
    return NextResponse.json(response);
  } catch (e) {
    const isTimeout = e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
    return errorResponse(
      isTimeout ? 504 : 502,
      isTimeout ? "TIMEOUT" : "CRAWL_FAILED",
      isTimeout
        ? `ページ読み込みが${NAVIGATION_TIMEOUT_MS / 1000}秒以内に完了しませんでした。`
        : "リンクのクロールに失敗しました。",
    );
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

type DiscoveryResult =
  | { links: DiscoveredLink[] }
  | { error: { status: number; code: string; message: string } };

async function discoverLinks(
  context: BrowserContext,
  entryUrl: string,
  entryHost: string,
  depth: Depth,
): Promise<DiscoveryResult> {
  const seen = new Map<string, DiscoveredLink>();
  const visitedPages = new Set<string>();

  try {
    await crawlPage(context, entryUrl, entryHost, seen, visitedPages);
  } catch (e) {
    const isTimeout = e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
    return {
      error: {
        status: isTimeout ? 504 : 502,
        code: isTimeout ? "TIMEOUT" : "CRAWL_FAILED",
        message: isTimeout
          ? `ページ読み込みが${NAVIGATION_TIMEOUT_MS / 1000}秒以内に完了しませんでした。`
          : "ページの読み込みに失敗しました。",
      },
    };
  }

  if (depth === 2) {
    const internalLinks = [...seen.values()].filter(
      (l) => l.isInternal && !visitedPages.has(l.url),
    );
    for (const link of internalLinks.slice(0, MAX_INTERNAL_CRAWL_PAGES)) {
      if (seen.size >= MAX_LINKS_TO_CHECK) break;
      try {
        await crawlPage(context, link.url, entryHost, seen, visitedPages);
      } catch {
        // Internal page failed to load — skip; the link itself will still be checked.
      }
    }
  }

  return { links: [...seen.values()] };
}

async function crawlPage(
  context: BrowserContext,
  pageUrl: string,
  entryHost: string,
  seen: Map<string, DiscoveredLink>,
  visitedPages: Set<string>,
): Promise<void> {
  if (visitedPages.has(pageUrl)) return;
  visitedPages.add(pageUrl);

  const page = await context.newPage();
  try {
    await page.goto(pageUrl, { waitUntil: "load", timeout: NAVIGATION_TIMEOUT_MS });
    const hrefs = (await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));
      return anchors.map((a) => a.href);
    })) as string[];

    for (const href of hrefs) {
      const normalized = normalizeHref(href);
      if (!normalized) continue;
      if (seen.has(normalized.url)) continue;
      const isInternal = sameHost(normalized.url, entryHost);
      seen.set(normalized.url, { url: normalized.url, isInternal, sourcePage: pageUrl });
    }
  } finally {
    await page.close().catch(() => {});
  }
}

function normalizeHref(href: string): { url: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  parsed.hash = "";
  return { url: parsed.toString() };
}

function sameHost(url: string, host: string): boolean {
  try {
    return new URL(url).hostname.toLowerCase() === host;
  } catch {
    return false;
  }
}

async function checkLinks(
  request: APIRequestContext,
  links: DiscoveredLink[],
): Promise<LinkResult[]> {
  const results: LinkResult[] = new Array(links.length);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.min(REQUEST_CONCURRENCY, links.length) },
    async () => {
      while (true) {
        const idx = cursor++;
        if (idx >= links.length) return;
        results[idx] = await checkOne(request, links[idx]);
      }
    },
  );
  await Promise.all(runners);
  return results;
}

async function checkOne(request: APIRequestContext, link: DiscoveredLink): Promise<LinkResult> {
  const start = performance.now();

  // SSRF guard: discovered hrefs are untrusted. Refuse to fetch URLs that point at
  // localhost / private / link-local addresses (e.g. cloud metadata endpoints).
  const validation = validateRequestUrl(link.url);
  if (!validation.ok) {
    return {
      url: link.url,
      statusCode: null,
      status: "blocked",
      isInternal: link.isInternal,
      durationMs: 0,
      sourcePage: link.sourcePage,
    };
  }

  const headOutcome = await tryRequest(request, link.url, "head");
  let outcome = headOutcome;

  // Some servers reject HEAD with 4xx/5xx or close the connection. Retry with GET in those cases
  // to avoid false negatives. We always release the body to avoid downloading large pages.
  const shouldRetryWithGet =
    outcome.kind === "error" ||
    (outcome.kind === "status" &&
      (outcome.statusCode === 405 || outcome.statusCode === 501 || outcome.statusCode >= 500));
  if (shouldRetryWithGet) {
    outcome = await tryRequest(request, link.url, "get");
  }

  const durationMs = Math.round(performance.now() - start);

  if (outcome.kind === "status") {
    return {
      url: link.url,
      statusCode: outcome.statusCode,
      status: classifyStatus(outcome.statusCode),
      isInternal: link.isInternal,
      durationMs,
      sourcePage: link.sourcePage,
    };
  }
  return {
    url: link.url,
    statusCode: null,
    status: outcome.timeout ? "timeout" : "network-error",
    isInternal: link.isInternal,
    durationMs,
    sourcePage: link.sourcePage,
  };
}

type RequestOutcome =
  | { kind: "status"; statusCode: number }
  | { kind: "error"; timeout: boolean };

async function tryRequest(
  request: APIRequestContext,
  url: string,
  method: "head" | "get",
): Promise<RequestOutcome> {
  try {
    const res =
      method === "head"
        ? await request.head(url, { timeout: LINK_REQUEST_TIMEOUT_MS, maxRedirects: 0 })
        : await request.get(url, { timeout: LINK_REQUEST_TIMEOUT_MS, maxRedirects: 0 });
    const statusCode = res.status();
    // Release the body to free memory; we never read it.
    await res.dispose().catch(() => {});
    return { kind: "status", statusCode };
  } catch (e) {
    const timeout = e instanceof Error && (e.name === "TimeoutError" || /timeout/i.test(e.message));
    return { kind: "error", timeout };
  }
}

function errorResponse(status: number, errorCode: string, message: string): Response {
  return NextResponse.json({ error: message, errorCode }, { status });
}
