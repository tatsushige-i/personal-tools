import { NextResponse } from "next/server";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import type { IpInfo, IpVersion } from "@/features/ip-info-viewer/lib/types";

const IPAPI_BASE = "https://ipapi.co";
const USER_AGENT = "personal-tools";

const IPV4_PATTERN = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

const ALLOWED_HEADERS = [
  "user-agent",
  "accept",
  "accept-language",
  "accept-encoding",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "dnt",
  "upgrade-insecure-requests",
  "referer",
  "connection",
] as const;

const rateLimit = createRateLimit({ limit: 30, windowMs: 60_000 });

export async function GET(request: Request) {
  const ip = getClientIp(request);
  if (ip !== "unknown") {
    const result = rateLimit.check(ip);
    if (!result.allowed) {
      return rateLimitResponse(result.retryAfterMs);
    }
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  if (mode === "self") {
    return handleSelf(request, ip);
  }
  if (mode === "lookup") {
    return handleLookup(searchParams);
  }
  return validationError("mode は self / lookup のいずれかを指定してください。");
}

async function handleSelf(request: Request, clientIp: string): Promise<Response> {
  const url =
    clientIp !== "unknown" && isValidIp(clientIp) && !isReservedIp(clientIp)
      ? new URL(`${IPAPI_BASE}/${clientIp}/json/`)
      : new URL(`${IPAPI_BASE}/json/`);

  const upstream = await fetchUpstream(url, "IP情報の取得に失敗しました。");
  if (!upstream.ok) return upstream.errorResponse;

  const raw = (await upstream.response.json()) as IpapiResponse;
  if (raw.error) {
    return validationError(raw.reason ?? "IPアドレス情報を取得できませんでした。");
  }

  const headers = pickHeaders(request.headers);
  return NextResponse.json({ geo: toIpInfo(raw), headers });
}

async function handleLookup(params: URLSearchParams): Promise<Response> {
  const ip = (params.get("ip") ?? "").trim();
  if (!isValidIp(ip)) {
    return validationError("IPアドレスの形式が正しくありません。");
  }

  const url = new URL(`${IPAPI_BASE}/${ip}/json/`);
  const upstream = await fetchUpstream(url, "IP情報の取得に失敗しました。");
  if (!upstream.ok) return upstream.errorResponse;

  const raw = (await upstream.response.json()) as IpapiResponse;
  if (raw.error) {
    return validationError(raw.reason ?? "IPアドレス情報を取得できませんでした。");
  }

  return NextResponse.json({ geo: toIpInfo(raw) });
}

type UpstreamResult =
  | { ok: true; response: Response }
  | { ok: false; errorResponse: Response };

async function fetchUpstream(
  url: URL,
  failureMessage: string
): Promise<UpstreamResult> {
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
    });
  } catch {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        { error: "IP情報サービスに接続できませんでした。", errorCode: "UPSTREAM_ERROR" },
        { status: 502 }
      ),
    };
  }

  if (!upstream.ok) {
    if (upstream.status === 429) {
      return {
        ok: false,
        errorResponse: NextResponse.json(
          {
            error: "IP情報サービスのレート制限に達しました。しばらく経ってから再度お試しください。",
            errorCode: "RATE_LIMITED",
          },
          { status: 429 }
        ),
      };
    }
    return {
      ok: false,
      errorResponse: NextResponse.json(
        { error: failureMessage, errorCode: "UPSTREAM_ERROR" },
        { status: 502 }
      ),
    };
  }

  return { ok: true, response: upstream };
}

function isValidIp(value: string): boolean {
  return IPV4_PATTERN.test(value) || (value.includes(":") && IPV6_PATTERN.test(value));
}

function isReservedIp(value: string): boolean {
  if (value === "::1" || value.startsWith("fe80:") || value.startsWith("fc") || value.startsWith("fd")) {
    return true;
  }
  const parts = value.split(".").map((n) => Number.parseInt(n, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function pickHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of ALLOWED_HEADERS) {
    const value = headers.get(name);
    if (value) {
      result[name] = value;
    }
  }
  return result;
}

function toIpInfo(raw: IpapiResponse): IpInfo {
  const version = normalizeVersion(raw.version);
  return {
    ip: raw.ip ?? "",
    version,
    city: raw.city ?? null,
    region: raw.region ?? null,
    countryCode: raw.country_code ?? raw.country ?? null,
    countryName: raw.country_name ?? null,
    postal: raw.postal ?? null,
    latitude: typeof raw.latitude === "number" ? raw.latitude : null,
    longitude: typeof raw.longitude === "number" ? raw.longitude : null,
    timezone: raw.timezone ?? null,
    utcOffset: raw.utc_offset ?? null,
    org: raw.org ?? null,
    asn: raw.asn ?? null,
  };
}

function normalizeVersion(value: string | undefined): IpVersion | null {
  if (value === "IPv4" || value === "IPv6") return value;
  return null;
}

function validationError(message: string): Response {
  return NextResponse.json(
    { error: message, errorCode: "VALIDATION_ERROR" },
    { status: 400 }
  );
}

type IpapiResponse = {
  ip?: string;
  version?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  country_name?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  org?: string;
  asn?: string;
  error?: boolean;
  reason?: string;
};
