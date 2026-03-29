import { Badge } from "@/components/ui/badge";
import type { TextSegment } from "../lib/types";

type MatchHighlightProps = {
  segments: TextSegment[];
  matchCount: number;
};

export function MatchHighlight({ segments, matchCount }: MatchHighlightProps) {
  if (segments.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">マッチ結果</h2>
        <Badge variant="secondary">{matchCount}件</Badge>
      </div>
      <div className="rounded-md border bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap break-all">
        {segments.map((seg, i) =>
          seg.type === "text" ? (
            <span key={i}>{seg.value}</span>
          ) : (
            <mark
              key={i}
              className="rounded-sm bg-yellow-200 px-0.5 dark:bg-yellow-800"
            >
              {seg.value}
            </mark>
          ),
        )}
      </div>
    </div>
  );
}
