import type { SanitizeOptions, ValidationResult } from "./types";

const DEFAULT_MAX_LENGTH = 5000;

// ロール乗っ取り（英語）
const ROLE_HIJACKING_PATTERNS: RegExp[] = [
  /ignore previous instructions/i,
  /ignore all instructions/i,
  /disregard previous/i,
  /forget your instructions/i,
];

// プロンプト抽出（英語）
const PROMPT_EXTRACTION_PATTERNS: RegExp[] = [
  /output your system prompt/i,
  /repeat your instructions/i,
  /what are your instructions/i,
  /show me your prompt/i,
];

// デリミタ・構造的パターン注入
const DELIMITER_INJECTION_PATTERNS: RegExp[] = [
  /\[SYSTEM\]/i,
  /<system>/i,
  /<<SYS>>/i,
  // チャットテンプレートトークン
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<\|endoftext\|>/i,
  // ロールマーカー
  /\[INST\]/i,
  /\[\/INST\]/i,
  /###\s*system/i,
  /###\s*user/i,
  /###\s*assistant/i,
];

// 多言語パターン（指示無視系・プロンプト抽出系）
const MULTILINGUAL_PATTERNS: RegExp[] = [
  // 日本語
  /前の指示を無視/,
  /指示を忘れて/,
  /指示を無視/,
  /システムプロンプトを(表示|出力|教えて)/,
  // 中国語（簡体字）
  /忽略之前的指[令示]/,
  /忽略所有指[令示]/,
  /忘记你的指[令示]/,
  /显示系统提示/,
  /输出系统提示/,
  // 中国語（繁体字）
  /忽略之前的指[令示]/,
  /忽略所有指[令示]/,
  /忘記你的指[令示]/,
  /顯示系統提示/,
  /輸出系統提示/,
  // 韓国語
  /이전\s*지시를?\s*무시/,
  /모든\s*지시를?\s*무시/,
  /지시를?\s*잊어/,
  /시스템\s*프롬프트를?\s*(보여|출력|표시)/,
  // スペイン語
  /ignora las instrucciones anteriores/i,
  /ignora todas las instrucciones/i,
  /olvida tus instrucciones/i,
  /muestra el prompt del sistema/i,
  // フランス語
  /ignore les instructions pr[ée]c[ée]dentes/i,
  /ignore toutes les instructions/i,
  /oublie tes instructions/i,
  /affiche le prompt syst[èe]me/i,
  // ドイツ語
  /ignoriere die vorherigen anweisungen/i,
  /ignoriere alle anweisungen/i,
  /vergiss deine anweisungen/i,
  /zeig mir den system[- ]?prompt/i,
  // ロシア語
  /игнорируй предыдущие инструкции/i,
  /игнорируй все инструкции/i,
  /забудь свои инструкции/i,
  /покажи системный промпт/i,
  // アラビア語
  /تجاهل التعليمات السابقة/,
  /تجاهل كل التعليمات/,
  /انسَ تعليماتك/,
  /أظهر موجه النظام/,
];

const ATTACK_PATTERNS: RegExp[] = [
  ...ROLE_HIJACKING_PATTERNS,
  ...PROMPT_EXTRACTION_PATTERNS,
  ...DELIMITER_INJECTION_PATTERNS,
  ...MULTILINGUAL_PATTERNS,
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
