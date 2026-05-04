"use client";

import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DEVICE_LABELS,
  DEVICES,
  FORMATS,
  SCALES,
  type Device,
  type ImageFormat,
  type Scale,
} from "@/features/screenshot-tool/lib/types";

type Props = {
  url: string;
  devices: Device[];
  fullPage: boolean;
  format: ImageFormat;
  scale: Scale;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onDevicesChange: (devices: Device[]) => void;
  onFullPageChange: (fullPage: boolean) => void;
  onFormatChange: (format: ImageFormat) => void;
  onScaleChange: (scale: Scale) => void;
  onSubmit: () => void;
};

export function ScreenshotForm({
  url,
  devices,
  fullPage,
  format,
  scale,
  isLoading,
  onUrlChange,
  onDevicesChange,
  onFullPageChange,
  onFormatChange,
  onScaleChange,
  onSubmit,
}: Props) {
  const toggleDevice = (device: Device) => {
    if (devices.includes(device)) {
      const next = devices.filter((d) => d !== device);
      if (next.length > 0) onDevicesChange(next);
    } else {
      const next = DEVICES.filter((d) => devices.includes(d) || d === device);
      onDevicesChange([...next]);
    }
  };

  const canSubmit = url.trim().length > 0 && devices.length > 0 && !isLoading;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="screenshot-url">URL</Label>
        <Input
          id="screenshot-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>形式</Label>
          <Select
            value={format}
            onValueChange={(v) => onFormatChange(v as ImageFormat)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>解像度</Label>
          <Select
            value={String(scale)}
            onValueChange={(v) => onScaleChange(Number(v) as Scale)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCALES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="screenshot-fullpage">フルページ</Label>
          <div className="flex h-9 items-center gap-2">
            <Switch
              id="screenshot-fullpage"
              checked={fullPage}
              onCheckedChange={onFullPageChange}
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground">
              {fullPage ? "ページ全体" : "ビューポートのみ"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>デバイス</Label>
        <div className="flex flex-wrap gap-2">
          {DEVICES.map((device) => {
            const active = devices.includes(device);
            return (
              <Button
                key={device}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDevice(device)}
                disabled={isLoading || (active && devices.length === 1)}
                aria-pressed={active}
              >
                {DEVICE_LABELS[device]}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">少なくとも1つのデバイスを選択してください。</p>
      </div>

      <div>
        <Button type="submit" disabled={!canSubmit}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="h-4 w-4" aria-hidden="true" />
          )}
          {isLoading ? "撮影中…" : "撮影する"}
        </Button>
      </div>
    </form>
  );
}
