import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InputMode, WifiConfig } from "../lib/types";
import { WifiInputForm } from "./wifi-input-form";

type InputTabsProps = {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  urlValue: string;
  onUrlChange: (value: string) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  wifiConfig: WifiConfig;
  onWifiConfigChange: (config: WifiConfig) => void;
};

export function InputTabs({
  inputMode,
  onInputModeChange,
  urlValue,
  onUrlChange,
  textValue,
  onTextChange,
  wifiConfig,
  onWifiConfigChange,
}: InputTabsProps) {
  return (
    <Tabs
      value={inputMode}
      onValueChange={(v) => onInputModeChange(v as InputMode)}
    >
      <TabsList className="w-full">
        <TabsTrigger value="url" className="flex-1">
          URL
        </TabsTrigger>
        <TabsTrigger value="text" className="flex-1">
          テキスト
        </TabsTrigger>
        <TabsTrigger value="wifi" className="flex-1">
          Wi-Fi
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="space-y-2">
        <Label htmlFor="url-input">URL</Label>
        <Input
          id="url-input"
          type="url"
          placeholder="https://example.com"
          value={urlValue}
          onChange={(e) => onUrlChange(e.target.value)}
        />
      </TabsContent>

      <TabsContent value="text" className="space-y-2">
        <Label htmlFor="text-input">テキスト</Label>
        <Textarea
          id="text-input"
          placeholder="QRコードに埋め込むテキスト"
          className="min-h-32"
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
        />
      </TabsContent>

      <TabsContent value="wifi">
        <WifiInputForm config={wifiConfig} onChange={onWifiConfigChange} />
      </TabsContent>
    </Tabs>
  );
}
