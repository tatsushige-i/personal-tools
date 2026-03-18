"use client";

import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ColorValue } from "../lib/types";
import { calculateContrast } from "../lib/contrast";
import { createColorValue } from "../lib/color-conversions";

type Props = {
  foreground: ColorValue;
  background: ColorValue;
  onForegroundChange: (color: ColorValue) => void;
  onBackgroundChange: (color: ColorValue) => void;
};

export function ContrastChecker({
  foreground,
  background,
  onForegroundChange,
  onBackgroundChange,
}: Props) {
  const result = calculateContrast(foreground.hex, background.hex);

  const handleColorChange = (
    hex: string,
    setter: (color: ColorValue) => void,
  ) => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setter(createColorValue(hex.toLowerCase()));
    }
  };

  const swap = () => {
    onForegroundChange(background);
    onBackgroundChange(foreground);
  };

  const criteria = [
    { label: "AA", pass: result.aa, desc: "通常テキスト ≥ 4.5:1" },
    { label: "AA Large", pass: result.aaLarge, desc: "大きいテキスト ≥ 3:1" },
    { label: "AAA", pass: result.aaa, desc: "通常テキスト ≥ 7:1" },
    {
      label: "AAA Large",
      pass: result.aaaLarge,
      desc: "大きいテキスト ≥ 4.5:1",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">コントラスト比チェック</h2>

      <div className="flex items-end gap-3">
        {/* Foreground */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="contrast-fg">前景色</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={foreground.hex}
              onChange={(e) =>
                onForegroundChange(createColorValue(e.target.value))
              }
              className="h-9 w-12 cursor-pointer rounded-md border"
            />
            <Input
              id="contrast-fg"
              value={foreground.hex}
              onChange={(e) =>
                handleColorChange(e.target.value, onForegroundChange)
              }
              className="font-mono"
            />
          </div>
        </div>

        {/* Swap */}
        <Button
          variant="outline"
          size="icon"
          onClick={swap}
          className="mb-0.5"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        {/* Background */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="contrast-bg">背景色</Label>
          <div className="flex gap-2">
            <input
              type="color"
              value={background.hex}
              onChange={(e) =>
                onBackgroundChange(createColorValue(e.target.value))
              }
              className="h-9 w-12 cursor-pointer rounded-md border"
            />
            <Input
              id="contrast-bg"
              value={background.hex}
              onChange={(e) =>
                handleColorChange(e.target.value, onBackgroundChange)
              }
              className="font-mono"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div
        className="rounded-lg border p-6 text-center"
        style={{ backgroundColor: background.hex, color: foreground.hex }}
      >
        <p className="text-2xl font-bold">サンプルテキスト</p>
        <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
      </div>

      {/* Ratio */}
      <div className="text-center">
        <span className="text-4xl font-bold tabular-nums">
          {result.ratioText}
        </span>
      </div>

      {/* Criteria badges */}
      <div className="flex flex-wrap justify-center gap-2">
        {criteria.map(({ label, pass, desc }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Badge variant={pass ? "default" : "outline"}>
                {pass ? "✓" : "✗"} {label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{desc}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
