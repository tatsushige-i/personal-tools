export type InputMode = "url" | "text" | "wifi";

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export type WifiConfig = {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
};

export type QrSize = "S" | "M" | "L";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type QrOptions = {
  size: QrSize;
  errorCorrectionLevel: ErrorCorrectionLevel;
  foregroundColor: string;
  backgroundColor: string;
  logoDataUrl: string | null;
};

export const SIZE_MAP: Record<QrSize, number> = {
  S: 128,
  M: 256,
  L: 512,
};

export const LOGO_RATIO = 0.22;
