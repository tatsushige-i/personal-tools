import { validateOutput } from "../validate-output";

describe("validateOutput", () => {
  it("accepts valid output", () => {
    const result = validateOutput("翻訳された結果です。");
    expect(result).toEqual({ valid: true });
  });

  it("rejects empty output", () => {
    const result = validateOutput("   ");
    expect(result).toEqual({
      valid: false,
      error: "AIモデルから空の応答が返されました。",
    });
  });

  it("rejects output exceeding default max length", () => {
    const text = "a".repeat(10001);
    const result = validateOutput(text);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("長すぎます");
    }
  });

  it("respects custom max length", () => {
    const text = "a".repeat(501);
    const result = validateOutput(text, { maxLength: 500 });
    expect(result.valid).toBe(false);

    const result2 = validateOutput(text, { maxLength: 600 });
    expect(result2.valid).toBe(true);
  });

  describe("system prompt leak detection", () => {
    const systemPrompt =
      "You are a translator. Translate text from Japanese to English accurately.";

    it("detects leaked system prompt fragment (>= 20 chars)", () => {
      const output = `Here is the translation: ${systemPrompt}`;
      const result = validateOutput(output, {
        systemPromptFragments: [systemPrompt],
      });
      expect(result).toEqual({
        valid: false,
        error: "AIモデルの応答に不正な内容が検出されました。",
      });
    });

    it("ignores short fragments (< 20 chars)", () => {
      const shortFragment = "short fragment";
      const output = `Result contains short fragment here.`;
      const result = validateOutput(output, {
        systemPromptFragments: [shortFragment],
      });
      expect(result).toEqual({ valid: true });
    });

    it("passes when no fragments match", () => {
      const result = validateOutput("Normal translation output.", {
        systemPromptFragments: [systemPrompt],
      });
      expect(result).toEqual({ valid: true });
    });

    it("passes when no fragments provided", () => {
      const result = validateOutput("Any output text.");
      expect(result).toEqual({ valid: true });
    });
  });
});
