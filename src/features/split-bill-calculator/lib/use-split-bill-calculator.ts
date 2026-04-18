"use client";

import { useState, useMemo, useCallback } from "react";
import type { BillItem, BillOptions, Participant, SplitResult } from "./types";
import { calculateSplit } from "./calculator";

let nextItemId = 1;
let nextParticipantId = 1;

function createItem(name = "", amount = ""): BillItem {
  return { id: `item-${nextItemId++}`, name, amount };
}

function createParticipant(name = "", ratio = "1"): Participant {
  return { id: `p-${nextParticipantId++}`, name, ratio };
}

const defaultOptions: BillOptions = {
  taxRate: "0",
  serviceChargeRate: "0",
  roundingMethod: "round",
  roundingUnit: 100,
};

export function useSplitBillCalculator() {
  const [items, setItems] = useState<BillItem[]>([createItem()]);
  const [participants, setParticipants] = useState<Participant[]>([
    createParticipant(),
    createParticipant(),
  ]);
  const [options, setOptions] = useState<BillOptions>(defaultOptions);

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, createItem()]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }, []);

  const updateItem = useCallback(
    (id: string, field: "name" | "amount", value: string) => {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
      );
    },
    [],
  );

  const addParticipant = useCallback(() => {
    setParticipants((prev) => [...prev, createParticipant()]);
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) =>
      prev.length > 1 ? prev.filter((p) => p.id !== id) : prev,
    );
  }, []);

  const updateParticipant = useCallback(
    (id: string, field: "name" | "ratio", value: string) => {
      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
      );
    },
    [],
  );

  const updateOptions = useCallback(
    <K extends keyof BillOptions>(key: K, value: BillOptions[K]) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const result: SplitResult | null = useMemo(
    () => calculateSplit(items, participants, options),
    [items, participants, options],
  );

  return {
    items,
    participants,
    options,
    result,
    addItem,
    removeItem,
    updateItem,
    addParticipant,
    removeParticipant,
    updateParticipant,
    updateOptions,
  };
}
