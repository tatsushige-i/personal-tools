import {
  getSystemInstruction,
  validateInput,
  rewriteText,
  MAX_LENGTH,
} from "../rewriter";
import type { RewriteMode } from "../types";

describe("getSystemInstruction", () => {
  const modes: RewriteMode[] = [
    "casual-to-business",
    "business-to-casual",
    "ja-to-en",
    "en-to-ja",
    "summarize",
    "proofread",
  ];

  it.each(modes)("returns a system instruction for mode: %s", (mode) => {
    const result = getSystemInstruction(mode);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns instruction containing 'formal business' for casual-to-business", () => {
    const result = getSystemInstruction("casual-to-business");
    expect(result).toContain("formal business");
  });

  it("returns instruction containing 'casual' for business-to-casual", () => {
    const result = getSystemInstruction("business-to-casual");
    expect(result).toContain("casual");
  });

  it("returns instruction containing 'English' for ja-to-en", () => {
    const result = getSystemInstruction("ja-to-en");
    expect(result).toContain("English");
  });

  it("returns instruction containing '日本語' for en-to-ja", () => {
    const result = getSystemInstruction("en-to-ja");
    expect(result).toContain("日本語");
  });

  it("returns instruction containing 'summarize' for summarize", () => {
    const result = getSystemInstruction("summarize");
    expect(result).toContain("summarize");
  });

  it("returns instruction containing 'proofreader' for proofread", () => {
    const result = getSystemInstruction("proofread");
    expect(result).toContain("proofreader");
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

describe("rewriteText", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns result on successful response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: "変換されたテキスト" }),
    });

    const response = await rewriteText({
      text: "テスト",
      mode: "casual-to-business",
    });
    expect(response).toEqual({ result: "変換されたテキスト" });
  });

  it("throws error with server error message on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "text と mode は必須です。" }),
    });

    await expect(
      rewriteText({ text: "", mode: "casual-to-business" })
    ).rejects.toThrow("text と mode は必須です。");
  });

  it("throws fallback error message when response body is not JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("invalid json")),
    });

    await expect(
      rewriteText({ text: "テスト", mode: "casual-to-business" })
    ).rejects.toThrow("変換に失敗しました。（500）");
  });
});
