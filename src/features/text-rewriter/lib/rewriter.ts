import type { ApiErrorCode, RewriteMode, RewriteRequest, RewriteResponse } from "./types";

export class RewriteError extends Error {
  readonly errorCode: ApiErrorCode | undefined;

  constructor(message: string, errorCode?: ApiErrorCode) {
    super(message);
    this.name = "RewriteError";
    this.errorCode = errorCode;
  }
}

export const REWRITE_MODE_OPTIONS: { value: RewriteMode; label: string }[] = [
  { value: "casual-to-business", label: "カジュアル → ビジネス敬語" },
  { value: "business-to-casual", label: "ビジネス敬語 → カジュアル" },
  { value: "ja-to-en", label: "日本語 → 英語" },
  { value: "en-to-ja", label: "英語 → 日本語" },
  { value: "summarize", label: "要約" },
  { value: "proofread", label: "校正" },
];

export const PROMPT_MAP: Record<RewriteMode, string> = {
  "casual-to-business":
    "You are a business writing expert. Rewrite the following casual text into formal business language. IMPORTANT: Keep the same language as the input. If the input is in English, output in formal English. If the input is in Japanese, output in Japanese keigo (敬語). Do not translate. Only change the tone, not the meaning. Output only the result, nothing else.",
  "business-to-casual":
    "You are a skilled writer. Rewrite the following formal/business text into a casual, friendly tone. IMPORTANT: Keep the same language as the input. If the input is in English, output in casual English. If the input is in Japanese, output in casual Japanese. Do not translate. Only change the tone, not the meaning. Output only the result, nothing else.",
  "ja-to-en":
    "You are a professional Japanese-to-English translator. Translate the following Japanese text into natural, fluent English. Preserve the original meaning, tone, and nuance. Output only the English translation, nothing else.",
  "en-to-ja":
    "あなたはプロの英日翻訳者です。以下の英語テキストを自然で流暢な日本語に翻訳してください。原文の意味、トーン、ニュアンスを保持してください。翻訳結果のみを出力してください。",
  summarize:
    "You are an expert summarizer. Summarize the following text concisely. IMPORTANT: Output the summary in the same language as the input text. If the input is in English, summarize in English. If the input is in Japanese, summarize in Japanese. Output only the summary, nothing else.",
  proofread:
    "You are an expert proofreader. Fix any typos, grammatical errors, and awkward phrasing in the following text. IMPORTANT: Keep the same language as the input text. Do not translate. Output only the corrected text, nothing else.",
};

export function getSystemInstruction(mode: RewriteMode): string {
  return PROMPT_MAP[mode];
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export const MAX_LENGTH = 5000;

export function validateInput(text: string): ValidationResult {
  if (text.trim().length === 0) {
    return { valid: false, error: "テキストを入力してください。" };
  }
  if (text.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `テキストは${MAX_LENGTH}文字以内で入力してください。（現在: ${text.length}文字）`,
    };
  }
  return { valid: true };
}

export async function rewriteText(
  request: RewriteRequest
): Promise<RewriteResponse> {
  const res = await fetch("/api/text-rewriter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? `変換に失敗しました。（${res.status}）`;
    throw new RewriteError(message, body?.errorCode);
  }

  return res.json();
}
