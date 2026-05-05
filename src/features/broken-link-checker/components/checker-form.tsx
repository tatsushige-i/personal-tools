"use client";

import { Link2Off, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEPTHS,
  DEPTH_LABELS,
  isDepth,
  type Depth,
} from "@/features/broken-link-checker/lib/types";

type Props = {
  url: string;
  depth: Depth;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onDepthChange: (depth: Depth) => void;
  onSubmit: () => void;
};

export function CheckerForm({
  url,
  depth,
  isLoading,
  onUrlChange,
  onDepthChange,
  onSubmit,
}: Props) {
  const canSubmit = url.trim().length > 0 && !isLoading;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="checker-url">URL</Label>
        <Input
          id="checker-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="checker-depth">クロール階層</Label>
        <Select
          value={String(depth)}
          onValueChange={(value) => {
            const parsed = Number(value);
            if (isDepth(parsed)) onDepthChange(parsed);
          }}
          disabled={isLoading}
        >
          <SelectTrigger id="checker-depth" className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEPTHS.map((d) => (
              <SelectItem key={d} value={String(d)}>
                {DEPTH_LABELS[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          2階層を選ぶと、入力URLに加えて見つかった内部リンク先（最大5ページ）も追加でクロールします。
        </p>
      </div>

      <div>
        <Button type="submit" disabled={!canSubmit}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Link2Off className="h-4 w-4" aria-hidden="true" />
          )}
          {isLoading ? "チェック中…" : "チェックする"}
        </Button>
      </div>
    </form>
  );
}
