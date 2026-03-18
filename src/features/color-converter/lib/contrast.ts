import type { RGB, ContrastResult } from "./types";
import { hexToRgb } from "./color-conversions";

/** Calculate relative luminance per WCAG 2.1 */
export function relativeLuminance(rgb: RGB): number {
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** Calculate contrast ratio between two RGB colors */
export function contrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Calculate full contrast result from two hex strings */
export function calculateContrast(hex1: string, hex2: string): ContrastResult {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) {
    return {
      ratio: 1,
      ratioText: "1.00:1",
      aa: false,
      aaLarge: false,
      aaa: false,
      aaaLarge: false,
    };
  }
  const ratio = contrastRatio(rgb1, rgb2);
  const rounded = Math.round(ratio * 100) / 100;

  return {
    ratio: rounded,
    ratioText: `${rounded.toFixed(2)}:1`,
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}
