"use client";

import { Separator } from "@/components/ui/separator";
import { useQrGenerator } from "../lib/use-qr-generator";
import { InputTabs } from "./input-tabs";
import { QrOptionsPanel } from "./qr-options-panel";
import { QrPreview } from "./qr-preview";
import { QrDownloadActions } from "./qr-download-actions";

export function QrCodeGeneratorPage() {
  const {
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
  } = useQrGenerator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          QR Code Generator
        </h1>
        <p className="mt-2 text-muted-foreground">
          URLやテキストからQRコードを生成、サイズ・色・ロゴのカスタマイズ
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <InputTabs
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            urlValue={urlValue}
            onUrlChange={setUrlValue}
            textValue={textValue}
            onTextChange={setTextValue}
            wifiConfig={wifiConfig}
            onWifiConfigChange={setWifiConfig}
          />

          <Separator />

          <QrOptionsPanel
            size={size}
            onSizeChange={setSize}
            errorCorrectionLevel={errorCorrectionLevel}
            onErrorCorrectionLevelChange={setErrorCorrectionLevel}
            foregroundColor={foregroundColor}
            onForegroundColorChange={setForegroundColor}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            logoDataUrl={logoDataUrl}
            onLogoUpload={handleLogoUpload}
            onLogoRemove={handleLogoRemove}
            isErrorCorrectionUpgraded={isErrorCorrectionUpgraded}
          />
        </div>

        <div className="space-y-4">
          <QrPreview
            canvasRef={canvasRef}
            content={qrContent}
            options={qrOptions}
          />
          <QrDownloadActions content={qrContent} options={qrOptions} />
        </div>
      </div>
    </div>
  );
}
