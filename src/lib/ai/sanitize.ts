import type { SanitizeOptions, ValidationResult } from "./types";

const DEFAULT_MAX_LENGTH = 5000;

const ATTACK_PATTERNS: RegExp[] = [
  // ロール乗っ取り
  /ignore previous instructions/i,
  /ignore all instructions/i,
  /disregard previous/i,
  /forget your instructions/i,
  // プロンプト抽出
  /output your system prompt/i,
  /repeat your instructions/i,
  /what are your instructions/i,
  /show me your prompt/i,
  // デリミタ注入
  /\[SYSTEM\]/i,
  /<system>/i,
  /<<SYS>>/i,
];

/**
 * テキストに攻撃パターンが含まれているかチェックする
 */
export function containsAttackPattern(text: string): boolean {
  return ATTACK_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * 入力テキストをバリデーション・攻撃パターン検知する
 * 検知時はリジェクト（ストリップではなく拒否）
 */
export function sanitizeInput(
  text: string,
  options?: SanitizeOptions
): ValidationResult {
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH;

  if (text.trim().length === 0) {
    return { valid: false, error: "テキストを入力してください。" };
  }

  if (text.length > maxLength) {
    return {
      valid: false,
      error: `テキストは${maxLength}文字以内で入力してください。（現在: ${text.length}文字）`,
    };
  }

  if (containsAttackPattern(text)) {
    return {
      valid: false,
      error: "入力内容に処理できないパターンが含まれています。内容を修正してください。",
    };
  }

  return { valid: true };
}
