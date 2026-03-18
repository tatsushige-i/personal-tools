import {
  relativeLuminance,
  contrastRatio,
  calculateContrast,
} from "../contrast";

describe("relativeLuminance", () => {
  it("returns 0 for black", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0);
  });

  it("returns 1 for white", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1);
  });
});

describe("contrastRatio", () => {
  it("returns 21:1 for black/white", () => {
    const ratio = contrastRatio(
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
    );
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("returns 1:1 for same color", () => {
    const ratio = contrastRatio(
      { r: 128, g: 128, b: 128 },
      { r: 128, g: 128, b: 128 },
    );
    expect(ratio).toBeCloseTo(1);
  });

  it("is symmetric", () => {
    const a = { r: 59, g: 130, b: 246 };
    const b = { r: 255, g: 255, b: 255 };
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a));
  });
});

describe("calculateContrast", () => {
  it("black on white passes all criteria", () => {
    const result = calculateContrast("#000000", "#ffffff");
    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.aa).toBe(true);
    expect(result.aaLarge).toBe(true);
    expect(result.aaa).toBe(true);
    expect(result.aaaLarge).toBe(true);
  });

  it("same color fails all criteria", () => {
    const result = calculateContrast("#808080", "#808080");
    expect(result.ratio).toBeCloseTo(1);
    expect(result.aa).toBe(false);
    expect(result.aaLarge).toBe(false);
    expect(result.aaa).toBe(false);
    expect(result.aaaLarge).toBe(false);
  });

  it("threshold boundary: ratio ~4.5 passes AA but not AAA", () => {
    // #767676 on white has contrast ratio ~4.54:1
    const result = calculateContrast("#767676", "#ffffff");
    expect(result.aa).toBe(true);
    expect(result.aaLarge).toBe(true);
    expect(result.aaa).toBe(false);
  });

  it("formats ratio text correctly", () => {
    const result = calculateContrast("#000000", "#ffffff");
    expect(result.ratioText).toBe("21.00:1");
  });
});
