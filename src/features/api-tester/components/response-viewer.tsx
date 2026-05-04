"use client";

import { Check, Clock, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useClipboard } from "@/lib/use-clipboard";
import type { ApiTesterError, ApiTesterResponse } from "../lib/types";
import { tryFormatJson } from "../lib/api-tester-client";

type Props = {
  response?: ApiTesterResponse;
  error?: ApiTesterError;
};

export function ResponseViewer({ response, error }: Props) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>リクエスト失敗 ({error.errorCode})</AlertTitle>
        <AlertDescription>{error.error}</AlertDescription>
      </Alert>
    );
  }

  if (!response) return null;

  const formattedBody = tryFormatJson(response.body);
  const headerEntries = Object.entries(response.headers);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(response.status)}>
          {response.status} {response.statusText}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Clock className="size-3" aria-hidden="true" />
          {response.durationMs} ms
        </Badge>
        <Badge variant="outline">{formatBytes(byteLengthOf(response.body))}</Badge>
        {response.truncated ? (
          <Badge variant="destructive">本文を 1MB で切り詰めました</Badge>
        ) : null}
      </div>

      <Tabs defaultValue="body">
        <TabsList>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers ({headerEntries.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="body" className="pt-2">
          <BodyPanel value={formattedBody} />
        </TabsContent>
        <TabsContent value="headers" className="pt-2">
          {headerEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">ヘッダーはありません。</p>
          ) : (
            <div className="overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <tbody>
                  {headerEntries.map(([name, value]) => (
                    <tr key={name} className="border-b last:border-b-0">
                      <td className="px-3 py-2 align-top font-mono text-xs font-medium">
                        {name}
                      </td>
                      <td className="px-3 py-2 align-top font-mono text-xs break-all">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BodyPanel({ value }: { value: string }) {
  const { copy, isCopied } = useClipboard();
  if (!value) {
    return <p className="text-sm text-muted-foreground">レスポンス本文はありません。</p>;
  }
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2"
        onClick={() => copy(value)}
        aria-label="レスポンス本文をコピー"
      >
        {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </Button>
      <pre className="max-h-[480px] overflow-auto rounded-md border bg-muted/50 p-4 text-sm font-mono">
        {value}
      </pre>
    </div>
  );
}

function statusVariant(status: number): "default" | "secondary" | "destructive" | "outline" {
  if (status >= 200 && status < 300) return "default";
  if (status >= 300 && status < 400) return "secondary";
  return "destructive";
}

function byteLengthOf(text: string): number {
  if (typeof TextEncoder === "undefined") return text.length;
  return new TextEncoder().encode(text).byteLength;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
