import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type TestInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TestInput({ value, onChange }: TestInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="test-string">テスト文字列</Label>
      <Textarea
        id="test-string"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="マッチさせたいテキストを入力..."
        className="min-h-32 font-mono text-sm"
      />
    </div>
  );
}
