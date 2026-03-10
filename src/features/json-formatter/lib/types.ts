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
