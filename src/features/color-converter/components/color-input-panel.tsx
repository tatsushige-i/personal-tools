"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ColorValue } from "../lib/types";
import {
  rgbToHex,
  hslToRgb,
  createColorValue,
} from "../lib/color-conversions";
import { findClosestTailwind } from "../lib/tailwind-colors";

type Props = {
  color: ColorValue;
  onChange: (color: ColorValue) => void;
};

export function ColorInputPanel({ color, onChange }: Props) {
  // null = not editing, string = user is typing
  const [hexDraft, setHexDraft] = useState<string | null>(null);

  const displayHex = hexDraft ?? color.hex;

  const commitHex = useCallback(() => {
    if (hexDraft === null) return;
    const cleaned = hexDraft.startsWith("#") ? hexDraft : `#${hexDraft}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      const cv = createColorValue(cleaned.toLowerCase());
      if (cv) onChange(cv);
    }
    setHexDraft(null);
  }, [hexDraft, onChange]);

  const handlePickerChange = useCallback(
    (value: string) => {
      const cv = createColorValue(value);
      if (cv) onChange(cv);
    },
    [onChange],
  );

  const handleRgbChange = useCallback(
    (channel: "r" | "g" | "b", value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0 || num > 255) return;
      const rgb = { ...color.rgb, [channel]: num };
      const cv = createColorValue(rgbToHex(rgb));
      if (cv) onChange(cv);
    },
    [color.rgb, onChange],
  );

  const handleHslChange = useCallback(
    (channel: "h" | "s" | "l", value: string) => {
      const num = parseInt(value);
      if (isNaN(num)) return;
      const max = channel === "h" ? 360 : 100;
      if (num < 0 || num > max) return;
      const hsl = { ...color.hsl, [channel]: num };
      const rgb = hslToRgb(hsl);
      const cv = createColorValue(rgbToHex(rgb));
      if (cv) onChange(cv);
    },
    [color.hsl, onChange],
  );

  const closest = color.tailwind ? null : findClosestTailwind(color.hex);

  return (
    <div className="space-y-4">
      {/* Color Picker */}
      <div className="space-y-2">
        <Label htmlFor="color-picker">カラーピッカー</Label>
        <input
          id="color-picker"
          type="color"
          value={color.hex}
          onChange={(e) => handlePickerChange(e.target.value)}
          className="h-10 w-full cursor-pointer rounded-md border"
        />
      </div>

      {/* HEX */}
      <div className="space-y-2">
        <Label htmlFor="hex-input">HEX</Label>
        <Input
          id="hex-input"
          value={displayHex}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => e.key === "Enter" && commitHex()}
          placeholder="#000000"
          className="font-mono"
        />
      </div>

      {/* RGB */}
      <div className="space-y-2">
        <Label>RGB</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["r", "g", "b"] as const).map((ch) => (
            <div key={ch}>
              <Label
                htmlFor={`rgb-${ch}`}
                className="text-xs text-muted-foreground"
              >
                {ch.toUpperCase()}
              </Label>
              <Input
                id={`rgb-${ch}`}
                type="number"
                min={0}
                max={255}
                value={color.rgb[ch]}
                onChange={(e) => handleRgbChange(ch, e.target.value)}
                className="font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* HSL */}
      <div className="space-y-2">
        <Label>HSL</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["h", "s", "l"] as const).map((ch) => (
            <div key={ch}>
              <Label
                htmlFor={`hsl-${ch}`}
                className="text-xs text-muted-foreground"
              >
                {ch === "h" ? "H (°)" : ch === "s" ? "S (%)" : "L (%)"}
              </Label>
              <Input
                id={`hsl-${ch}`}
                type="number"
                min={0}
                max={ch === "h" ? 360 : 100}
                value={color.hsl[ch]}
                onChange={(e) => handleHslChange(ch, e.target.value)}
                className="font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tailwind */}
      <div className="space-y-2">
        <Label>Tailwind</Label>
        {color.tailwind ? (
          <Badge variant="secondary" className="font-mono">
            {color.tailwind}
          </Badge>
        ) : closest ? (
          <p className="text-sm text-muted-foreground">
            最近傍:{" "}
            <button
              type="button"
              className="font-mono underline underline-offset-2 hover:text-foreground"
              onClick={() => {
                const cv = createColorValue(closest.hex);
                if (cv) onChange(cv);
              }}
            >
              {closest.name}
            </button>
            <span
              className="ml-2 inline-block h-3 w-3 rounded-full border align-middle"
              style={{ backgroundColor: closest.hex }}
            />
          </p>
        ) : null}
      </div>
    </div>
  );
}
