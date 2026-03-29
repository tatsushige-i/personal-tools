"use client";

import { useState, useMemo, useCallback } from "react";
import type { RegexFlag, RegexFlags, Preset } from "./types";
import { findMatches, buildSegments, computeReplacement } from "./regex-engine";

const DEFAULT_FLAGS: RegexFlags = { g: true, i: false, m: false, s: false };

export function useRegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<RegexFlags>(DEFAULT_FLAGS);
  const [testString, setTestString] = useState("");
  const [replacement, setReplacement] = useState("");

  const regexResult = useMemo(
    () => findMatches(pattern, flags, testString),
    [pattern, flags, testString],
  );

  const segments = useMemo(() => {
    if (!regexResult.success) return [];
    return buildSegments(testString, regexResult.matches);
  }, [testString, regexResult]);

  const replaceResult = useMemo(() => {
    if (!replacement) return null;
    return computeReplacement(pattern, flags, testString, replacement);
  }, [pattern, flags, testString, replacement]);

  const handleFlagToggle = useCallback((flag: RegexFlag) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const handlePresetSelect = useCallback((preset: Preset) => {
    setPattern(preset.pattern);
    setFlags({ ...preset.flags });
    setTestString(preset.testExample);
    setReplacement("");
  }, []);

  const handleClear = useCallback(() => {
    setPattern("");
    setFlags(DEFAULT_FLAGS);
    setTestString("");
    setReplacement("");
  }, []);

  return {
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
  };
}
