import {
  buildRegex,
  findMatches,
  buildSegments,
  computeReplacement,
} from "../regex-engine";
import type { RegexFlags, MatchResult } from "../types";

const defaultFlags: RegexFlags = { g: true, i: false, m: false, s: false };

describe("buildRegex", () => {
  it("builds a RegExp with the specified flags", () => {
    const regex = buildRegex("abc", { g: true, i: true, m: false, s: false });
    expect(regex.source).toBe("abc");
    expect(regex.flags).toContain("g");
    expect(regex.flags).toContain("i");
    expect(regex.flags).not.toContain("m");
  });

  it("throws on invalid pattern", () => {
    expect(() => buildRegex("[", defaultFlags)).toThrow();
  });
});

describe("findMatches", () => {
  it("returns empty matches for empty pattern", () => {
    const result = findMatches("", defaultFlags, "test");
    expect(result).toEqual({ success: true, matches: [] });
  });

  it("returns error for invalid regex", () => {
    const result = findMatches("[", defaultFlags, "test");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it("finds multiple matches with global flag", () => {
    const result = findMatches("\\d+", defaultFlags, "abc 123 def 456");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].fullMatch).toBe("123");
      expect(result.matches[0].start).toBe(4);
      expect(result.matches[0].end).toBe(7);
      expect(result.matches[1].fullMatch).toBe("456");
      expect(result.matches[1].start).toBe(12);
      expect(result.matches[1].end).toBe(15);
    }
  });

  it("finds at most one match without global flag", () => {
    const flags: RegexFlags = { g: false, i: false, m: false, s: false };
    const result = findMatches("\\d+", flags, "abc 123 def 456");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].fullMatch).toBe("123");
    }
  });

  it("extracts numbered capture groups", () => {
    const result = findMatches("(\\w+)@(\\w+)", defaultFlags, "user@host");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.matches).toHaveLength(1);
      const groups = result.matches[0].groups;
      expect(groups).toHaveLength(2);
      expect(groups[0]).toEqual({ index: 1, name: null, value: "user" });
      expect(groups[1]).toEqual({ index: 2, name: null, value: "host" });
    }
  });

  it("extracts named capture groups", () => {
    const result = findMatches(
      "(?<user>\\w+)@(?<domain>\\w+)",
      defaultFlags,
      "user@host",
    );
    expect(result.success).toBe(true);
    if (result.success) {
      const groups = result.matches[0].groups;
      expect(groups[0]).toEqual({ index: 1, name: "user", value: "user" });
      expect(groups[1]).toEqual({ index: 2, name: "domain", value: "host" });
    }
  });

  it("handles zero-length matches without infinite loop", () => {
    const result = findMatches("(?=a)", defaultFlags, "aaa");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches.length).toBeLessThanOrEqual(10000);
    }
  });

  it("respects case-insensitive flag", () => {
    const flags: RegexFlags = { g: true, i: true, m: false, s: false };
    const result = findMatches("abc", flags, "ABC abc");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.matches).toHaveLength(2);
    }
  });
});

describe("buildSegments", () => {
  it("returns empty array for empty string", () => {
    expect(buildSegments("", [])).toEqual([]);
  });

  it("returns single text segment when no matches", () => {
    expect(buildSegments("hello", [])).toEqual([
      { type: "text", value: "hello" },
    ]);
  });

  it("splits text around a single match", () => {
    const matches: MatchResult[] = [
      { fullMatch: "world", start: 6, end: 11, groups: [] },
    ];
    const segments = buildSegments("hello world!", matches);
    expect(segments).toEqual([
      { type: "text", value: "hello " },
      { type: "match", value: "world", matchIndex: 0 },
      { type: "text", value: "!" },
    ]);
  });

  it("handles match at start of string", () => {
    const matches: MatchResult[] = [
      { fullMatch: "hello", start: 0, end: 5, groups: [] },
    ];
    const segments = buildSegments("hello world", matches);
    expect(segments).toEqual([
      { type: "match", value: "hello", matchIndex: 0 },
      { type: "text", value: " world" },
    ]);
  });

  it("handles match at end of string", () => {
    const matches: MatchResult[] = [
      { fullMatch: "world", start: 6, end: 11, groups: [] },
    ];
    const segments = buildSegments("hello world", matches);
    expect(segments).toEqual([
      { type: "text", value: "hello " },
      { type: "match", value: "world", matchIndex: 0 },
    ]);
  });

  it("handles multiple adjacent matches", () => {
    const matches: MatchResult[] = [
      { fullMatch: "ab", start: 0, end: 2, groups: [] },
      { fullMatch: "cd", start: 2, end: 4, groups: [] },
    ];
    const segments = buildSegments("abcd", matches);
    expect(segments).toEqual([
      { type: "match", value: "ab", matchIndex: 0 },
      { type: "match", value: "cd", matchIndex: 1 },
    ]);
  });
});

describe("computeReplacement", () => {
  it("returns null for empty pattern", () => {
    expect(computeReplacement("", defaultFlags, "test", "x")).toBeNull();
  });

  it("returns null for invalid regex", () => {
    expect(computeReplacement("[", defaultFlags, "test", "x")).toBeNull();
  });

  it("replaces matches with replacement string", () => {
    const result = computeReplacement("\\d+", defaultFlags, "a1b2c3", "X");
    expect(result).toBe("aXbXcX");
  });

  it("supports back-references in replacement", () => {
    const result = computeReplacement(
      "(\\w+)@(\\w+)",
      defaultFlags,
      "user@host",
      "$2@$1",
    );
    expect(result).toBe("host@user");
  });

  it("replaces empty string for empty replacement", () => {
    const result = computeReplacement("\\d+", defaultFlags, "a1b2", "");
    expect(result).toBe("ab");
  });
});
