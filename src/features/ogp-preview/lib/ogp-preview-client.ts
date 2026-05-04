import type {
  OgpPreviewData,
  OgpPreviewError,
  OgpPreviewOptions,
} from "@/features/ogp-preview/lib/types";

export type OgpPreviewResult =
  | { ok: true; data: OgpPreviewData }
  | { ok: false; error: OgpPreviewError; status: number };

export async function fetchOgpPreview(
  options: OgpPreviewOptions,
  signal?: AbortSignal,
): Promise<OgpPreviewResult> {
  let response: Response;
  try {
    response = await fetch("/api/ogp-preview", {
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
    const err = payload as Partial<OgpPreviewError>;
    return {
      ok: false,
      status: response.status,
      error: {
        error: err.error ?? `エラー (${response.status})`,
        errorCode: err.errorCode ?? "UNKNOWN_ERROR",
        upstreamStatus: err.upstreamStatus,
      },
    };
  }

  return { ok: true, data: payload as OgpPreviewData };
}
