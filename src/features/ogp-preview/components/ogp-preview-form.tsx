"use client";

import { Loader2, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  url: string;
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
};

export function OgpPreviewForm({ url, isLoading, onUrlChange, onSubmit }: Props) {
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
        <Label htmlFor="ogp-preview-url">URL</Label>
        <Input
          id="ogp-preview-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={!canSubmit}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ScanSearch className="h-4 w-4" aria-hidden="true" />
        )}
        {isLoading ? "解析中…" : "解析する"}
      </Button>
    </form>
  );
}
