import { convert } from "../converter";

describe("convert", () => {
  describe("length", () => {
    it("converts km to m", () => {
      const result = convert(1, "km", "m", "length");
      expect(result.value).toBe(1000);
      expect(result.formula).toContain("1000");
    });

    it("converts m to ft", () => {
      const result = convert(1, "m", "ft", "length");
      expect(result.value).toBeCloseTo(3.28084, 4);
    });

    it("converts mi to km", () => {
      const result = convert(1, "mi", "km", "length");
      expect(result.value).toBeCloseTo(1.60934, 4);
    });

    it("converts in to cm", () => {
      const result = convert(1, "in", "cm", "length");
      expect(result.value).toBeCloseTo(2.54, 2);
    });
  });

  describe("weight", () => {
    it("converts kg to lb", () => {
      const result = convert(1, "kg", "lb", "weight");
      expect(result.value).toBeCloseTo(2.20462, 4);
    });

    it("converts oz to g", () => {
      const result = convert(1, "oz", "g", "weight");
      expect(result.value).toBeCloseTo(28.3495, 3);
    });
  });

  describe("temperature", () => {
    it("converts °C to °F", () => {
      const result = convert(100, "c", "f", "temperature");
      expect(result.value).toBe(212);
      expect(result.formula).toContain("212");
    });

    it("converts °F to °C", () => {
      const result = convert(32, "f", "c", "temperature");
      expect(result.value).toBeCloseTo(0, 5);
    });

    it("converts °C to K", () => {
      const result = convert(0, "c", "k", "temperature");
      expect(result.value).toBe(273.15);
    });

    it("converts K to °C", () => {
      const result = convert(273.15, "k", "c", "temperature");
      expect(result.value).toBeCloseTo(0, 5);
    });

    it("converts °F to K", () => {
      const result = convert(212, "f", "k", "temperature");
      expect(result.value).toBeCloseTo(373.15, 2);
    });

    it("handles negative temperatures", () => {
      const result = convert(-40, "c", "f", "temperature");
      expect(result.value).toBeCloseTo(-40, 5);
    });
  });

  describe("volume", () => {
    it("converts L to mL", () => {
      const result = convert(1, "l", "ml", "volume");
      expect(result.value).toBe(1000);
    });

    it("converts cup to mL", () => {
      const result = convert(1, "cup", "ml", "volume");
      expect(result.value).toBeCloseTo(236.588, 2);
    });

    it("converts tbsp to tsp", () => {
      const result = convert(1, "tbsp", "tsp", "volume");
      expect(result.value).toBeCloseTo(3, 0);
    });
  });

  describe("speed", () => {
    it("converts km/h to m/s", () => {
      const result = convert(3.6, "kmh", "ms", "speed");
      expect(result.value).toBeCloseTo(1, 5);
    });

    it("converts mph to km/h", () => {
      const result = convert(60, "mph", "kmh", "speed");
      expect(result.value).toBeCloseTo(96.5606, 2);
    });
  });

  describe("data-size", () => {
    it("converts GB to MB", () => {
      const result = convert(1, "gb", "mb", "data-size");
      expect(result.value).toBe(1000);
    });

    it("converts GiB to MiB", () => {
      const result = convert(1, "gib", "mib", "data-size");
      expect(result.value).toBe(1024);
    });

    it("converts GB to GiB", () => {
      const result = convert(1, "gb", "gib", "data-size");
      expect(result.value).toBeCloseTo(0.931323, 4);
    });
  });

  describe("same unit", () => {
    it("returns the same value for same unit", () => {
      const result = convert(42, "m", "m", "length");
      expect(result.value).toBe(42);
    });

    it("returns the same value for same temperature unit", () => {
      const result = convert(100, "c", "c", "temperature");
      expect(result.value).toBe(100);
    });
  });

  describe("zero value", () => {
    it("converts zero correctly", () => {
      const result = convert(0, "km", "m", "length");
      expect(result.value).toBe(0);
    });

    it("converts zero temperature correctly", () => {
      const result = convert(0, "c", "f", "temperature");
      expect(result.value).toBe(32);
    });
  });

  describe("formula", () => {
    it("includes unit symbols in formula", () => {
      const result = convert(5, "km", "m", "length");
      expect(result.formula).toContain("km");
      expect(result.formula).toContain("m");
    });

    it("includes temperature formula notation", () => {
      const result = convert(100, "c", "f", "temperature");
      expect(result.formula).toContain("9/5");
      expect(result.formula).toContain("32");
    });
  });
});
