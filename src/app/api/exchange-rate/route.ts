import { NextResponse } from "next/server";
import { createRateLimit } from "@/lib/rate-limit";
import { getClientIp, rateLimitResponse } from "@/lib/api-helpers";
import type {
  CurrencyMap,
  LatestRates,
  Timeseries,
} from "@/features/exchange-rate-calculator/lib/types";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";
const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TARGETS = 10;
const MAX_RANGE_DAYS = 366;

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

  if (mode === "currencies") {
    return handleCurrencies();
  }
  if (mode === "latest") {
    return handleLatest(searchParams);
  }
  if (mode === "timeseries") {
    return handleTimeseries(searchParams);
  }
  return NextResponse.json(
    {
      error: "mode は currencies / latest / timeseries のいずれかを指定してください。",
      errorCode: "VALIDATION_ERROR",
    },
    { status: 400 }
  );
}

async function handleCurrencies(): Promise<Response> {
  const url = new URL(`${FRANKFURTER_BASE_URL}/currencies`);

  const upstream = await fetchUpstream(url, "通貨一覧の取得に失敗しました。");
  if (!upstream.ok) return upstream.errorResponse;

  const raw = (await upstream.response.json()) as CurrencyMap;
  return NextResponse.json(raw);
}

async function handleLatest(params: URLSearchParams): Promise<Response> {
  const from = params.get("from")?.toUpperCase() ?? "";
  const toRaw = params.get("to")?.toUpperCase() ?? "";

  if (!CURRENCY_CODE_PATTERN.test(from)) {
    return validationError("from は3文字の通貨コードを指定してください。");
  }

  const targets = toRaw.split(",").map((s) => s.trim()).filter(Boolean);
  if (targets.length === 0 || targets.length > MAX_TARGETS) {
    return validationError(
      `to は1〜${MAX_TARGETS}個の通貨コードをカンマ区切りで指定してください。`
    );
  }
  if (targets.some((t) => !CURRENCY_CODE_PATTERN.test(t))) {
    return validationError("to に不正な通貨コードが含まれています。");
  }
  if (targets.includes(from)) {
    return validationError("from と同じ通貨を to に含めることはできません。");
  }

  const url = new URL(`${FRANKFURTER_BASE_URL}/latest`);
  url.searchParams.set("from", from);
  url.searchParams.set("to", targets.join(","));

  const upstream = await fetchUpstream(url, "為替レートの取得に失敗しました。");
  if (!upstream.ok) return upstream.errorResponse;

  const raw = (await upstream.response.json()) as FrankfurterLatestResponse;
  const response: LatestRates = {
    base: raw.base,
    date: raw.date,
    rates: raw.rates,
  };
  return NextResponse.json(response);
}

async function handleTimeseries(params: URLSearchParams): Promise<Response> {
  const from = params.get("from")?.toUpperCase() ?? "";
  const to = params.get("to")?.toUpperCase() ?? "";
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";

  if (!CURRENCY_CODE_PATTERN.test(from) || !CURRENCY_CODE_PATTERN.test(to)) {
    return validationError("from / to は3文字の通貨コードを指定してください。");
  }
  if (from === to) {
    return validationError("from と to は異なる通貨を指定してください。");
  }
  if (!DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) {
    return validationError("start / end は YYYY-MM-DD 形式で指定してください。");
  }

  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    return validationError("start / end の日付が不正です。");
  }
  const rangeDays = Math.floor((endMs - startMs) / 86_400_000);
  if (rangeDays > MAX_RANGE_DAYS) {
    return validationError(
      `期間は最大${MAX_RANGE_DAYS}日までを指定してください。`
    );
  }

  const url = new URL(`${FRANKFURTER_BASE_URL}/${start}..${end}`);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);

  const upstream = await fetchUpstream(url, "レート推移の取得に失敗しました。");
  if (!upstream.ok) return upstream.errorResponse;

  const raw = (await upstream.response.json()) as FrankfurterTimeseriesResponse;
  const points = Object.entries(raw.rates ?? {})
    .map(([date, rateMap]) => ({
      date,
      rate: rateMap?.[to] ?? Number.NaN,
    }))
    .filter((p) => Number.isFinite(p.rate))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const response: Timeseries = {
    base: raw.base,
    target: to,
    start: raw.start_date ?? start,
    end: raw.end_date ?? end,
    points,
  };
  return NextResponse.json(response);
}

type UpstreamResult =
  | { ok: true; response: Response }
  | { ok: false; errorResponse: Response };

async function fetchUpstream(url: URL, failureMessage: string): Promise<UpstreamResult> {
  let upstream: Response;
  try {
    upstream = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        { error: "為替レートサービスに接続できませんでした。", errorCode: "UPSTREAM_ERROR" },
        { status: 502 }
      ),
    };
  }

  if (!upstream.ok) {
    if (upstream.status >= 400 && upstream.status < 500) {
      const body = await upstream.json().catch(() => null);
      const message =
        typeof body === "object" && body !== null && "message" in body
          ? String((body as { message?: unknown }).message ?? failureMessage)
          : failureMessage;
      return {
        ok: false,
        errorResponse: NextResponse.json(
          { error: message, errorCode: "VALIDATION_ERROR" },
          { status: 400 }
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

function validationError(message: string): Response {
  return NextResponse.json(
    { error: message, errorCode: "VALIDATION_ERROR" },
    { status: 400 }
  );
}

type FrankfurterLatestResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

type FrankfurterTimeseriesResponse = {
  amount: number;
  base: string;
  start_date?: string;
  end_date?: string;
  rates?: Record<string, Record<string, number>>;
};
