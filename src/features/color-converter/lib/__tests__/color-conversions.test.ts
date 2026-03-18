import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  parseColorInput,
  createColorValue,
} from "../color-conversions";

describe("hexToRgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#3b82f6")).toEqual({ r: 59, g: 130, b: 246 });
  });

  it("parses 3-digit hex", () => {
    expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#abc")).toEqual({ r: 170, g: 187, b: 204 });
  });

  it("parses without # prefix", () => {
    expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("returns null for invalid input", () => {
    expect(hexToRgb("xyz")).toBeNull();
    expect(hexToRgb("#gggggg")).toBeNull();
    expect(hexToRgb("#12345")).toBeNull();
  });
});

describe("rgbToHex", () => {
  it("converts RGB to hex", () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#ffffff");
  });

  it("clamps out-of-range values", () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe("#ff0080");
  });
});

describe("rgbToHsl", () => {
  it("converts pure red", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("converts pure green", () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({
      h: 120,
      s: 100,
      l: 50,
    });
  });

  it("converts pure blue", () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({
      h: 240,
      s: 100,
      l: 50,
    });
  });

  it("converts gray (no saturation)", () => {
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({
      h: 0,
      s: 0,
      l: 50,
    });
  });

  it("converts black and white", () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({
      h: 0,
      s: 0,
      l: 100,
    });
  });
});

describe("hslToRgb", () => {
  it("converts pure red", () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({
      r: 255,
      g: 0,
      b: 0,
    });
  });

  it("converts achromatic", () => {
    expect(hslToRgb({ h: 0, s: 0, l: 50 })).toEqual({
      r: 128,
      g: 128,
      b: 128,
    });
  });
});

describe("round-trip conversions", () => {
  const testColors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#3b82f6",
    "#000000",
    "#ffffff",
    "#f59e0b",
  ];

  it("hex → rgb → hex is stable", () => {
    for (const hex of testColors) {
      const rgb = hexToRgb(hex)!;
      expect(rgbToHex(rgb)).toBe(hex);
    }
  });

  it("hex → hsl → hex is stable", () => {
    for (const hex of testColors) {
      const hsl = hexToHsl(hex)!;
      const result = hslToHex(hsl);
      // Allow ±1 difference per channel due to rounding
      const orig = hexToRgb(hex)!;
      const back = hexToRgb(result)!;
      expect(Math.abs(orig.r - back.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(orig.g - back.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(orig.b - back.b)).toBeLessThanOrEqual(1);
    }
  });
});

describe("parseColorInput", () => {
  it("parses hex input", () => {
    const result = parseColorInput("#ff0000");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#ff0000");
  });

  it("parses rgb() input", () => {
    const result = parseColorInput("rgb(255, 0, 0)");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#ff0000");
  });

  it("parses hsl() input", () => {
    const result = parseColorInput("hsl(0, 100%, 50%)");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#ff0000");
  });

  it("parses Tailwind color name", () => {
    const result = parseColorInput("blue-500");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#3b82f6");
    expect(result!.tailwind).toBe("blue-500");
  });

  it("returns null for invalid input", () => {
    expect(parseColorInput("not-a-color")).toBeNull();
    expect(parseColorInput("")).toBeNull();
    expect(parseColorInput("rgb(300, 0, 0)")).toBeNull();
  });
});

describe("createColorValue", () => {
  it("creates full color value from hex", () => {
    const color = createColorValue("#3b82f6");
    expect(color).not.toBeNull();
    expect(color!.hex).toBe("#3b82f6");
    expect(color!.rgb).toEqual({ r: 59, g: 130, b: 246 });
    expect(color!.tailwind).toBe("blue-500");
  });

  it("returns null for invalid hex", () => {
    expect(createColorValue("invalid")).toBeNull();
  });
});
