import { SIZE_MAP, LOGO_RATIO } from "../types";

jest.mock("qrcode", () => ({
  toCanvas: jest.fn().mockResolvedValue(undefined),
  toString: jest.fn().mockResolvedValue(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" width="256" height="256"><path d="M0 0h33v33H0z"/></svg>'
  ),
}));

describe("SIZE_MAP", () => {
  it("maps S to 128", () => {
    expect(SIZE_MAP.S).toBe(128);
  });

  it("maps M to 256", () => {
    expect(SIZE_MAP.M).toBe(256);
  });

  it("maps L to 512", () => {
    expect(SIZE_MAP.L).toBe(512);
  });
});

describe("LOGO_RATIO", () => {
  it("is approximately 22%", () => {
    expect(LOGO_RATIO).toBeCloseTo(0.22);
  });
});

describe("exportQrAsSvg", () => {
  it("returns SVG string without logo", async () => {
    const { exportQrAsSvg } = await import("../qr-renderer");
    const result = await exportQrAsSvg("test", {
      size: "M",
      errorCorrectionLevel: "M",
      foregroundColor: "#000000",
      backgroundColor: "#ffffff",
      logoDataUrl: null,
    });

    expect(result).toContain("<svg");
    expect(result).toContain("</svg>");
  });

  it("injects logo image element when logoDataUrl is provided", async () => {
    const { exportQrAsSvg } = await import("../qr-renderer");
    const logoDataUrl = "data:image/png;base64,abc123";
    const result = await exportQrAsSvg("test", {
      size: "M",
      errorCorrectionLevel: "Q",
      foregroundColor: "#000000",
      backgroundColor: "#ffffff",
      logoDataUrl,
    });

    expect(result).toContain(`<image href="${logoDataUrl}"`);
    expect(result).toContain("<rect");
    expect(result).toContain("</svg>");
  });
});
