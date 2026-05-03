export type UrlValidation =
  | { ok: true; url: URL }
  | { ok: false; errorCode: "invalid_url" | "blocked_url"; message: string };

const IPV4_PATTERN = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;

export function validateRequestUrl(input: string): UrlValidation {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: false,
      errorCode: "invalid_url",
      message: "URLを入力してください。",
    };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return {
      ok: false,
      errorCode: "invalid_url",
      message: "URLの形式が正しくありません。",
    };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      errorCode: "invalid_url",
      message: "http または https のURLのみ送信できます。",
    };
  }

  const hostname = normalizeHostname(url.hostname);
  if (isBlockedHost(hostname)) {
    return {
      ok: false,
      errorCode: "blocked_url",
      message: "ローカル/プライベートネットワークへのリクエストは送信できません。",
    };
  }

  return { ok: true, url };
}

function normalizeHostname(host: string): string {
  if (host.startsWith("[") && host.endsWith("]")) {
    return host.slice(1, -1).toLowerCase();
  }
  return host.toLowerCase();
}

function isBlockedHost(host: string): boolean {
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;

  if (IPV4_PATTERN.test(host)) {
    return isBlockedIpv4(host);
  }

  if (host.includes(":")) {
    return isBlockedIpv6(host);
  }

  return false;
}

function isBlockedIpv4(host: string): boolean {
  const [a, b] = host.split(".").map((n) => Number.parseInt(n, 10));
  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;
  return false;
}

function isBlockedIpv6(host: string): boolean {
  if (host === "::" || host === "::1") return true;
  if (host.startsWith("fe80:") || host.startsWith("fe80::")) return true;
  const head = host.slice(0, 2);
  if (head === "fc" || head === "fd") return true;
  // IPv4-mapped IPv6 (::ffff:*) — block all forms regardless of mapped value
  if (host.startsWith("::ffff:")) return true;
  return false;
}
