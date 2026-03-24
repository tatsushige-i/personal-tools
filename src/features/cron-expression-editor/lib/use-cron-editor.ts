import { useMemo, useState, useCallback } from "react";
import type { CronField } from "./types";
import { splitExpression, buildExpression, parseCronExpression } from "./cron";
import { getDefaultTimezone } from "./timezones";

const SSR_DEFAULT_TZ = "Asia/Tokyo";

export function useCronEditor() {
  const [expression, setExpression] = useState("* * * * *");
  const [timezone, setTimezone] = useState(() =>
    typeof window === "undefined" ? SSR_DEFAULT_TZ : getDefaultTimezone(),
  );

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

  return {
    expression,
    setExpression,
    timezone,
    setTimezone,
    fields,
    parseResult,
    handleFieldChange,
  };
}
