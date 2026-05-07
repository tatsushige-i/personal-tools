export type IndentSize = 2 | 4;
export type ViewMode = "formatted" | "tree";

export type JsonParseError = {
  message: string;
  line: number | null;
  column: number | null;
};

export type JsonParseResult =
  | { success: true; data: unknown }
  | { success: false; error: JsonParseError };

export type JsonTransformApiErrorCode =
  | "PROMPT_INJECTION_DETECTED"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR";

export type JsonTransformRequest = {
  json: string;
  instruction: string;
};

export type JsonTransformResponse = {
  result: string;
};
