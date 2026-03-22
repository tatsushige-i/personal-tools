import { countText, getByteLength, isFullWidth } from "../character-counter";

describe("getByteLength", () => {
  it("returns 1 for ASCII characters", () => {
    expect(getByteLength("A")).toBe(1);
    expect(getByteLength("hello")).toBe(5);
  });

  it("returns 3 for Japanese characters", () => {
    expect(getByteLength("あ")).toBe(3);
    expect(getByteLength("こんにちは")).toBe(15);
  });

  it("returns 0 for empty string", () => {
    expect(getByteLength("")).toBe(0);
  });
});

describe("isFullWidth", () => {
  it("returns true for Japanese hiragana", () => {
    expect(isFullWidth("あ")).toBe(true);
    expect(isFullWidth("か")).toBe(true);
  });

  it("returns true for CJK ideographs", () => {
    expect(isFullWidth("字")).toBe(true);
    expect(isFullWidth("漢")).toBe(true);
  });

  it("returns false for ASCII characters", () => {
    expect(isFullWidth("a")).toBe(false);
    expect(isFullWidth("Z")).toBe(false);
    expect(isFullWidth("1")).toBe(false);
  });
});

describe("countText", () => {
  it("returns all zeros for empty string", () => {
    const result = countText("");
    expect(result.total).toBe(0);
    expect(result.totalExcludingSpaces).toBe(0);
    expect(result.lines).toBe(0);
    expect(result.bytes).toBe(0);
    expect(result.fullWidth).toBe(0);
    expect(result.halfWidth).toBe(0);
  });

  it("counts ASCII text correctly", () => {
    const result = countText("hello");
    expect(result.total).toBe(5);
    expect(result.lines).toBe(1);
    expect(result.bytes).toBe(5);
    expect(result.fullWidth).toBe(0);
    expect(result.halfWidth).toBe(5);
  });

  it("counts lines correctly", () => {
    const result = countText("line1\nline2");
    expect(result.lines).toBe(2);
  });

  it("counts multiple lines", () => {
    const result = countText("a\nb\nc");
    expect(result.lines).toBe(3);
  });

  it("counts Japanese text correctly", () => {
    const result = countText("こんにちは");
    expect(result.total).toBe(5);
    expect(result.bytes).toBe(15);
    expect(result.fullWidth).toBe(5);
    expect(result.halfWidth).toBe(0);
  });

  it("counts mixed Japanese and ASCII text", () => {
    const result = countText("hello世界");
    expect(result.total).toBe(7);
    expect(result.fullWidth).toBe(2);
    expect(result.halfWidth).toBe(5);
  });

  it("calculates totalExcludingSpaces correctly", () => {
    const result = countText("hello world");
    expect(result.totalExcludingSpaces).toBe(10);
  });

  it("excludes newlines in totalExcludingSpaces", () => {
    const result = countText("hello\nworld");
    expect(result.totalExcludingSpaces).toBe(10);
  });

  it("counts whitespace-only string", () => {
    const result = countText("   ");
    expect(result.total).toBe(3);
    expect(result.totalExcludingSpaces).toBe(0);
  });
});
