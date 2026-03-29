import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PRESETS } from "../lib/presets";
import type { Preset } from "../lib/types";

type PresetSelectProps = {
  onSelect: (preset: Preset) => void;
};

export function PresetSelect({ onSelect }: PresetSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="preset-select" className="sr-only">
        プリセットパターン
      </Label>
      <Select
        onValueChange={(value) => {
          const preset = PRESETS.find((p) => p.name === value);
          if (preset) onSelect(preset);
        }}
      >
        <SelectTrigger id="preset-select" className="w-full sm:w-64">
          <SelectValue placeholder="プリセットパターンを選択..." />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset.name} value={preset.name}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
