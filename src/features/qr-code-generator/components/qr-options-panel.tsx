import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ImagePlus, X } from "lucide-react";
import type { QrSize, ErrorCorrectionLevel } from "../lib/types";

type QrOptionsPanelProps = {
  size: QrSize;
  onSizeChange: (size: QrSize) => void;
  errorCorrectionLevel: ErrorCorrectionLevel;
  onErrorCorrectionLevelChange: (level: ErrorCorrectionLevel) => void;
  foregroundColor: string;
  onForegroundColorChange: (color: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  logoDataUrl: string | null;
  onLogoUpload: (file: File) => void;
  onLogoRemove: () => void;
  isErrorCorrectionUpgraded: boolean;
};

export function QrOptionsPanel({
  size,
  onSizeChange,
  errorCorrectionLevel,
  onErrorCorrectionLevelChange,
  foregroundColor,
  onForegroundColorChange,
  backgroundColor,
  onBackgroundColorChange,
  logoDataUrl,
  onLogoUpload,
  onLogoRemove,
  isErrorCorrectionUpgraded,
}: QrOptionsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qr-size">サイズ</Label>
          <Select value={size} onValueChange={(v) => onSizeChange(v as QrSize)}>
            <SelectTrigger id="qr-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S">S（128px）</SelectItem>
              <SelectItem value="M">M（256px）</SelectItem>
              <SelectItem value="L">L（512px）</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qr-error-correction">エラー訂正</Label>
          <Select
            value={errorCorrectionLevel}
            onValueChange={(v) =>
              onErrorCorrectionLevelChange(v as ErrorCorrectionLevel)
            }
          >
            <SelectTrigger id="qr-error-correction">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">L（7%）</SelectItem>
              <SelectItem value="M">M（15%）</SelectItem>
              <SelectItem value="Q">Q（25%）</SelectItem>
              <SelectItem value="H">H（30%）</SelectItem>
            </SelectContent>
          </Select>
          {isErrorCorrectionUpgraded && (
            <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              ロゴ使用のためQに自動変更
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qr-fg-color">前景色</Label>
          <div className="flex items-center gap-2">
            <input
              id="qr-fg-color"
              type="color"
              value={foregroundColor}
              onChange={(e) => onForegroundColorChange(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border"
            />
            <span className="font-mono text-sm">{foregroundColor}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qr-bg-color">背景色</Label>
          <div className="flex items-center gap-2">
            <input
              id="qr-bg-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border"
            />
            <span className="font-mono text-sm">{backgroundColor}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>ロゴ（中央に配置）</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLogoUpload(file);
          }}
        />
        {logoDataUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDataUrl}
              alt="ロゴプレビュー"
              className="h-10 w-10 rounded border object-contain"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onLogoRemove();
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              <X className="mr-1 h-3 w-3" />
              削除
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="mr-1 h-4 w-4" />
            画像を選択
          </Button>
        )}
      </div>
    </div>
  );
}
