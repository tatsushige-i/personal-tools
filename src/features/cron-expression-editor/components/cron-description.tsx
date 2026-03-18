"use client";

import type { CronParseResult } from "../lib/types";

type CronDescriptionProps = {
  parseResult: CronParseResult;
};

export function CronDescription({ parseResult }: CronDescriptionProps) {
  if (!parseResult.valid) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {parseResult.error}
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      {parseResult.description}
    </p>
  );
}
