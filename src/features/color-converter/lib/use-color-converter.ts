import { useCallback, useState } from "react";
import type { ColorValue, PaletteEntry } from "./types";
import { createColorValue } from "./color-conversions";

const INITIAL_COLOR = createColorValue("#3b82f6")!;
const INITIAL_BG = createColorValue("#ffffff")!;

export function useColorConverter() {
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

  return {
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
  };
}
