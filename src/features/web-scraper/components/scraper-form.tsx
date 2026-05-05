"use client";

import { Loader2, MousePointerClick, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_SELECTORS,
  type ScraperSelectorInput,
} from "@/features/web-scraper/lib/types";

type Props = {
  url: string;
  selectors: ScraperSelectorInput[];
  isLoading: boolean;
  onUrlChange: (url: string) => void;
  onSelectorsChange: (selectors: ScraperSelectorInput[]) => void;
  onSubmit: () => void;
};

export function ScraperForm({
  url,
  selectors,
  isLoading,
  onUrlChange,
  onSelectorsChange,
  onSubmit,
}: Props) {
  const hasSelectorEntered = selectors.some((s) => s.selector.trim().length > 0);
  const canSubmit = url.trim().length > 0 && hasSelectorEntered && !isLoading;
  const canAdd = selectors.length < MAX_SELECTORS;

  const updateSelector = (index: number, patch: Partial<ScraperSelectorInput>) => {
    const next = selectors.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onSelectorsChange(next);
  };

  const addSelector = () => {
    if (!canAdd) return;
    onSelectorsChange([...selectors, { name: "", selector: "" }]);
  };

  const removeSelector = (index: number) => {
    if (selectors.length <= 1) return;
    onSelectorsChange(selectors.filter((_, i) => i !== index));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="scraper-url">URL</Label>
        <Input
          id="scraper-url"
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
        <Label>CSS セレクタ</Label>
        <div className="space-y-2">
          {selectors.map((sel, index) => {
            const nameId = `scraper-selector-name-${index}`;
            const selectorId = `scraper-selector-${index}`;
            return (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="sm:w-40">
                  <Label htmlFor={nameId} className="sr-only">
                    ラベル {index + 1}
                  </Label>
                  <Input
                    id={nameId}
                    placeholder="ラベル（任意）"
                    value={sel.name}
                    onChange={(e) => updateSelector(index, { name: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={selectorId} className="sr-only">
                    CSS セレクタ {index + 1}
                  </Label>
                  <Input
                    id={selectorId}
                    placeholder="例: h1, .article p, a[href]"
                    value={sel.selector}
                    onChange={(e) => updateSelector(index, { selector: e.target.value })}
                    disabled={isLoading}
                    className="font-mono"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSelector(index)}
                  disabled={isLoading || selectors.length <= 1}
                  aria-label={`セレクタ ${index + 1} を削除`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSelector}
            disabled={isLoading || !canAdd}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            セレクタを追加
          </Button>
          <p className="text-xs text-muted-foreground">
            最大 {MAX_SELECTORS} 件まで指定できます。
          </p>
        </div>
      </div>

      <div>
        <Button type="submit" disabled={!canSubmit}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <MousePointerClick className="h-4 w-4" aria-hidden="true" />
          )}
          {isLoading ? "抽出中…" : "抽出する"}
        </Button>
      </div>
    </form>
  );
}
