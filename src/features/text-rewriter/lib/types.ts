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
