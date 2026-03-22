import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CountStats } from "@/features/character-counter/lib/types";

type StatCardProps = {
  label: string;
  value: number;
  sub?: string;
};

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

type Props = {
  stats: CountStats;
  excludeSpaces: boolean;
  onExcludeSpacesChange: (value: boolean) => void;
  isSelection: boolean;
};

export function CountStats({ stats, excludeSpaces, onExcludeSpacesChange, isSelection }: Props) {
  const displayCount = excludeSpaces ? stats.totalExcludingSpaces : stats.total;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Switch
          id="exclude-spaces"
          checked={excludeSpaces}
          onCheckedChange={onExcludeSpacesChange}
        />
        <Label htmlFor="exclude-spaces" className="cursor-pointer text-sm">
          空白・改行を除外してカウント
        </Label>
        {isSelection && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            選択範囲
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="文字数"
          value={displayCount}
          sub={excludeSpaces ? "空白・改行を除く" : undefined}
        />
<StatCard label="行数" value={stats.lines} />
        <StatCard label="バイト数 (UTF-8)" value={stats.bytes} />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium">全角 / 半角 内訳</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">全角</p>
            <p className="text-2xl font-bold tabular-nums">{stats.fullWidth.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">半角</p>
            <p className="text-2xl font-bold tabular-nums">{stats.halfWidth.toLocaleString()}</p>
          </div>
        </div>
        {stats.total > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(stats.fullWidth / stats.total) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
