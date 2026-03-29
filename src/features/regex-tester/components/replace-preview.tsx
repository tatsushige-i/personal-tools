import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ReplacePreviewProps = {
  replacement: string;
  replaceResult: string | null;
  hasMatches: boolean;
  onReplacementChange: (value: string) => void;
};

export function ReplacePreview({
  replacement,
  replaceResult,
  hasMatches,
  onReplacementChange,
}: ReplacePreviewProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="replacement">置換文字列</Label>
        <Input
          id="replacement"
          value={replacement}
          onChange={(e) => onReplacementChange(e.target.value)}
          placeholder="$1, $<name>, $& などが使えます"
          className="font-mono text-sm"
        />
      </div>

      {replacement && hasMatches && replaceResult !== null && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">置換結果</h2>
          <div className="rounded-md border bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap break-all">
            {replaceResult}
          </div>
        </div>
      )}
    </div>
  );
}
