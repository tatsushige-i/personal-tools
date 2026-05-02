import type {
  ApiErrorCode,
  LookupResponse,
  SelfInfoResponse,
} from "./types";

export class IpInfoError extends Error {
  readonly errorCode: ApiErrorCode | undefined;

  constructor(message: string, errorCode?: ApiErrorCode) {
    super(message);
    this.name = "IpInfoError";
    this.errorCode = errorCode;
  }
}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? `リクエストに失敗しました。（${res.status}）`;
    throw new IpInfoError(message, body?.errorCode);
  }
  return res.json() as Promise<T>;
}

export function fetchSelfInfo(): Promise<SelfInfoResponse> {
  const params = new URLSearchParams({ mode: "self" });
  return request<SelfInfoResponse>(`/api/ip-info?${params.toString()}`);
}

export function fetchLookup(ip: string): Promise<LookupResponse> {
  const params = new URLSearchParams({ mode: "lookup", ip });
  return request<LookupResponse>(`/api/ip-info?${params.toString()}`);
}
