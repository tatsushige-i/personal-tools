import { Badge } from "@/components/ui/badge";
import type { MatchResult } from "../lib/types";

type CaptureGroupsProps = {
  matches: MatchResult[];
};

export function CaptureGroups({ matches }: CaptureGroupsProps) {
  const matchesWithGroups = matches.filter((m) => m.groups.length > 0);
  if (matchesWithGroups.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">キャプチャグループ</h2>
      <div className="space-y-3">
        {matchesWithGroups.map((match, mi) => (
          <div key={mi} className="rounded-md border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">マッチ {mi + 1}</Badge>
              <code className="text-sm text-muted-foreground">
                {match.fullMatch}
              </code>
            </div>
            <div className="space-y-1">
              {match.groups.map((group) => (
                <div
                  key={group.index}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="w-8 text-right font-mono text-muted-foreground">
                    ${group.index}
                  </span>
                  {group.name && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {group.name}
                    </Badge>
                  )}
                  <code className="rounded bg-muted px-1.5 py-0.5">
                    {group.value}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
