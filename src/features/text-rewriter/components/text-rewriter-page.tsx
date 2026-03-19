"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ApiErrorCode, RewriteMode } from "../lib/types";
import { validateInput, rewriteText, RewriteError } from "../lib/rewriter";
import { RewriterControls } from "./rewriter-controls";
import { RewriterOutput } from "./rewriter-output";

type ErrorState = {
  message: string;
  errorCode?: ApiErrorCode;
} | null;

export function TextRewriterPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<RewriteMode>("casual-to-business");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>(null);

  const handleSubmit = useCallback(async () => {
    setError(null);

    const validation = validateInput(text);
    if (!validation.valid) {
      setError({ message: validation.error });
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await rewriteText({ text, mode });
      setResult(response.result);
    } catch (e) {
      if (e instanceof RewriteError) {
        setError({ message: e.message, errorCode: e.errorCode });
      } else {
        setError({
          message: e instanceof Error ? e.message : "変換に失敗しました。",
        });
      }
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

      {error && error.errorCode === "PROMPT_INJECTION_DETECTED" && (
        <Alert role="alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>入力内容を確認してください</AlertTitle>
          <AlertDescription>
            AIへの指示と解釈される可能性のある表現が含まれているため、処理できませんでした。テキストの内容を見直して、再度お試しください。
          </AlertDescription>
        </Alert>
      )}

      {error &&
        (error.errorCode === "RATE_LIMITED" ||
          error.errorCode === "SERVER_ERROR") && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

      {error && !error.errorCode && (
        <p className="text-sm text-destructive" role="alert">
          {error.message}
        </p>
      )}

      <RewriterOutput result={result} />
    </div>
  );
}
