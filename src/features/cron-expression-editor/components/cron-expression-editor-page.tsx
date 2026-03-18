"use client";

import { useMemo, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import type { CronField } from "../lib/types";
import {
  splitExpression,
  buildExpression,
  parseCronExpression,
} from "../lib/cron";
import { getDefaultTimezone } from "../lib/timezones";
import { CronTextInput } from "./cron-text-input";
import { CronFieldSelectors } from "./cron-field-selectors";
import { PresetSelector } from "./preset-selector";
import { CronDescription } from "./cron-description";
import { NextExecutions } from "./next-executions";

export function CronExpressionEditorPage() {
  const [expression, setExpression] = useState("* * * * *");
  const [timezone, setTimezone] = useState(getDefaultTimezone);

  const fields = useMemo(() => splitExpression(expression), [expression]);
  const parseResult = useMemo(
    () => parseCronExpression(expression, timezone),
    [expression, timezone],
  );

  const handleFieldChange = useCallback(
    (field: CronField, value: string) => {
      const updated = { ...splitExpression(expression), [field]: value };
      setExpression(buildExpression(updated));
    },
    [expression],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Cron Expression Editor
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cron式を視覚的に組み立て・検証できます
        </p>
      </div>

      <PresetSelector onSelect={setExpression} />

      <CronTextInput
        value={expression}
        onChange={setExpression}
        hasError={!parseResult.valid}
      />

      <CronFieldSelectors fields={fields} onFieldChange={handleFieldChange} />

      <CronDescription parseResult={parseResult} />

      <Separator />

      <NextExecutions
        executions={parseResult.valid ? parseResult.nextExecutions : []}
        timezone={timezone}
        onTimezoneChange={setTimezone}
      />
    </div>
  );
}
