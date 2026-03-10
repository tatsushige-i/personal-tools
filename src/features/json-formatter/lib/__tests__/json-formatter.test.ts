import { parseJson, formatJson, minifyJson } from "../json-formatter";

describe("parseJson", () => {
  it("parses valid JSON object", () => {
    const result = parseJson('{"key": "value"}');
    expect(result).toEqual({ success: true, data: { key: "value" } });
  });

  it("parses valid JSON array", () => {
    const result = parseJson("[1, 2, 3]");
    expect(result).toEqual({ success: true, data: [1, 2, 3] });
  });

  it("parses JSON primitives", () => {
    expect(parseJson("42")).toEqual({ success: true, data: 42 });
    expect(parseJson('"hello"')).toEqual({ success: true, data: "hello" });
    expect(parseJson("true")).toEqual({ success: true, data: true });
    expect(parseJson("null")).toEqual({ success: true, data: null });
  });

  it("returns error for empty input", () => {
    const result = parseJson("");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Empty input");
    }
  });

  it("returns error for whitespace-only input", () => {
    const result = parseJson("   ");
    expect(result.success).toBe(false);
  });

  it("returns error for invalid JSON", () => {
    const result = parseJson("{invalid}");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("Expected");
    }
  });

  it("extracts position info from syntax error", () => {
    const result = parseJson('{"a": 1, }');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.line).not.toBeNull();
    }
  });
});

describe("formatJson", () => {
  it("formats with 2-space indent", () => {
    const result = formatJson('{"a":1,"b":2}', 2);
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("formats with 4-space indent", () => {
    const result = formatJson('{"a":1}', 4);
    expect(result).toBe('{\n    "a": 1\n}');
  });

  it("throws on invalid JSON", () => {
    expect(() => formatJson("invalid", 2)).toThrow();
  });
});

describe("minifyJson", () => {
  it("minifies formatted JSON", () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}';
    expect(minifyJson(input)).toBe('{"a":1,"b":2}');
  });

  it("throws on invalid JSON", () => {
    expect(() => minifyJson("invalid")).toThrow();
  });
});
