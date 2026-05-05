import type {
  CheckerError,
  CheckerOptions,
  CheckerResponse,
} from "@/features/broken-link-checker/lib/types";

export type CheckResult =
  | { ok: true; data: CheckerResponse }
  | { ok: false; error: CheckerError; status: number };

export async function checkLinks(
  options: CheckerOptions,
  signal?: AbortSignal,
): Promise<CheckResult> {
  let response: Response;
  try {
    response = await fetch("/api/broken-link-checker", {
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
    const err = payload as Partial<CheckerError>;
    return {
      ok: false,
      status: response.status,
      error: {
        error: err.error ?? `エラー (${response.status})`,
        errorCode: err.errorCode ?? "UNKNOWN_ERROR",
      },
    };
  }

  return { ok: true, data: payload as CheckerResponse };
}
