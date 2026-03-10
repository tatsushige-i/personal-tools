import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PathFilterProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PathFilter({ value, onChange }: PathFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="path-filter">パスフィルター</Label>
      <Input
        id="path-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=".users[0].name"
        className="font-mono text-sm"
      />
    </div>
  );
}
