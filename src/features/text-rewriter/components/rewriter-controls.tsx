"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAX_LENGTH, REWRITE_MODE_OPTIONS } from "../lib/rewriter";
import type { RewriteMode } from "../lib/types";

type RewriterControlsProps = {
  text: string;
  mode: RewriteMode;
  loading: boolean;
  onTextChange: (text: string) => void;
  onModeChange: (mode: RewriteMode) => void;
  onSubmit: () => void;
};

export function RewriterControls({
  text,
  mode,
  loading,
  onTextChange,
  onModeChange,
  onSubmit,
}: RewriterControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rewrite-mode">変換モード</Label>
        <Select
          value={mode}
          onValueChange={(v) => onModeChange(v as RewriteMode)}
        >
          <SelectTrigger id="rewrite-mode" className="w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REWRITE_MODE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="input-text">入力テキスト</Label>
        <Textarea
          id="input-text"
          placeholder="変換したいテキストを入力してください..."
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={8}
          className="resize-y"
        />
        <p className="text-xs text-muted-foreground">
          {text.length} / {MAX_LENGTH.toLocaleString()}文字
        </p>
      </div>

      <Button onClick={onSubmit} disabled={loading}>
        {loading ? "変換中..." : "変換"}
      </Button>
    </div>
  );
}
