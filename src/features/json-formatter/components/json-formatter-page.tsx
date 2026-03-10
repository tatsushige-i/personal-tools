"use client";

import { useState, useMemo } from "react";
import type { IndentSize, ViewMode } from "../lib/types";
import { parseJson, formatJson, minifyJson } from "../lib/json-formatter";
import { applyPathFilter } from "../lib/json-path-filter";
import { JsonInput } from "./json-input";
import { FormatControls } from "./format-controls";
import { PathFilter } from "./path-filter";
import { JsonErrorDisplay } from "./json-error-display";
import { JsonOutput } from "./json-output";
import { JsonTreeView } from "./json-tree-view";

export function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [viewMode, setViewMode] = useState<ViewMode>("formatted");
  const [pathFilter, setPathFilter] = useState("");

  const parseResult = useMemo(() => parseJson(input), [input]);

  const filteredResult = useMemo(() => {
    if (!parseResult.success) return null;
    if (!pathFilter.trim() || pathFilter.trim() === ".") {
      return { success: true as const, data: parseResult.data };
    }
    try {
      const data = applyPathFilter(parseResult.data, pathFilter);
      return { success: true as const, data };
    } catch (e) {
      return {
        success: false as const,
        error: e instanceof Error ? e.message : "Invalid path",
      };
    }
  }, [parseResult, pathFilter]);

  const outputText = useMemo(() => {
    if (!filteredResult?.success) return "";
    return JSON.stringify(filteredResult.data, null, indentSize);
  }, [filteredResult, indentSize]);

  const handleFormat = () => {
    try {
      setInput(formatJson(input, indentSize));
    } catch {
      // parseResult already shows the error
    }
  };

  const handleMinify = () => {
    try {
      setInput(minifyJson(input));
    } catch {
      // parseResult already shows the error
    }
  };

  const handleClear = () => {
    setInput("");
    setPathFilter("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JSON Formatter</h1>
        <p className="mt-2 text-muted-foreground">
          JSONの整形・圧縮・構文検証・ツリー表示ができます。
        </p>
      </div>

      <FormatControls
        indentSize={indentSize}
        viewMode={viewMode}
        hasInput={input.trim().length > 0}
        onIndentSizeChange={setIndentSize}
        onViewModeChange={setViewMode}
        onFormat={handleFormat}
        onMinify={handleMinify}
        onClear={handleClear}
      />

      <PathFilter value={pathFilter} onChange={setPathFilter} />

      <JsonInput value={input} onChange={setInput} />

      {input.trim() && !parseResult.success && (
        <JsonErrorDisplay error={parseResult.error} />
      )}

      {filteredResult && !filteredResult.success && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">パスフィルターエラー</p>
          <p className="mt-1 font-mono text-xs">{filteredResult.error}</p>
        </div>
      )}

      {filteredResult?.success && (
        <>
          {viewMode === "formatted" ? (
            <JsonOutput value={outputText} />
          ) : (
            <JsonTreeView data={filteredResult.data} />
          )}
        </>
      )}
    </div>
  );
}
