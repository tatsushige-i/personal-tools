"use client";

import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { countText } from "@/features/character-counter/lib/character-counter";
import { CountStats } from "./count-stats";
import { PlatformLimits } from "./platform-limits";

export function CharacterCounterPage() {
  const [text, setText] = useState("");
  const [selectionText, setSelectionText] = useState("");
  const [excludeSpaces, setExcludeSpaces] = useState(false);

  const allStats = useMemo(() => countText(text), [text]);
  const selectionStats = useMemo(() => countText(selectionText), [selectionText]);

  const isSelection = selectionText.length > 0;
  const displayStats = isSelection ? selectionStats : allStats;
  const platformCharCount = isSelection ? selectionStats.total : allStats.total;

  function handleSelect(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const target = e.currentTarget;
    const selected = target.value.slice(target.selectionStart, target.selectionEnd);
    setSelectionText(selected);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">文字数カウンター</h1>
        <p className="mt-2 text-muted-foreground">
          文字数・単語数・行数・バイト数をリアルタイムに表示します。テキストを選択すると選択範囲のみカウントします。
        </p>
      </div>

      <Textarea
        placeholder="ここにテキストを入力してください..."
        className="min-h-48 resize-y font-mono text-sm"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSelectionText("");
        }}
        onSelect={handleSelect}
        onMouseUp={handleSelect}
      />

      <CountStats
        stats={displayStats}
        excludeSpaces={excludeSpaces}
        onExcludeSpacesChange={setExcludeSpaces}
        isSelection={isSelection}
      />

      <PlatformLimits charCount={platformCharCount} />
    </div>
  );
}
