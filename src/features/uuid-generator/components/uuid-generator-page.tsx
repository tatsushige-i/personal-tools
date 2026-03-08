"use client";

import { useState, useCallback } from "react";
import type { IdType, GenerationRecord } from "../lib/types";
import { generateIds } from "../lib/uuid";
import { GeneratorControls } from "./generator-controls";
import { GeneratedOutput } from "./generated-output";
import { GenerationHistory } from "./generation-history";

export function UuidGeneratorPage() {
  const [idType, setIdType] = useState<IdType>("uuidv4");
  const [count, setCount] = useState(1);
  const [generatedValues, setGeneratedValues] = useState<string[]>([]);
  const [history, setHistory] = useState<GenerationRecord[]>([]);

  const handleGenerate = useCallback(() => {
    const values = generateIds(idType, count);
    setGeneratedValues(values);
    setHistory((prev) => [
      {
        id: crypto.randomUUID(),
        type: idType,
        values,
        count,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }, [idType, count]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UUID Generator</h1>
        <p className="mt-2 text-muted-foreground">
          UUID v4/v7・ULIDを生成してクリップボードにコピーできます。
        </p>
      </div>

      <GeneratorControls
        idType={idType}
        count={count}
        onIdTypeChange={setIdType}
        onCountChange={setCount}
        onGenerate={handleGenerate}
      />

      <GeneratedOutput values={generatedValues} />

      <GenerationHistory history={history} />
    </div>
  );
}
