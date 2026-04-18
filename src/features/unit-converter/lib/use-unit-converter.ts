"use client";

import { useState, useMemo, useCallback } from "react";
import type { ActiveInput, Category, PinnedConversion } from "./types";
import { CATEGORIES } from "./units";
import { convert } from "./converter";

export function useUnitConverter() {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnitId, setFromUnitId] = useState("km");
  const [toUnitId, setToUnitId] = useState("m");
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");
  const [activeInput, setActiveInput] = useState<ActiveInput>("from");
  const [pinnedConversions, setPinnedConversions] = useState<PinnedConversion[]>([]);

  const categoryConfig = useMemo(
    () => CATEGORIES.find((c) => c.id === category)!,
    [category],
  );

  const conversionResult = useMemo(() => {
    const inputValue = activeInput === "from" ? fromValue : toValue;
    const parsed = parseFloat(inputValue);
    if (inputValue === "" || isNaN(parsed)) return null;

    if (activeInput === "from") {
      return convert(parsed, fromUnitId, toUnitId, category);
    } else {
      return convert(parsed, toUnitId, fromUnitId, category);
    }
  }, [fromValue, toValue, fromUnitId, toUnitId, category, activeInput]);

  const displayFromValue = activeInput === "from" ? fromValue : (conversionResult ? formatDisplay(conversionResult.value) : "");
  const displayToValue = activeInput === "to" ? toValue : (conversionResult ? formatDisplay(conversionResult.value) : "");

  const handleFromValueChange = useCallback((value: string) => {
    setFromValue(value);
    setActiveInput("from");
  }, []);

  const handleToValueChange = useCallback((value: string) => {
    setToValue(value);
    setActiveInput("to");
  }, []);

  const handleSwap = useCallback(() => {
    setFromUnitId(() => {
      setToUnitId(fromUnitId);
      return toUnitId;
    });
    if (activeInput === "from") {
      setFromValue(displayToValue);
    } else {
      setToValue(displayFromValue);
    }
  }, [fromUnitId, toUnitId, activeInput, displayFromValue, displayToValue]);

  const handleCategoryChange = useCallback(
    (newCategory: Category) => {
      setCategory(newCategory);
      const config = CATEGORIES.find((c) => c.id === newCategory)!;
      setFromUnitId(config.units[0]?.id ?? "");
      setToUnitId(config.units[1]?.id ?? config.units[0]?.id ?? "");
      setFromValue("1");
      setToValue("");
      setActiveInput("from");
    },
    [],
  );

  const handlePin = useCallback(() => {
    const alreadyPinned = pinnedConversions.some(
      (p) => p.category === category && p.fromUnitId === fromUnitId && p.toUnitId === toUnitId,
    );
    if (alreadyPinned) return;

    setPinnedConversions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        category,
        fromUnitId,
        toUnitId,
      },
    ]);
  }, [category, fromUnitId, toUnitId, pinnedConversions]);

  const handleUnpin = useCallback((id: string) => {
    setPinnedConversions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleApplyPinned = useCallback((pinned: PinnedConversion) => {
    setCategory(pinned.category);
    setFromUnitId(pinned.fromUnitId);
    setToUnitId(pinned.toUnitId);
    setFromValue("1");
    setToValue("");
    setActiveInput("from");
  }, []);

  const isPinned = pinnedConversions.some(
    (p) => p.category === category && p.fromUnitId === fromUnitId && p.toUnitId === toUnitId,
  );

  return {
    category,
    fromUnitId,
    toUnitId,
    displayFromValue,
    displayToValue,
    activeInput,
    categoryConfig,
    conversionResult,
    pinnedConversions,
    isPinned,
    setFromUnitId,
    setToUnitId,
    onFromValueChange: handleFromValueChange,
    onToValueChange: handleToValueChange,
    onSwap: handleSwap,
    onCategoryChange: handleCategoryChange,
    onPin: handlePin,
    onUnpin: handleUnpin,
    onApplyPinned: handleApplyPinned,
  };
}

function formatDisplay(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toPrecision(10)).toString();
}
