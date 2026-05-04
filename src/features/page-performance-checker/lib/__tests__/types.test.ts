import {
  DEVICES,
  DEVICE_PRESETS,
  isDevice,
  toResourceType,
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
    expect(DEVICE_PRESETS.mobile.isMobile).toBe(true);
  });

  it("supplies a custom user agent only for mobile", () => {
    expect(DEVICE_PRESETS.desktop.userAgent).toBeUndefined();
    expect(DEVICE_PRESETS.mobile.userAgent).toMatch(/iPhone|Mobile|Safari/);
  });
});

describe("isDevice", () => {
  it("accepts known devices", () => {
    for (const d of DEVICES) {
      expect(isDevice(d)).toBe(true);
    }
  });

  it("rejects unknown strings, non-strings, and nullish values", () => {
    expect(isDevice("tablet")).toBe(false);
    expect(isDevice("Desktop")).toBe(false);
    expect(isDevice(undefined)).toBe(false);
    expect(isDevice(null)).toBe(false);
    expect(isDevice(123)).toBe(false);
  });
});

describe("toResourceType", () => {
  describe("by initiatorType", () => {
    it("maps script", () => {
      expect(toResourceType("script", "https://example.com/x")).toBe("script");
    });

    it("maps css", () => {
      expect(toResourceType("css", "https://example.com/x")).toBe("css");
    });

    it("maps img and image", () => {
      expect(toResourceType("img", "https://example.com/x")).toBe("image");
      expect(toResourceType("image", "https://example.com/x")).toBe("image");
    });

    it("treats link initiator as css when no extension hint matches", () => {
      expect(toResourceType("link", "https://example.com/styles")).toBe("css");
    });
  });

  describe("by URL extension fallback", () => {
    it("detects script extensions", () => {
      expect(toResourceType("fetch", "https://example.com/app.js")).toBe("script");
      expect(toResourceType("other", "https://example.com/mod.mjs")).toBe("script");
    });

    it("detects css extension", () => {
      expect(toResourceType("other", "https://example.com/main.css")).toBe("css");
    });

    it("detects image extensions", () => {
      expect(toResourceType("other", "https://example.com/a.png")).toBe("image");
      expect(toResourceType("other", "https://example.com/a.JPG")).toBe("image");
      expect(toResourceType("other", "https://example.com/a.svg")).toBe("image");
      expect(toResourceType("other", "https://example.com/a.webp")).toBe("image");
    });

    it("detects font extensions", () => {
      expect(toResourceType("other", "https://example.com/font.woff2")).toBe("font");
      expect(toResourceType("other", "https://example.com/font.ttf")).toBe("font");
    });

    it("prefers initiatorType over extension", () => {
      // initiatorType=script wins even when URL has .css
      expect(toResourceType("script", "https://example.com/weird.css")).toBe("script");
    });
  });

  describe("fallback to other", () => {
    it("returns other for unknown initiatorType and no recognized extension", () => {
      expect(toResourceType("xmlhttprequest", "https://example.com/api/data")).toBe("other");
    });

    it("returns other for invalid URLs with no recognizable hints", () => {
      expect(toResourceType("fetch", "not-a-url")).toBe("other");
    });

    it("returns other when extension is empty (trailing dot or directory)", () => {
      expect(toResourceType("fetch", "https://example.com/path/")).toBe("other");
      expect(toResourceType("fetch", "https://example.com/file.")).toBe("other");
    });
  });
});
