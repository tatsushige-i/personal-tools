"use client";

import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";
import { useRegexTester } from "../lib/use-regex-tester";
import { PatternInput } from "./pattern-input";
import { TestInput } from "./test-input";
import { MatchHighlight } from "./match-highlight";
import { CaptureGroups } from "./capture-groups";
import { PresetSelect } from "./preset-select";
import { ReplacePreview } from "./replace-preview";

export function RegexTesterPage() {
  const {
    pattern,
    setPattern,
    flags,
    testString,
    setTestString,
    replacement,
    setReplacement,
    regexResult,
    segments,
    replaceResult,
    handleFlagToggle,
    handlePresetSelect,
    handleClear,
  } = useRegexTester();

  const matches = regexResult.success ? regexResult.matches : [];
  const error = regexResult.success ? null : regexResult.error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Regex Tester</h1>
        <p className="mt-2 text-muted-foreground">
          正規表現のパターンマッチをリアルタイムで検証できます。
        </p>
      </div>

      <div className="flex items-center gap-2">
        <PresetSelect onSelect={handlePresetSelect} />
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!pattern && !testString}
        >
          <Eraser className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          クリア
        </Button>
      </div>

      <PatternInput
        pattern={pattern}
        flags={flags}
        error={error}
        onPatternChange={setPattern}
        onFlagToggle={handleFlagToggle}
      />

      <TestInput value={testString} onChange={setTestString} />

      <MatchHighlight segments={segments} matchCount={matches.length} />

      <CaptureGroups matches={matches} />

      <ReplacePreview
        replacement={replacement}
        replaceResult={replaceResult}
        hasMatches={matches.length > 0}
        onReplacementChange={setReplacement}
      />
    </div>
  );
}
