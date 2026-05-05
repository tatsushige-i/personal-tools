export const DEPTHS = [1, 2] as const;
export type Depth = (typeof DEPTHS)[number];

export const DEPTH_LABELS: Record<Depth, string> = {
  1: "1階層のみ",
  2: "2階層まで",
};

export const LINK_STATUSES = [
  "ok",
  "redirect",
  "client-error",
  "server-error",
  "network-error",
  "timeout",
  "blocked",
] as const;
export type LinkStatus = (typeof LINK_STATUSES)[number];

export const LINK_STATUS_LABELS: Record<LinkStatus, string> = {
  ok: "OK",
  redirect: "リダイレクト",
  "client-error": "クライアントエラー",
  "server-error": "サーバーエラー",
  "network-error": "到達不能",
  timeout: "タイムアウト",
  blocked: "ブロック",
};

export type LinkResult = {
  url: string;
  statusCode: number | null;
  status: LinkStatus;
  isInternal: boolean;
  durationMs: number;
  sourcePage: string;
};

export type CheckerOptions = {
  url: string;
  depth: Depth;
};

export type CheckerResponse = {
  url: string;
  depth: Depth;
  links: LinkResult[];
  totalFound: number;
  totalChecked: number;
  truncated: boolean;
  durationMs: number;
};

export type CheckerError = {
  error: string;
  errorCode: string;
};

export const MAX_LINKS_TO_CHECK = 200;
export const REQUEST_CONCURRENCY = 5;
export const LINK_REQUEST_TIMEOUT_MS = 10_000;
export const NAVIGATION_TIMEOUT_MS = 20_000;

export function isDepth(value: unknown): value is Depth {
  return typeof value === "number" && (DEPTHS as readonly number[]).includes(value);
}

export function classifyStatus(statusCode: number): LinkStatus {
  if (statusCode >= 200 && statusCode < 300) return "ok";
  if (statusCode >= 300 && statusCode < 400) return "redirect";
  if (statusCode >= 400 && statusCode < 500) return "client-error";
  return "server-error";
}

export function isErrorStatus(status: LinkStatus): boolean {
  return (
    status === "client-error" ||
    status === "server-error" ||
    status === "network-error" ||
    status === "timeout" ||
    status === "blocked"
  );
}
