"use client";

import { useCallback, useState } from "react";
import { Separator } from "@/components/ui/separator";
import type { ColorValue, PaletteEntry } from "../lib/types";
import { createColorValue } from "../lib/color-conversions";
import { ColorInputPanel } from "./color-input-panel";
import { ColorPreview } from "./color-preview";
import { ContrastChecker } from "./contrast-checker";
import { PalettePanel } from "./palette-panel";

const INITIAL_COLOR = createColorValue("#3b82f6");
const INITIAL_BG = createColorValue("#ffffff");

export function ColorConverterPage() {
  const [currentColor, setCurrentColor] = useState<ColorValue>(INITIAL_COLOR);
  const [contrastFg, setContrastFg] = useState<ColorValue>(INITIAL_COLOR);
  const [contrastBg, setContrastBg] = useState<ColorValue>(INITIAL_BG);
  const [palette, setPalette] = useState<PaletteEntry[]>([]);

  const addToPalette = useCallback(() => {
    setPalette((prev) => [
      ...prev,
      { id: crypto.randomUUID(), color: currentColor },
    ]);
  }, [currentColor]);

  const removeFromPalette = useCallback((id: string) => {
    setPalette((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const selectFromPalette = useCallback((color: ColorValue) => {
    setCurrentColor(color);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Color Converter</h1>
        <p className="mt-2 text-muted-foreground">
          HEX / RGB / HSL / Tailwind色名の相互変換、コントラスト比チェック
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ColorInputPanel color={currentColor} onChange={setCurrentColor} />
        <ColorPreview color={currentColor} />
      </div>

      <Separator />

      <ContrastChecker
        foreground={contrastFg}
        background={contrastBg}
        onForegroundChange={setContrastFg}
        onBackgroundChange={setContrastBg}
      />

      <Separator />

      <PalettePanel
        palette={palette}
        onAdd={addToPalette}
        onRemove={removeFromPalette}
        onSelect={selectFromPalette}
      />
    </div>
  );
}
