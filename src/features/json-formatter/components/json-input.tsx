import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type JsonInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function JsonInput({ value, onChange }: JsonInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="json-input">JSON入力</Label>
      <Textarea
        id="json-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{"key": "value"}'
        className="min-h-48 max-h-96 font-mono text-sm"
      />
    </div>
  );
}
