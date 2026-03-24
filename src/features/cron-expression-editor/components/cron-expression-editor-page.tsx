"use client";

import { Separator } from "@/components/ui/separator";
import { useCronEditor } from "../lib/use-cron-editor";
import { CronTextInput } from "./cron-text-input";
import { CronFieldSelectors } from "./cron-field-selectors";
import { PresetSelector } from "./preset-selector";
import { CronDescription } from "./cron-description";
import { NextExecutions } from "./next-executions";

export function CronExpressionEditorPage() {
  const {
    expression,
    setExpression,
    timezone,
    setTimezone,
    fields,
    parseResult,
    handleFieldChange,
  } = useCronEditor();

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
