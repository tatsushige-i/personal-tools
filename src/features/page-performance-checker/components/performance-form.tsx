"use client";

import { Gauge, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEVICE_LABELS,
  DEVICES,
  type Device,
} from "@/features/page-performance-checker/lib/types";

type Props = {
  url: string;
  devices: Device[];
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onDevicesChange: (devices: Device[]) => void;
  onSubmit: () => void;
};

export function PerformanceForm({
  url,
  devices,
  isLoading,
  onUrlChange,
  onDevicesChange,
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
        <Label htmlFor="performance-url">URL</Label>
        <Input
          id="performance-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={isLoading}
        />
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
            <Gauge className="h-4 w-4" aria-hidden="true" />
          )}
          {isLoading ? "計測中…" : "計測する"}
        </Button>
      </div>
    </form>
  );
}
