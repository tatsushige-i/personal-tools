"use client";

import { Separator } from "@/components/ui/separator";
import { useColorConverter } from "../lib/use-color-converter";
import { ColorInputPanel } from "./color-input-panel";
import { ColorPreview } from "./color-preview";
import { ContrastChecker } from "./contrast-checker";
import { PalettePanel } from "./palette-panel";

export function ColorConverterPage() {
  const {
    currentColor,
    setCurrentColor,
    contrastFg,
    setContrastFg,
    contrastBg,
    setContrastBg,
    palette,
    addToPalette,
    removeFromPalette,
    selectFromPalette,
  } = useColorConverter();

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
