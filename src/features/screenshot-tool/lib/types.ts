export const DEVICES = ["desktop", "tablet", "mobile"] as const;
export type Device = (typeof DEVICES)[number];

export const FORMATS = ["png", "webp"] as const;
export type ImageFormat = (typeof FORMATS)[number];

export const SCALES = [1, 2] as const;
export type Scale = (typeof SCALES)[number];

export type DevicePreset = {
  width: number;
  height: number;
  isMobile: boolean;
  userAgent?: string;
};

export const DEVICE_PRESETS: Record<Device, DevicePreset> = {
  desktop: {
    width: 1280,
    height: 800,
    isMobile: false,
  },
  tablet: {
    width: 768,
    height: 1024,
    isMobile: false,
  },
  mobile: {
    width: 390,
    height: 844,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
};

export const DEVICE_LABELS: Record<Device, string> = {
  desktop: "デスクトップ",
  tablet: "タブレット",
  mobile: "モバイル",
};

export type ScreenshotOptions = {
  url: string;
  devices: Device[];
  fullPage: boolean;
  format: ImageFormat;
  scale: Scale;
};

export type ScreenshotShot = {
  device: Device;
  width: number;
  height: number;
  scale: Scale;
  format: ImageFormat;
  dataUrl: string;
};

export type ScreenshotResponse = {
  shots: ScreenshotShot[];
  durationMs: number;
};

export type ScreenshotError = {
  error: string;
  errorCode: string;
};

export function isDevice(value: unknown): value is Device {
  return typeof value === "string" && (DEVICES as readonly string[]).includes(value);
}

export function isImageFormat(value: unknown): value is ImageFormat {
  return typeof value === "string" && (FORMATS as readonly string[]).includes(value);
}

export function isScale(value: unknown): value is Scale {
  return value === 1 || value === 2;
}
