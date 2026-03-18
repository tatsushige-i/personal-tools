"use client";

import { useState, useMemo } from "react";
import type { Mode } from "../lib/types";
import { encodeText, decodeText } from "../lib/base64";
import { ModeControls } from "./mode-controls";
import { TextInput } from "./text-input";
import { TextOutput } from "./text-output";
import { FileDropZone } from "./file-drop-zone";
import { Separator } from "@/components/ui/separator";

export function Base64EncoderDecoderPage() {
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (input.length === 0) return null;
    return mode === "encode"
      ? encodeText(input, urlSafe)
      : decodeText(input, urlSafe);
  }, [input, mode, urlSafe]);

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Base64 Encoder / Decoder
        </h1>
        <p className="mt-2 text-muted-foreground">
          テキスト⇔Base64の相互変換、ファイルのBase64エンコード・Data URI生成ができます。
        </p>
      </div>

      <ModeControls
        mode={mode}
        urlSafe={urlSafe}
        hasInput={input.length > 0}
        onModeChange={setMode}
        onUrlSafeChange={setUrlSafe}
        onClear={handleClear}
      />

      <TextInput value={input} mode={mode} onChange={setInput} />

      <TextOutput result={result} mode={mode} input={input} />

      <Separator />

      <FileDropZone urlSafe={urlSafe} />
    </div>
  );
}
