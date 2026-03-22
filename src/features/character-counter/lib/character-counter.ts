import type { CountStats, Platform } from "./types";

export function getByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function isFullWidth(char: string): boolean {
  const code = char.codePointAt(0);
  if (code === undefined) return false;
  return (
    (code >= 0x1100 && code <= 0x11ff) || // Hangul Jamo
    (code >= 0x2e80 && code <= 0x2eff) || // CJK Radicals Supplement
    (code >= 0x2f00 && code <= 0x2fdf) || // Kangxi Radicals
    (code >= 0x2ff0 && code <= 0x2fff) || // Ideographic Description Characters
    (code >= 0x3000 && code <= 0x303f) || // CJK Symbols and Punctuation
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) || // Katakana
    (code >= 0x3100 && code <= 0x312f) || // Bopomofo
    (code >= 0x3130 && code <= 0x318f) || // Hangul Compatibility Jamo
    (code >= 0x3190 && code <= 0x319f) || // Kanbun
    (code >= 0x31a0 && code <= 0x31bf) || // Bopomofo Extended
    (code >= 0x31f0 && code <= 0x31ff) || // Katakana Phonetic Extensions
    (code >= 0x3200 && code <= 0x32ff) || // Enclosed CJK Letters and Months
    (code >= 0x3300 && code <= 0x33ff) || // CJK Compatibility
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0xa000 && code <= 0xa48f) || // Yi Syllables
    (code >= 0xa490 && code <= 0xa4cf) || // Yi Radicals
    (code >= 0xac00 && code <= 0xd7af) || // Hangul Syllables
    (code >= 0xf900 && code <= 0xfaff) || // CJK Compatibility Ideographs
    (code >= 0xfe10 && code <= 0xfe1f) || // Vertical Forms
    (code >= 0xfe30 && code <= 0xfe4f) || // CJK Compatibility Forms
    (code >= 0xfe50 && code <= 0xfe6f) || // Small Form Variants
    (code >= 0xff00 && code <= 0xff60) || // Fullwidth Forms
    (code >= 0xffe0 && code <= 0xffe6) || // Fullwidth Signs
    (code >= 0x1b000 && code <= 0x1b0ff) || // Kana Supplement
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Unified Ideographs Extension B
    (code >= 0x2a700 && code <= 0x2b73f) || // CJK Unified Ideographs Extension C
    (code >= 0x2b740 && code <= 0x2b81f) || // CJK Unified Ideographs Extension D
    (code >= 0x2b820 && code <= 0x2ceaf) || // CJK Unified Ideographs Extension E
    (code >= 0x2ceb0 && code <= 0x2ebef) || // CJK Unified Ideographs Extension F
    (code >= 0x2f800 && code <= 0x2fa1f) // CJK Compatibility Ideographs Supplement
  );
}

export function countText(text: string): CountStats {
  if (text.length === 0) {
    return {
      total: 0,
      totalExcludingSpaces: 0,
      lines: 0,
      bytes: 0,
      fullWidth: 0,
      halfWidth: 0,
    };
  }

  const chars = [...text]; // spread to handle surrogate pairs
  const total = chars.length;
  const totalExcludingSpaces = chars.filter((c) => !/[\s]/.test(c)).length;
  const lines = text.split("\n").length;
  const bytes = getByteLength(text);

  let fullWidth = 0;
  let halfWidth = 0;
  for (const char of chars) {
    if (isFullWidth(char)) {
      fullWidth++;
    } else {
      halfWidth++;
    }
  }

  return { total, totalExcludingSpaces, lines, bytes, fullWidth, halfWidth };
}

export const PLATFORMS: Platform[] = [
  { name: "Twitter / X", limit: 280 },
  { name: "SMS", limit: 160 },
  { name: "LINE", limit: 10000 },
  { name: "Slack", limit: 40000 },
];
