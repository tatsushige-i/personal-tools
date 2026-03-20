"use client";

import { cn } from "@/lib/utils";
import type { DiffChunk, DiffLine, DiffResult } from "@/features/diff-viewer/lib/types";

type DiffOutputProps = {
  result: DiffResult | null;
  diffMode: "line" | "word";
};

function DiffLineView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="overflow-x-auto rounded-md border font-mono text-sm">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="align-top">
              <td
                className={cn("w-1/2 whitespace-pre-wrap break-all border-r px-3 py-0.5", {
                  "bg-red-500/10 text-red-700 dark:text-red-400": line.left?.type === "removed",
                  "bg-muted/30": line.left?.type === "unchanged",
                })}
              >
                {line.left !== null && (
                  <>
                    <span className="mr-3 select-none text-xs text-muted-foreground">
                      {line.left.lineNumber}
                    </span>
                    {line.left.content}
                  </>
                )}
              </td>
              <td
                className={cn("w-1/2 whitespace-pre-wrap break-all px-3 py-0.5", {
                  "bg-green-500/10 text-green-700 dark:text-green-400": line.right?.type === "added",
                  "bg-muted/30": line.right?.type === "unchanged",
                })}
              >
                {line.right !== null && (
                  <>
                    <span className="mr-3 select-none text-xs text-muted-foreground">
                      {line.right.lineNumber}
                    </span>
                    {line.right.content}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiffWordView({ chunks }: { chunks: DiffChunk[] }) {
  return (
    <div className="rounded-md border p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
      {chunks.map((chunk, i) => (
        <span
          key={i}
          className={cn({
            "bg-red-500/15 text-red-700 line-through dark:text-red-400": chunk.type === "removed",
            "bg-green-500/15 text-green-700 dark:text-green-400": chunk.type === "added",
          })}
        >
          {chunk.value}
        </span>
      ))}
    </div>
  );
}

export function DiffOutput({ result, diffMode }: DiffOutputProps) {
  if (!result) return null;

  if (!result.success) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {result.error}
      </p>
    );
  }

  if (diffMode === "line") {
    if (result.lines.length === 0) return null;
    return <DiffLineView lines={result.lines} />;
  }

  if (result.chunks.length === 0) return null;
  return <DiffWordView chunks={result.chunks} />;
}
