import { useState, useMemo, useCallback, useRef } from "react";
import type {
  InputMode,
  WifiConfig,
  QrSize,
  ErrorCorrectionLevel,
  QrOptions,
} from "./types";
import { buildWifiString } from "./wifi-format";

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const DEFAULT_WIFI_CONFIG: WifiConfig = {
  ssid: "",
  password: "",
  encryption: "WPA",
  hidden: false,
};

export function useQrGenerator() {
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [urlValue, setUrlValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [wifiConfig, setWifiConfig] = useState<WifiConfig>(DEFAULT_WIFI_CONFIG);

  const [size, setSize] = useState<QrSize>("M");
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("M");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const qrContent = useMemo(() => {
    switch (inputMode) {
      case "url":
        return urlValue;
      case "text":
        return textValue;
      case "wifi":
        return wifiConfig.ssid ? buildWifiString(wifiConfig) : "";
    }
  }, [inputMode, urlValue, textValue, wifiConfig]);

  const effectiveErrorCorrectionLevel = useMemo<ErrorCorrectionLevel>(() => {
    if (logoDataUrl && (errorCorrectionLevel === "L" || errorCorrectionLevel === "M")) {
      return "Q";
    }
    return errorCorrectionLevel;
  }, [logoDataUrl, errorCorrectionLevel]);

  const isErrorCorrectionUpgraded = logoDataUrl !== null &&
    (errorCorrectionLevel === "L" || errorCorrectionLevel === "M");

  const qrOptions = useMemo<QrOptions>(
    () => ({
      size,
      errorCorrectionLevel: effectiveErrorCorrectionLevel,
      foregroundColor,
      backgroundColor,
      logoDataUrl,
    }),
    [size, effectiveErrorCorrectionLevel, foregroundColor, backgroundColor, logoDataUrl]
  );

  const handleLogoUpload = useCallback((file: File) => {
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleLogoRemove = useCallback(() => {
    setLogoDataUrl(null);
  }, []);

  return {
    inputMode,
    setInputMode,
    urlValue,
    setUrlValue,
    textValue,
    setTextValue,
    wifiConfig,
    setWifiConfig,
    size,
    setSize,
    errorCorrectionLevel,
    setErrorCorrectionLevel,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    logoDataUrl,
    handleLogoUpload,
    handleLogoRemove,
    canvasRef,
    qrContent,
    qrOptions,
    isErrorCorrectionUpgraded,
  };
}
