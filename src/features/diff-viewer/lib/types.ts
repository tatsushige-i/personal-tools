export type DiffMode = "line" | "word";
export type InputMode = "text" | "json";
export type ChangeType = "added" | "removed" | "unchanged";

export type DiffLine = {
  left: { lineNumber: number | null; content: string; type: ChangeType } | null;
  right: { lineNumber: number | null; content: string; type: ChangeType } | null;
};

export type DiffChunk = {
  type: ChangeType;
  value: string;
};

export type DiffResult =
  | { success: true; lines: DiffLine[]; chunks: DiffChunk[] }
  | { success: false; error: string };

export type JsonNormalizeResult =
  | { success: true; normalized: string }
  | { success: false; error: string };
