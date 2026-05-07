"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJsonFormatter } from "../lib/use-json-formatter";
import { JsonInput } from "./json-input";
import { FormatControls } from "./format-controls";
import { PathFilter } from "./path-filter";
import { JsonErrorDisplay } from "./json-error-display";
import { JsonOutput } from "./json-output";
import { JsonTreeView } from "./json-tree-view";
import { JsonTransformPanel } from "./json-transform-panel";

export function JsonFormatterPage() {
  const {
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
  } = useJsonFormatter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JSON Formatter</h1>
        <p className="mt-2 text-muted-foreground">
          JSONの整形・圧縮・構文検証・ツリー表示と、AIによる自然言語変換ができます。
        </p>
      </div>

      <JsonInput value={input} onChange={setInput} />

      {input.trim() && !parseResult.success && (
        <JsonErrorDisplay error={parseResult.error} />
      )}

      <Tabs defaultValue="format">
        <TabsList>
          <TabsTrigger value="format">整形・検証</TabsTrigger>
          <TabsTrigger value="ai">AI変換</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="ai">
          <JsonTransformPanel json={input} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
