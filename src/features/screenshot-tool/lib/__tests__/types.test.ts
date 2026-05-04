import {
  DEVICES,
  DEVICE_PRESETS,
  FORMATS,
  SCALES,
  isDevice,
  isImageFormat,
  isScale,
} from "../types";

describe("DEVICE_PRESETS", () => {
  it("provides a preset for every device", () => {
    for (const device of DEVICES) {
      const preset = DEVICE_PRESETS[device];
      expect(preset).toBeDefined();
      expect(preset.width).toBeGreaterThan(0);
      expect(preset.height).toBeGreaterThan(0);
    }
  });

  it("marks only mobile as a mobile device", () => {
    expect(DEVICE_PRESETS.desktop.isMobile).toBe(false);
    expect(DEVICE_PRESETS.tablet.isMobile).toBe(false);
    expect(DEVICE_PRESETS.mobile.isMobile).toBe(true);
  });

  it("supplies a custom user agent only for mobile", () => {
    expect(DEVICE_PRESETS.desktop.userAgent).toBeUndefined();
    expect(DEVICE_PRESETS.tablet.userAgent).toBeUndefined();
    expect(DEVICE_PRESETS.mobile.userAgent).toMatch(/iPhone|Mobile|Safari/);
  });
});

describe("type guards", () => {
  it("isDevice accepts known devices and rejects others", () => {
    for (const d of DEVICES) {
      expect(isDevice(d)).toBe(true);
    }
    expect(isDevice("watch")).toBe(false);
    expect(isDevice(undefined)).toBe(false);
    expect(isDevice(123)).toBe(false);
  });

  it("isImageFormat accepts png and webp only", () => {
    for (const f of FORMATS) {
      expect(isImageFormat(f)).toBe(true);
    }
    expect(isImageFormat("jpeg")).toBe(false);
    expect(isImageFormat("PNG")).toBe(false);
    expect(isImageFormat(null)).toBe(false);
  });

  it("isScale accepts only 1 and 2", () => {
    for (const s of SCALES) {
      expect(isScale(s)).toBe(true);
    }
    expect(isScale(0)).toBe(false);
    expect(isScale(3)).toBe(false);
    expect(isScale("2")).toBe(false);
  });
});
