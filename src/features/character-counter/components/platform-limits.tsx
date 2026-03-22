import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/features/character-counter/lib/character-counter";

type Props = {
  charCount: number;
};

export function PlatformLimits({ charCount }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm font-medium">プラットフォーム別残り文字数</p>
      <div className="mt-3 space-y-3">
        {PLATFORMS.map((platform) => {
          const remaining = platform.limit - charCount;
          const isOver = remaining < 0;
          const ratio = Math.min(charCount / platform.limit, 1);

          return (
            <div key={platform.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{platform.name}</span>
                <div className="flex items-center gap-2">
                  {isOver ? (
                    <Badge variant="destructive">
                      {Math.abs(remaining).toLocaleString()} 文字オーバー
                    </Badge>
                  ) : (
                    <span className="tabular-nums">
                      残り{" "}
                      <span className="font-medium">{remaining.toLocaleString()}</span> 文字
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    / {platform.limit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${isOver ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
