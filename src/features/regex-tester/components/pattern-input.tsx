import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { RegexFlag, RegexFlags } from "../lib/types";

type PatternInputProps = {
  pattern: string;
  flags: RegexFlags;
  error: string | null;
  onPatternChange: (value: string) => void;
  onFlagToggle: (flag: RegexFlag) => void;
};

const FLAG_LABELS: { flag: RegexFlag; label: string; description: string }[] = [
  { flag: "g", label: "g", description: "global" },
  { flag: "i", label: "i", description: "case-insensitive" },
  { flag: "m", label: "m", description: "multiline" },
  { flag: "s", label: "s", description: "dotAll" },
];

export function PatternInput({
  pattern,
  flags,
  error,
  onPatternChange,
  onFlagToggle,
}: PatternInputProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="regex-pattern">正規表現パターン</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-mono text-sm">/</span>
          <Input
            id="regex-pattern"
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder="[a-z]+"
            className="font-mono text-sm"
          />
          <span className="text-muted-foreground font-mono text-sm">/</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {FLAG_LABELS.map(({ flag, label, description }) => (
          <div key={flag} className="flex items-center gap-1.5">
            <Switch
              id={`flag-${flag}`}
              checked={flags[flag]}
              onCheckedChange={() => onFlagToggle(flag)}
              aria-label={`${description}フラグ`}
            />
            <Label
              htmlFor={`flag-${flag}`}
              className="cursor-pointer font-mono text-sm"
            >
              {label}
            </Label>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
