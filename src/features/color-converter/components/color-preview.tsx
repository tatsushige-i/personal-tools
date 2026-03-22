"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/lib/use-clipboard";
import type { ColorValue } from "../lib/types";

type Props = {
  color: ColorValue;
};

export function ColorPreview({ color }: Props) {
  const { copy, copiedValue } = useClipboard();

  const formats = [
    { label: "HEX", value: color.hex },
    {
      label: "RGB",
      value: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
    },
    {
      label: "HSL",
      value: `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
    },
  ];

  return (
    <div className="space-y-4">
      <div
        className="h-32 w-full rounded-lg border"
        style={{ backgroundColor: color.hex }}
      />
      <div className="space-y-2">
        {formats.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium text-muted-foreground">
                {label}:
              </span>{" "}
              <span className="font-mono">{value}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={`${label}をコピー`}
              onClick={() => copy(value)}
            >
              {copiedValue === value ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
            </Button>
          </div>
        ))}
        {color.tailwind && (
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">
                Tailwind:
              </span>{" "}
              <span className="font-mono">{color.tailwind}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Tailwindをコピー"
              onClick={() => copy(color.tailwind!)}
            >
              {copiedValue === color.tailwind ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
