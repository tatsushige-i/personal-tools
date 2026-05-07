"use client";

import { useCallback, useState } from "react";
import { AlertTriangle, AlertCircle, Check, Copy, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClipboard } from "@/lib/use-clipboard";
import {
  JsonTransformError,
  MAX_INSTRUCTION_LENGTH,
  TRANSFORM_PRESETS,
  transformJson,
  validateInstructionInput,
} from "../lib/json-transform-client";
import type { JsonTransformApiErrorCode } from "../lib/types";

type ErrorState = {
  message: string;
  errorCode?: JsonTransformApiErrorCode;
} | null;

type JsonTransformPanelProps = {
  json: string;
};

export function JsonTransformPanel({ json }: JsonTransformPanelProps) {
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const { copy, isCopied } = useClipboard();

  const handleSubmit = useCallback(async () => {
    setError(null);

    const validation = validateInstructionInput(instruction, json);
    if (!validation.valid) {
      setError({ message: validation.error });
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await transformJson({ json, instruction });
      setResult(response.result);
    } catch (e) {
      if (e instanceof JsonTransformError) {
        setError({ message: e.message, errorCode: e.errorCode });
      } else {
        setError({
          message: e instanceof Error ? e.message : "変換に失敗しました。",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [instruction, json]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>プリセット指示</Label>
        <div className="flex flex-wrap gap-2">
          {TRANSFORM_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setInstruction(preset.instruction)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="json-transform-instruction">変換指示</Label>
        <Textarea
          id="json-transform-instruction"
          placeholder="例: TypeScript の型定義に変換してください"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={4}
          className="resize-y"
        />
        <p className="text-xs text-muted-foreground">
          {instruction.length} / {MAX_INSTRUCTION_LENGTH.toLocaleString()}文字
        </p>
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        <Sparkles className="mr-1 h-4 w-4" aria-hidden="true" />
        {loading ? "変換中..." : "AIで変換"}
      </Button>

      {error && error.errorCode === "PROMPT_INJECTION_DETECTED" && (
        <Alert role="alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>入力内容を確認してください</AlertTitle>
          <AlertDescription>
            AIへの指示と解釈される可能性のある表現が含まれているため、処理できませんでした。指示文の内容を見直して、再度お試しください。
          </AlertDescription>
        </Alert>
      )}

      {error &&
        error.errorCode &&
        error.errorCode !== "PROMPT_INJECTION_DETECTED" && (
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

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">変換結果</h2>
            <Button variant="outline" size="sm" onClick={() => copy(result)}>
              {isCopied ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  コピー
                </>
              )}
            </Button>
          </div>
          <div className="rounded-md border bg-muted/50 p-4">
            <pre className="text-sm break-all whitespace-pre-wrap">{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
