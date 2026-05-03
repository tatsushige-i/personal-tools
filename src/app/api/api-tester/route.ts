import { NextResponse } from "next/server";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import { validateRequestUrl } from "@/features/api-tester/lib/url-validator";
import { HTTP_METHODS, type HttpMethod } from "@/features/api-tester/lib/types";

const rateLimit = createRateLimit({ limit: 30, windowMs: 60_000 });

const TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 1_000_000;

const FORBIDDEN_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "upgrade",
  "expect",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
]);

type RequestBody = {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string | null;
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

  const method = (payload.method ?? "GET").toUpperCase();
  if (!isHttpMethod(method)) {
    return errorResponse(400, "VALIDATION_ERROR", "サポートされていないHTTPメソッドです。");
  }

  const validation = validateRequestUrl(payload.url ?? "");
  if (!validation.ok) {
    return errorResponse(400, validation.errorCode.toUpperCase(), validation.message);
  }

  const headers = sanitizeHeaders(payload.headers ?? {});
  const body = methodAllowsBody(method) ? (payload.body ?? null) : null;

  const start = performance.now();
  let upstream: Response;
  try {
    upstream = await fetch(validation.url, {
      method,
      headers,
      body,
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    const isTimeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return errorResponse(
      isTimeout ? 504 : 502,
      isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      isTimeout
        ? `リクエストが${TIMEOUT_MS / 1000}秒以内に完了しませんでした。`
        : "リクエスト先に接続できませんでした。"
    );
  }

  const { text, truncated } = await readBodyLimited(upstream);
  const durationMs = Math.round(performance.now() - start);

  return NextResponse.json({
    status: upstream.status,
    statusText: upstream.statusText,
    headers: headersToObject(upstream.headers),
    body: text,
    truncated,
    durationMs,
  });
}

function isHttpMethod(value: string): value is HttpMethod {
  return (HTTP_METHODS as readonly string[]).includes(value);
}

function methodAllowsBody(method: HttpMethod): boolean {
  return method !== "GET" && method !== "DELETE";
}

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof key !== "string" || typeof value !== "string") continue;
    const trimmedKey = key.trim();
    if (!trimmedKey) continue;
    if (FORBIDDEN_HEADERS.has(trimmedKey.toLowerCase())) continue;
    result[trimmedKey] = value;
  }
  return result;
}

async function readBodyLimited(response: Response): Promise<{ text: string; truncated: boolean }> {
  if (!response.body) {
    return { text: "", truncated: false };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    if (received + value.byteLength > MAX_BODY_BYTES) {
      const remaining = MAX_BODY_BYTES - received;
      if (remaining > 0) {
        chunks.push(value.slice(0, remaining));
        received = MAX_BODY_BYTES;
      }
      truncated = true;
      await reader.cancel().catch(() => {});
      break;
    }
    chunks.push(value);
    received += value.byteLength;
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(merged);
  return { text, truncated };
}

function headersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

function errorResponse(status: number, errorCode: string, message: string): Response {
  return NextResponse.json({ error: message, errorCode }, { status });
}
