import type { OutputValidationOptions, ValidationResult } from "./types";

const DEFAULT_MAX_LENGTH = 10000;
const MIN_FRAGMENT_LENGTH = 20;

/**
 * AIモデルの出力をバリデーションする
 * - 空出力チェック
 * - 長さ上限チェック
 * - システムプロンプト漏洩検知
 */
export function validateOutput(
  output: string,
  options?: OutputValidationOptions
): ValidationResult {
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH;

  if (output.trim().length === 0) {
    return { valid: false, error: "AIモデルから空の応答が返されました。" };
  }

  if (output.length > maxLength) {
    return {
      valid: false,
      error: "AIモデルの応答が長すぎます。",
    };
  }

  const fragments = options?.systemPromptFragments ?? [];
  for (const fragment of fragments) {
    if (fragment.length >= MIN_FRAGMENT_LENGTH && output.includes(fragment)) {
      return {
        valid: false,
        error: "AIモデルの応答に不正な内容が検出されました。",
      };
    }
  }

  return { valid: true };
}
