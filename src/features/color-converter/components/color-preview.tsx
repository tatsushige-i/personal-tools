"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ColorValue } from "../lib/types";

type Props = {
  color: ColorValue;
};

export function ColorPreview({ color }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

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
              onClick={() => copyToClipboard(value, label)}
            >
              {copiedField === label ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
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
              onClick={() => copyToClipboard(color.tailwind!, "tailwind")}
            >
              {copiedField === "tailwind" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
