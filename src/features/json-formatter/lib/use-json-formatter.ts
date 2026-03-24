import { useState, useMemo } from "react";
import type { IndentSize, ViewMode } from "./types";
import { parseJson, formatJson, minifyJson } from "./json-formatter";
import { applyPathFilter } from "./json-path-filter";

export function useJsonFormatter() {
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
    if (viewMode !== "formatted" || !filteredResult?.success) return "";
    return JSON.stringify(filteredResult.data, null, indentSize);
  }, [filteredResult, indentSize, viewMode]);

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

  return {
    input,
    setInput,
    indentSize,
    setIndentSize,
    viewMode,
    setViewMode,
    pathFilter,
    setPathFilter,
    parseResult,
    filteredResult,
    outputText,
    handleFormat,
    handleMinify,
    handleClear,
  };
}
