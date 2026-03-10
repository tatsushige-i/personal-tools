import type { JsonParseError } from "../lib/types";

type JsonErrorDisplayProps = {
  error: JsonParseError;
};

export function JsonErrorDisplay({ error }: JsonErrorDisplayProps) {
  const location =
    error.line !== null
      ? ` (行: ${error.line}${error.column !== null ? `, 列: ${error.column}` : ""})`
      : "";

  return (
    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
      <p className="font-medium">構文エラー{location}</p>
      <p className="mt-1 font-mono text-xs">{error.message}</p>
    </div>
  );
}
