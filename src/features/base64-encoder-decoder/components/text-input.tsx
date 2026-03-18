"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Mode } from "../lib/types";

type TextInputProps = {
  value: string;
  mode: Mode;
  onChange: (value: string) => void;
};

export function TextInput({ value, mode, onChange }: TextInputProps) {
  const label = mode === "encode" ? "テキスト入力" : "Base64入力";
  const placeholder =
    mode === "encode"
      ? "エンコードするテキストを入力..."
      : "デコードするBase64文字列を入力...";

  return (
    <div className="space-y-2">
      <Label htmlFor="base64-input">{label}</Label>
      <Textarea
        id="base64-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[160px] font-mono text-sm"
      />
    </div>
  );
}
