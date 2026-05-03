import {
  buildUrl,
  paramsFromUrl,
  paramsToQueryString,
  toRecord,
} from "../key-value-utils";
import type { KeyValue } from "../types";

const row = (overrides: Partial<KeyValue> = {}): KeyValue => ({
  id: overrides.id ?? Math.random().toString(36),
  enabled: overrides.enabled ?? true,
  key: overrides.key ?? "",
  value: overrides.value ?? "",
});

describe("toRecord", () => {
  it("includes only enabled rows with non-empty trimmed key", () => {
    const result = toRecord([
      row({ key: "a", value: "1" }),
      row({ key: "b", value: "2", enabled: false }),
      row({ key: "  ", value: "3" }),
      row({ key: "  c  ", value: "4" }),
    ]);
    expect(result).toEqual({ a: "1", c: "4" });
  });

  it("later enabled rows override earlier ones for the same key", () => {
    const result = toRecord([
      row({ key: "x", value: "1" }),
      row({ key: "x", value: "2" }),
    ]);
    expect(result).toEqual({ x: "2" });
  });
});

describe("paramsToQueryString", () => {
  it("returns empty string when no enabled rows", () => {
    expect(paramsToQueryString([])).toBe("");
    expect(paramsToQueryString([row({ key: "a", value: "1", enabled: false })])).toBe("");
  });

  it("encodes values and preserves order", () => {
    const result = paramsToQueryString([
      row({ key: "q", value: "hello world" }),
      row({ key: "tag", value: "a&b" }),
    ]);
    expect(result).toBe("?q=hello+world&tag=a%26b");
  });
});

describe("paramsFromUrl", () => {
  it("returns base and empty params when no query string", () => {
    const result = paramsFromUrl("https://example.com/path");
    expect(result?.base).toBe("https://example.com/path");
    expect(result?.params).toEqual([]);
  });

  it("splits query string into key-value rows", () => {
    const result = paramsFromUrl("https://example.com?a=1&b=hello+world");
    expect(result?.base).toBe("https://example.com");
    expect(result?.params.map(({ key, value, enabled }) => ({ key, value, enabled }))).toEqual([
      { key: "a", value: "1", enabled: true },
      { key: "b", value: "hello world", enabled: true },
    ]);
  });

  it("preserves hash fragment in base", () => {
    const result = paramsFromUrl("https://example.com/path?a=1#section");
    expect(result?.base).toBe("https://example.com/path#section");
  });

  it("returns null for empty input", () => {
    expect(paramsFromUrl("")).toBeNull();
    expect(paramsFromUrl("   ")).toBeNull();
  });
});

describe("buildUrl", () => {
  it("removes existing query string before appending params", () => {
    const result = buildUrl("https://example.com?old=1", [row({ key: "new", value: "2" })]);
    expect(result).toBe("https://example.com?new=2");
  });

  it("preserves hash fragment", () => {
    const result = buildUrl("https://example.com/path#frag", [row({ key: "a", value: "1" })]);
    expect(result).toBe("https://example.com/path?a=1#frag");
  });

  it("returns base unchanged when no enabled rows", () => {
    expect(buildUrl("https://example.com", [])).toBe("https://example.com");
  });

  it("returns empty string when base is empty", () => {
    expect(buildUrl("", [row({ key: "a", value: "1" })])).toBe("");
  });
});
