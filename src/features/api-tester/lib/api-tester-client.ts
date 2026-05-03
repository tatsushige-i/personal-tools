import type { ApiTesterRequest, ApiTesterResponse } from "./types";

export class ApiTesterError extends Error {
  readonly errorCode: string;

  constructor(message: string, errorCode: string) {
    super(message);
    this.name = "ApiTesterError";
    this.errorCode = errorCode;
  }
}

export async function sendApiRequest(request: ApiTesterRequest): Promise<ApiTesterResponse> {
  let response: Response;
  try {
    response = await fetch("/api/api-tester", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new ApiTesterError("プロキシサーバーに接続できませんでした。", "CLIENT_NETWORK_ERROR");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiTesterError(`リクエストに失敗しました。（${response.status}）`, "INVALID_RESPONSE");
  }

  if (!response.ok) {
    const errorPayload = payload as { error?: string; errorCode?: string };
    throw new ApiTesterError(
      errorPayload.error ?? `リクエストに失敗しました。（${response.status}）`,
      errorPayload.errorCode ?? "UNKNOWN_ERROR"
    );
  }

  return payload as ApiTesterResponse;
}

export function tryFormatJson(text: string): string {
  if (!text) return "";
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
