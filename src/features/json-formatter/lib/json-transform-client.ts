import type {
  JsonTransformApiErrorCode,
  JsonTransformRequest,
  JsonTransformResponse,
} from "./types";

export const SYSTEM_INSTRUCTION =
  "あなたはJSONデータ変換アシスタントです。ユーザーが提供するJSON入力と変換指示に従い、変換結果のみを出力してください。説明文・前置き・コードフェンス（```）は付けないでください。指示がJSON入力と無関係、または変換不可能な場合は『指示を解釈できません』とだけ返してください。";

export const MAX_INSTRUCTION_LENGTH = 5000;
export const MAX_JSON_LENGTH = 20000;

export const TRANSFORM_PRESETS: { label: string; instruction: string }[] = [
  { label: "TypeScript の型定義に変換", instruction: "このJSONに対応するTypeScriptの型定義（type宣言）を出力してください。" },
  { label: "CSV に変換", instruction: "このJSONをCSV形式に変換してください。配列の各要素を1行とし、ヘッダー行を含めてください。" },
  { label: "キー名を camelCase に変換", instruction: "JSONの構造を保ったまま、すべてのキー名をcamelCaseに変換したJSONを出力してください。" },
];

export class JsonTransformError extends Error {
  readonly errorCode: JsonTransformApiErrorCode | undefined;

  constructor(message: string, errorCode?: JsonTransformApiErrorCode) {
    super(message);
    this.name = "JsonTransformError";
    this.errorCode = errorCode;
  }
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateInstructionInput(
  instruction: string,
  json: string
): ValidationResult {
  if (instruction.trim().length === 0) {
    return { valid: false, error: "変換指示を入力してください。" };
  }
  if (instruction.length > MAX_INSTRUCTION_LENGTH) {
    return {
      valid: false,
      error: `変換指示は${MAX_INSTRUCTION_LENGTH}文字以内で入力してください。（現在: ${instruction.length}文字）`,
    };
  }
  if (json.trim().length === 0) {
    return { valid: false, error: "変換対象のJSONを入力してください。" };
  }
  if (json.length > MAX_JSON_LENGTH) {
    return {
      valid: false,
      error: `JSONは${MAX_JSON_LENGTH}文字以内で入力してください。（現在: ${json.length}文字）`,
    };
  }
  try {
    JSON.parse(json);
  } catch {
    return { valid: false, error: "JSONとして解釈できない入力です。" };
  }
  return { valid: true };
}

export async function transformJson(
  request: JsonTransformRequest
): Promise<JsonTransformResponse> {
  const res = await fetch("/api/json-formatter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error ?? `変換に失敗しました。（${res.status}）`;
    throw new JsonTransformError(message, body?.errorCode);
  }

  return res.json();
}
