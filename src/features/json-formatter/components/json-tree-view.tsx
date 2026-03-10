"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

type TreeNodeProps = {
  label: string;
  value: unknown;
  depth: number;
  defaultExpanded: boolean;
};

function TreeNode({ label, value, depth, defaultExpanded }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (value === null) {
    return (
      <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 }}>
        <span className="text-muted-foreground">{label}:</span>
        <span className="text-muted-foreground italic">null</span>
      </div>
    );
  }

  if (typeof value === "object") {
    const isArray = Array.isArray(value);
    const entries = isArray
      ? value.map((v, i) => [String(i), v] as const)
      : Object.entries(value as Record<string, unknown>);
    const bracket = isArray ? ["[", "]"] : ["{", "}"];

    return (
      <div>
        <button
          className="flex w-full items-center gap-1 py-0.5 text-left hover:bg-muted/50 rounded-sm"
          style={{ paddingLeft: depth * 16 }}
          onClick={() => setExpanded(!expanded)}
          type="button"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="text-muted-foreground">{label}:</span>
          {!expanded && (
            <span className="text-muted-foreground text-xs">
              {bracket[0]}...{bracket[1]}{" "}
              <span className="text-xs">({entries.length})</span>
            </span>
          )}
        </button>
        {expanded &&
          entries.map(([key, val]) => (
            <TreeNode
              key={key}
              label={key}
              value={val}
              depth={depth + 1}
              defaultExpanded={depth + 1 < 2}
            />
          ))}
      </div>
    );
  }

  let valueClass = "text-foreground";
  let displayValue = String(value);

  if (typeof value === "string") {
    valueClass = "text-green-600 dark:text-green-400";
    displayValue = `"${value}"`;
  } else if (typeof value === "number") {
    valueClass = "text-blue-600 dark:text-blue-400";
  } else if (typeof value === "boolean") {
    valueClass = "text-amber-600 dark:text-amber-400";
  }

  return (
    <div className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 }}>
      <span className="text-muted-foreground">{label}:</span>
      <span className={valueClass}>{displayValue}</span>
    </div>
  );
}

type JsonTreeViewProps = {
  data: unknown;
};

export function JsonTreeView({ data }: JsonTreeViewProps) {
  return (
    <div className="overflow-auto rounded-md border bg-muted/50 p-4 text-sm font-mono">
      <TreeNode label="root" value={data} depth={0} defaultExpanded />
    </div>
  );
}
