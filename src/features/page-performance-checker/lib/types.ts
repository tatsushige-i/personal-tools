export const DEVICES = ["desktop", "mobile"] as const;
export type Device = (typeof DEVICES)[number];

export const RESOURCE_TYPES = ["script", "css", "image", "font", "other"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

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
  mobile: "モバイル",
};

export type CoreMetrics = {
  lcp: number | null;
  cls: number | null;
  fcp: number | null;
  tbt: number;
};

export type NavTimings = {
  ttfb: number;
  dcl: number;
  load: number;
};

export type ResourceEntry = {
  name: string;
  type: ResourceType;
  transferSize: number;
  decodedSize: number;
  duration: number;
};

export type DeviceResult = {
  device: Device;
  viewport: { width: number; height: number };
  metrics: CoreMetrics;
  timings: NavTimings;
  resources: ResourceEntry[];
  totalTransferSize: number;
  score: number;
};

export type PerformanceOptions = {
  url: string;
  devices: Device[];
};

export type PerformanceResponse = {
  url: string;
  results: DeviceResult[];
  durationMs: number;
};

export type PerformanceError = {
  error: string;
  errorCode: string;
};

export function isDevice(value: unknown): value is Device {
  return typeof value === "string" && (DEVICES as readonly string[]).includes(value);
}

export function toResourceType(initiatorType: string, url: string): ResourceType {
  if (initiatorType === "script") return "script";
  if (initiatorType === "css") return "css";
  if (initiatorType === "img" || initiatorType === "image") return "image";

  const ext = extractExtension(url);
  if (ext === "css") return "css";
  if (ext === "js" || ext === "mjs") return "script";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "ico"].includes(ext)) return "image";
  if (["woff", "woff2", "ttf", "otf", "eot"].includes(ext)) return "font";

  if (initiatorType === "link") return "css";
  return "other";
}

function extractExtension(url: string): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const lastDot = pathname.lastIndexOf(".");
    const lastSlash = pathname.lastIndexOf("/");
    if (lastDot > lastSlash && lastDot < pathname.length - 1) {
      return pathname.slice(lastDot + 1).toLowerCase();
    }
  } catch {
    // ignore
  }
  return "";
}
