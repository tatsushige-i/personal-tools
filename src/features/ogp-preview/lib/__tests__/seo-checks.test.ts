import {
  DESCRIPTION_RANGE,
  TITLE_RANGE,
  checkDescription,
  checkLength,
  checkTitle,
} from "@/features/ogp-preview/lib/seo-checks";

describe("checkLength", () => {
  const range = { min: 5, max: 10 };

  it("returns missing for null", () => {
    const result = checkLength(null, range);
    expect(result.status).toBe("missing");
    expect(result.actual).toBe(0);
    expect(result.recommended).toEqual(range);
  });

  it("returns missing for undefined", () => {
    expect(checkLength(undefined, range).status).toBe("missing");
  });

  it("returns missing for empty string", () => {
    expect(checkLength("", range).status).toBe("missing");
  });

  it("returns short below the lower bound", () => {
    const result = checkLength("abcd", range);
    expect(result.status).toBe("short");
    expect(result.actual).toBe(4);
  });

  it("returns ok at the lower bound", () => {
    expect(checkLength("abcde", range).status).toBe("ok");
  });

  it("returns ok at the upper bound", () => {
    expect(checkLength("abcdefghij", range).status).toBe("ok");
  });

  it("returns long above the upper bound", () => {
    const result = checkLength("abcdefghijk", range);
    expect(result.status).toBe("long");
    expect(result.actual).toBe(11);
  });

  it("counts Japanese characters by code point", () => {
    const result = checkLength("あいうえお", range);
    expect(result.actual).toBe(5);
    expect(result.status).toBe("ok");
  });

  it("counts an emoji surrogate pair as a single code point", () => {
    const result = checkLength("😀", { min: 1, max: 1 });
    expect(result.actual).toBe(1);
    expect(result.status).toBe("ok");
  });
});

describe("checkTitle", () => {
  it("uses the canonical title range", () => {
    const result = checkTitle("a".repeat(45));
    expect(result.recommended).toEqual(TITLE_RANGE);
    expect(result.status).toBe("ok");
  });

  it("flags a too-short title", () => {
    expect(checkTitle("a".repeat(TITLE_RANGE.min - 1)).status).toBe("short");
  });

  it("flags a too-long title", () => {
    expect(checkTitle("a".repeat(TITLE_RANGE.max + 1)).status).toBe("long");
  });
});

describe("checkDescription", () => {
  it("uses the canonical description range", () => {
    const result = checkDescription("a".repeat(140));
    expect(result.recommended).toEqual(DESCRIPTION_RANGE);
    expect(result.status).toBe("ok");
  });

  it("flags a too-short description", () => {
    expect(checkDescription("a".repeat(DESCRIPTION_RANGE.min - 1)).status).toBe(
      "short",
    );
  });

  it("flags a too-long description", () => {
    expect(checkDescription("a".repeat(DESCRIPTION_RANGE.max + 1)).status).toBe(
      "long",
    );
  });
});
