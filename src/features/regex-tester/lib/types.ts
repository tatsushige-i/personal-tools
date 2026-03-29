export type RegexFlag = "g" | "i" | "m" | "s";

export type RegexFlags = Record<RegexFlag, boolean>;

export type CaptureGroup = {
  index: number;
  name: string | null;
  value: string;
};

export type MatchResult = {
  fullMatch: string;
  start: number;
  end: number;
  groups: CaptureGroup[];
};

export type RegexResult =
  | { success: true; matches: MatchResult[] }
  | { success: false; error: string };

export type TextSegment =
  | { type: "text"; value: string }
  | { type: "match"; value: string; matchIndex: number };

export type Preset = {
  name: string;
  pattern: string;
  flags: RegexFlags;
  description: string;
  testExample: string;
};
