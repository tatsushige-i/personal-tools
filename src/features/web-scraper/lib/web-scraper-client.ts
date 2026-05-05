import type {
  ScraperError,
  ScraperOptions,
  ScraperResponse,
} from "@/features/web-scraper/lib/types";

export type ScrapeResult =
  | { ok: true; data: ScraperResponse }
  | { ok: false; error: ScraperError; status: number };

export async function scrape(
  options: ScraperOptions,
  signal?: AbortSignal,
): Promise<ScrapeResult> {
  let response: Response;
  try {
    response = await fetch("/api/web-scraper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
      signal,
    });
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    return {
      ok: false,
      status: 0,
      error: {
        error: aborted ? "リクエストが中断されました。" : "サーバーに接続できませんでした。",
        errorCode: aborted ? "ABORTED" : "NETWORK_ERROR",
      },
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      status: response.status,
      error: { error: "サーバーからの応答を解析できませんでした。", errorCode: "PARSE_ERROR" },
    };
  }

  if (!response.ok) {
    const err = payload as Partial<ScraperError>;
    return {
      ok: false,
      status: response.status,
      error: {
        error: err.error ?? `エラー (${response.status})`,
        errorCode: err.errorCode ?? "UNKNOWN_ERROR",
      },
    };
  }

  return { ok: true, data: payload as ScraperResponse };
}
