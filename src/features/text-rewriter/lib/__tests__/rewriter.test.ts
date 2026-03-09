import { buildPrompt, validateInput, MAX_LENGTH } from "../rewriter";
import type { RewriteMode } from "../types";

describe("buildPrompt", () => {
  const modes: RewriteMode[] = [
    "casual-to-business",
    "business-to-casual",
    "ja-to-en",
    "en-to-ja",
    "summarize",
    "proofread",
  ];

  it.each(modes)("builds a prompt for mode: %s", (mode) => {
    const result = buildPrompt("テストテキスト", mode);
    expect(result).toContain("テストテキスト");
    expect(result).toContain("---");
  });

  it("includes system instruction for casual-to-business", () => {
    const result = buildPrompt("hello", "casual-to-business");
    expect(result).toContain("formal business");
  });

  it("includes system instruction for business-to-casual", () => {
    const result = buildPrompt("hello", "business-to-casual");
    expect(result).toContain("casual");
  });

  it("includes system instruction for ja-to-en", () => {
    const result = buildPrompt("hello", "ja-to-en");
    expect(result).toContain("English");
  });

  it("includes system instruction for en-to-ja", () => {
    const result = buildPrompt("hello", "en-to-ja");
    expect(result).toContain("日本語");
  });

  it("includes system instruction for summarize", () => {
    const result = buildPrompt("hello", "summarize");
    expect(result).toContain("summarize");
  });

  it("includes system instruction for proofread", () => {
    const result = buildPrompt("hello", "proofread");
    expect(result).toContain("proofreader");
  });

  it("separates system instruction and user text with delimiter", () => {
    const result = buildPrompt("user input", "summarize");
    const parts = result.split("---");
    expect(parts).toHaveLength(2);
    expect(parts[1]).toContain("user input");
  });
});

describe("validateInput", () => {
  it("returns valid for normal text", () => {
    const result = validateInput("通常のテキスト");
    expect(result).toEqual({ valid: true });
  });

  it("returns error for empty string", () => {
    const result = validateInput("");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("入力");
    }
  });

  it("returns error for whitespace-only string", () => {
    const result = validateInput("   \n\t  ");
    expect(result.valid).toBe(false);
  });

  it("returns valid for text at exactly MAX_LENGTH characters", () => {
    const text = "a".repeat(MAX_LENGTH);
    const result = validateInput(text);
    expect(result).toEqual({ valid: true });
  });

  it("returns error for text exceeding MAX_LENGTH characters", () => {
    const text = "a".repeat(MAX_LENGTH + 1);
    const result = validateInput(text);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain(String(MAX_LENGTH));
      expect(result.error).toContain(String(MAX_LENGTH + 1));
    }
  });
});
