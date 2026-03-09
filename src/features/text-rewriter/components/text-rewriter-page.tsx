"use client";

import { useState, useCallback } from "react";
import type { RewriteMode } from "../lib/types";
import { validateInput, rewriteText } from "../lib/rewriter";
import { RewriterControls } from "./rewriter-controls";
import { RewriterOutput } from "./rewriter-output";

export function TextRewriterPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<RewriteMode>("casual-to-business");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(async () => {
    setError("");

    const validation = validateInput(text);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await rewriteText({ text, mode });
      setResult(response.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "変換に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [text, mode]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Text Rewriter</h1>
        <p className="mt-2 text-muted-foreground">
          テキストを指定したトーン・スタイルに変換します。
        </p>
      </div>

      <RewriterControls
        text={text}
        mode={mode}
        loading={loading}
        onTextChange={setText}
        onModeChange={setMode}
        onSubmit={handleSubmit}
      />

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <RewriterOutput result={result} />
    </div>
  );
}
