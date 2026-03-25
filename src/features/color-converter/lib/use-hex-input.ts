import { useState, useCallback } from "react";
import type { ColorValue } from "./types";
import { createColorValue } from "./color-conversions";

export function useHexInput(
  color: ColorValue,
  onChange: (color: ColorValue) => void,
) {
  // null = not editing, string = user is typing
  const [draft, setDraft] = useState<string | null>(null);

  const text = draft ?? color.hex;

  const handleChange = useCallback((value: string) => {
    setDraft(value);
  }, []);

  const commit = useCallback(() => {
    if (draft === null) return;
    const cleaned = draft.startsWith("#") ? draft : `#${draft}`;
    if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
      const cv = createColorValue(cleaned.toLowerCase());
      if (cv) onChange(cv);
    }
    setDraft(null);
  }, [draft, onChange]);

  return { text, handleChange, commit };
}
