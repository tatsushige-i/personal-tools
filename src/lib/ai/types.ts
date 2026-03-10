export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export type SanitizeOptions = {
  /** 入力テキストの最大文字数（デフォルト: 5000） */
  maxLength?: number;
};

export type PromptBuilderOptions = {
  /** ベースとなるシステムプロンプト */
  systemPrompt: string;
  /** anti-injection armorを付加するか（デフォルト: true） */
  antiInjection?: boolean;
};

export type OutputValidationOptions = {
  /** 出力テキストの最大文字数（デフォルト: 10000） */
  maxLength?: number;
  /** システムプロンプトの断片（漏洩検知用、20文字以上の文字列のみチェック対象） */
  systemPromptFragments?: string[];
};
