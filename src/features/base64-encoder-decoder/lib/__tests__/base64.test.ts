import {
  encodeText,
  decodeText,
  encodeBytes,
  buildDataUri,
  parseDataUri,
  detectImageMimeType,
  isValidBase64,
} from "../base64";

describe("encodeText", () => {
  it("ASCII文字列をエンコードする", () => {
    const result = encodeText("Hello, World!", false);
    expect(result).toEqual({ success: true, data: "SGVsbG8sIFdvcmxkIQ==" });
  });

  it("日本語テキストをエンコードする", () => {
    const result = encodeText("こんにちは", false);
    expect(result.success).toBe(true);
    if (result.success) {
      // デコードして元に戻ることを検証
      const decoded = decodeText(result.data, false);
      expect(decoded).toEqual({ success: true, data: "こんにちは" });
    }
  });

  it("空文字列をエンコードする", () => {
    expect(encodeText("", false)).toEqual({ success: true, data: "" });
  });

  it("URL-safeモードでエンコードする", () => {
    // エンコード・デコードの往復が正しく動作することを検証
    const input = "Hello, World! こんにちは 🎉";
    const urlSafeResult = encodeText(input, true);
    expect(urlSafeResult.success).toBe(true);
    if (urlSafeResult.success) {
      expect(urlSafeResult.data).not.toContain("+");
      expect(urlSafeResult.data).not.toContain("/");
      expect(urlSafeResult.data).not.toContain("=");
      // 往復変換
      const decoded = decodeText(urlSafeResult.data, true);
      expect(decoded).toEqual({ success: true, data: input });
    }
  });
});

describe("decodeText", () => {
  it("Base64文字列をデコードする", () => {
    expect(decodeText("SGVsbG8sIFdvcmxkIQ==", false)).toEqual({
      success: true,
      data: "Hello, World!",
    });
  });

  it("URL-safe Base64をデコードする", () => {
    const encoded = encodeText("subjects?_d", true);
    if (encoded.success) {
      const decoded = decodeText(encoded.data, true);
      expect(decoded).toEqual({ success: true, data: "subjects?_d" });
    }
  });

  it("無効なBase64でエラーを返す", () => {
    const result = decodeText("!!!invalid!!!", false);
    expect(result.success).toBe(false);
  });
});

describe("encodeBytes", () => {
  it("Uint8ArrayをBase64にエンコードする", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    expect(encodeBytes(bytes, false)).toBe("SGVsbG8=");
  });

  it("URL-safeモードでエンコードする", () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]);
    const result = encodeBytes(bytes, true);
    expect(result).not.toContain("=");
  });
});

describe("buildDataUri", () => {
  it("Data URIを生成する", () => {
    expect(buildDataUri("SGVsbG8=", "text/plain")).toBe(
      "data:text/plain;base64,SGVsbG8="
    );
  });
});

describe("parseDataUri", () => {
  it("Data URIをパースする", () => {
    expect(parseDataUri("data:text/plain;base64,SGVsbG8=")).toEqual({
      mimeType: "text/plain",
      base64: "SGVsbG8=",
    });
  });

  it("無効なData URIでnullを返す", () => {
    expect(parseDataUri("not-a-data-uri")).toBeNull();
  });
});

describe("detectImageMimeType", () => {
  it("PNGを検出する", () => {
    // PNG magic bytes: 89 50 4E 47
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const base64 = btoa(String.fromCharCode(...bytes));
    expect(detectImageMimeType(base64)).toBe("image/png");
  });

  it("JPEGを検出する", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x00]);
    const base64 = btoa(String.fromCharCode(...bytes));
    expect(detectImageMimeType(base64)).toBe("image/jpeg");
  });

  it("GIFを検出する", () => {
    const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    const base64 = btoa(String.fromCharCode(...bytes));
    expect(detectImageMimeType(base64)).toBe("image/gif");
  });

  it("テキストBase64ではnullを返す", () => {
    expect(detectImageMimeType("SGVsbG8=")).toBeNull();
  });
});

describe("isValidBase64", () => {
  it("有効な標準Base64を判定する", () => {
    expect(isValidBase64("SGVsbG8=", false)).toBe(true);
  });

  it("無効な文字を含むBase64を判定する", () => {
    expect(isValidBase64("SGVs!!!", false)).toBe(false);
  });

  it("空文字列を有効とする", () => {
    expect(isValidBase64("", false)).toBe(true);
  });

  it("URL-safe Base64を判定する", () => {
    expect(isValidBase64("SGVsbG8", true)).toBe(true);
    expect(isValidBase64("a+b/c=", true)).toBe(false);
  });

  it("URL-safe Base64でデコード不可能な長さを拒否する", () => {
    // len % 4 === 1 はデコード不可能
    expect(isValidBase64("a-b_c", true)).toBe(false);
    expect(isValidBase64("ab", true)).toBe(true);
    expect(isValidBase64("abc", true)).toBe(true);
    expect(isValidBase64("abcd", true)).toBe(true);
    expect(isValidBase64("a", true)).toBe(false);
  });
});
