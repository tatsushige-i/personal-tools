export type ApiErrorCode =
  | "PROMPT_INJECTION_DETECTED"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export type RewriteMode =
  | "casual-to-business"
  | "business-to-casual"
  | "ja-to-en"
  | "en-to-ja"
  | "summarize"
  | "proofread";

export type RewriteRequest = {
  text: string;
  mode: RewriteMode;
};

export type RewriteResponse = {
  result: string;
};
