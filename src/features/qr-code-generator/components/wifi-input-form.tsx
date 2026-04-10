import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { WifiConfig, WifiEncryption } from "../lib/types";

type WifiInputFormProps = {
  config: WifiConfig;
  onChange: (config: WifiConfig) => void;
};

export function WifiInputForm({ config, onChange }: WifiInputFormProps) {
  const update = (patch: Partial<WifiConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wifi-ssid">SSID</Label>
        <Input
          id="wifi-ssid"
          placeholder="ネットワーク名"
          value={config.ssid}
          onChange={(e) => update({ ssid: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wifi-encryption">暗号化方式</Label>
        <Select
          value={config.encryption}
          onValueChange={(v) => update({ encryption: v as WifiEncryption })}
        >
          <SelectTrigger id="wifi-encryption">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WPA">WPA/WPA2/WPA3</SelectItem>
            <SelectItem value="WEP">WEP</SelectItem>
            <SelectItem value="nopass">なし（オープン）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.encryption !== "nopass" && (
        <div className="space-y-2">
          <Label htmlFor="wifi-password">パスワード</Label>
          <Input
            id="wifi-password"
            type="password"
            placeholder="パスワード"
            value={config.password}
            onChange={(e) => update({ password: e.target.value })}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          id="wifi-hidden"
          checked={config.hidden}
          onCheckedChange={(checked) => update({ hidden: checked })}
        />
        <Label htmlFor="wifi-hidden">非公開ネットワーク</Label>
      </div>
    </div>
  );
}
