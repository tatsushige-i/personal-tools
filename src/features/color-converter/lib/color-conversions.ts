import type { RGB, HSL, ColorValue } from "./types";
import { TAILWIND_COLORS, hexToTailwind } from "./tailwind-colors";

/** Parse 3-digit or 6-digit HEX (with or without #) to RGB */
export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, "");
  let r: number, g: number, b: number;

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb);
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/** Create a full ColorValue from a hex string. Returns null for invalid input. */
export function createColorValue(hex: string): ColorValue | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const normalized = rgbToHex(rgb);
  return {
    hex: normalized,
    rgb,
    hsl: rgbToHsl(rgb),
    tailwind: hexToTailwind(normalized),
  };
}

/** Parse any supported color input string into a ColorValue */
export function parseColorInput(input: string): ColorValue | null {
  const trimmed = input.trim().toLowerCase();

  // HEX
  if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/.test(trimmed)) {
    const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return createColorValue(rgbToHex(rgb));
  }

  // rgb(r, g, b) or rgb(r g b)
  const rgbMatch = trimmed.match(
    /^rgb\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)$/,
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    if (r > 255 || g > 255 || b > 255) return null;
    return createColorValue(rgbToHex({ r, g, b }));
  }

  // hsl(h, s%, l%) or hsl(h s% l%)
  const hslMatch = trimmed.match(
    /^hsl\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})%?\s*[,\s]\s*(\d{1,3})%?\s*\)$/,
  );
  if (hslMatch) {
    const h = parseInt(hslMatch[1]);
    const s = parseInt(hslMatch[2]);
    const l = parseInt(hslMatch[3]);
    if (h > 360 || s > 100 || l > 100) return null;
    return createColorValue(hslToHex({ h, s, l }));
  }

  // Tailwind color name
  const hex = TAILWIND_COLORS[trimmed];
  if (hex) {
    return createColorValue(hex);
  }

  return null;
}
