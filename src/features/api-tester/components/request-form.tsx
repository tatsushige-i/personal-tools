"use client";

import { Send, Terminal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useClipboard } from "@/lib/use-clipboard";
import type { HttpMethod, KeyValue } from "../lib/types";
import { HTTP_METHODS } from "../lib/types";
import { KeyValueEditor } from "./key-value-editor";

type Props = {
  method: HttpMethod;
  urlInput: string;
  params: KeyValue[];
  headers: KeyValue[];
  body: string;
  isLoading: boolean;
  curlCommand: string;
  onMethodChange: (method: HttpMethod) => void;
  onUrlInputChange: (url: string) => void;
  onParamsChange: (params: KeyValue[]) => void;
  onHeadersChange: (headers: KeyValue[]) => void;
  onBodyChange: (body: string) => void;
  onSend: () => void;
};

export function RequestForm({
  method,
  urlInput,
  params,
  headers,
  body,
  isLoading,
  curlCommand,
  onMethodChange,
  onUrlInputChange,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
  onSend,
}: Props) {
  const { copy, isCopied } = useClipboard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={method} onValueChange={(v) => onMethodChange(v as HttpMethod)}>
          <SelectTrigger className="w-full sm:w-32" aria-label="HTTPメソッド">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HTTP_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={urlInput}
          onChange={(e) => onUrlInputChange(e.target.value)}
          placeholder="https://api.example.com/path"
          className="flex-1 font-mono"
          aria-label="URL"
        />
        <Button type="submit" disabled={isLoading} className="sm:w-28">
          <Send className="size-4" />
          {isLoading ? "送信中…" : "送信"}
        </Button>
      </div>

      <Tabs defaultValue="params">
        <TabsList>
          <TabsTrigger value="params">
            Params{params.filter((p) => p.enabled && p.key.trim()).length > 0
              ? ` (${params.filter((p) => p.enabled && p.key.trim()).length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="headers">
            Headers{headers.filter((h) => h.enabled && h.key.trim()).length > 0
              ? ` (${headers.filter((h) => h.enabled && h.key.trim()).length})`
              : ""}
          </TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>
        <TabsContent value="params" className="pt-2">
          <KeyValueEditor
            rows={params}
            onChange={onParamsChange}
            keyPlaceholder="param"
            valuePlaceholder="value"
            emptyLabel="クエリパラメータはありません。"
          />
        </TabsContent>
        <TabsContent value="headers" className="pt-2">
          <KeyValueEditor
            rows={headers}
            onChange={onHeadersChange}
            keyPlaceholder="Header-Name"
            valuePlaceholder="value"
            emptyLabel="ヘッダーはありません。"
          />
        </TabsContent>
        <TabsContent value="body" className="pt-2">
          <Textarea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder='{"key": "value"}'
            className="min-h-32 font-mono text-sm"
            aria-label="リクエストボディ"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            GET / DELETE では送信されません。Content-Type は Headers タブで指定してください。
          </p>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy(curlCommand)}
          disabled={!curlCommand}
        >
          {isCopied ? <Check className="size-4" /> : <Terminal className="size-4" />}
          {isCopied ? "コピーしました" : "cURLをコピー"}
        </Button>
      </div>
    </form>
  );
}
