import type { Base64Result } from "./types";

/**
 * テキストをBase64エンコードする（UTF-8対応）
 */
export function encodeText(input: string, urlSafe: boolean): Base64Result {
  try {
    const bytes = new TextEncoder().encode(input);
    let base64 = bytesToBase64(bytes);
    if (urlSafe) {
      base64 = toUrlSafe(base64);
    }
    return { success: true, data: base64 };
  } catch {
    return { success: false, error: "エンコードに失敗しました" };
  }
}

/**
 * Base64をテキストにデコードする（UTF-8対応）
 */
export function decodeText(input: string, urlSafe: boolean): Base64Result {
  try {
    let base64 = input;
    if (urlSafe) {
      base64 = fromUrlSafe(base64);
    }
    const binaryStr = atob(base64);
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { success: true, data: text };
  } catch {
    return { success: false, error: "無効なBase64文字列です" };
  }
}

/**
 * Uint8ArrayをBase64エンコードする
 */
export function encodeBytes(bytes: Uint8Array, urlSafe: boolean): string {
  let base64 = bytesToBase64(bytes);
  if (urlSafe) {
    base64 = toUrlSafe(base64);
  }
  return base64;
}

/**
 * Data URIを生成する
 */
export function buildDataUri(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Data URIをパースする
 */
export function parseDataUri(
  dataUri: string
): { mimeType: string; base64: string } | null {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

/**
 * Base64文字列からマジックバイトで画像MIMEタイプを検出する
 */
export function detectImageMimeType(base64: string): string | null {
  try {
    const binaryStr = atob(base64.slice(0, 24));
    const bytes = Uint8Array.from(binaryStr, (c) => c.charCodeAt(0));

    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return "image/png";
    }
    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image/jpeg";
    }
    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return "image/gif";
    }
    // WebP: 52 49 46 46 ... 57 45 42 50
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return "image/webp";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 有効なBase64文字列かチェックする
 */
export function isValidBase64(input: string, urlSafe: boolean): boolean {
  if (input.length === 0) return true;
  if (urlSafe) {
    return /^[A-Za-z0-9_-]+$/.test(input) && input.length % 4 !== 1;
  }
  return /^[A-Za-z0-9+/]+={0,2}$/.test(input) && input.length % 4 === 0;
}

// --- Internal helpers ---

function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 8192;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    chunks.push(String.fromCharCode.apply(null, chunk as unknown as number[]));
  }
  return btoa(chunks.join(""));
}

function toUrlSafe(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(urlSafe: string): string {
  let base64 = urlSafe.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  return base64;
}
