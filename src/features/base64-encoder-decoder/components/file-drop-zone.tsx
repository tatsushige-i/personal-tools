"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { Upload, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { encodeBytes, buildDataUri } from "../lib/base64";

type FileDropZoneProps = {
  urlSafe: boolean;
};

type RawFile = {
  name: string;
  size: number;
  mimeType: string;
  bytes: Uint8Array;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropZone({ urlSafe }: FileDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [rawFile, setRawFile] = useState<RawFile | null>(null);
  const [copiedField, setCopiedField] = useState<"base64" | "dataUri" | null>(
    null
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const base64 = useMemo(
    () => (rawFile ? encodeBytes(rawFile.bytes, urlSafe) : null),
    [rawFile, urlSafe]
  );

  const dataUri = useMemo(
    () =>
      rawFile
        ? buildDataUri(encodeBytes(rawFile.bytes, false), rawFile.mimeType)
        : null,
    [rawFile]
  );

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) return;
      const bytes = new Uint8Array(reader.result);
      const mimeType = file.type || "application/octet-stream";
      setRawFile({ name: file.name, size: file.size, mimeType, bytes });
    };
    reader.onerror = () => {
      setRawFile(null);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleCopy = useCallback(
    async (text: string, field: "base64" | "dataUri") => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopiedField(null), 2000);
      } catch {
        // Clipboard API unavailable
      }
    },
    []
  );

  return (
    <div className="space-y-4">
      <Label>ファイルエンコード</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <Upload className="mb-2 size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          ファイルをドラッグ＆ドロップ、またはクリックして選択
        </p>
        <input
          type="file"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleFileSelect}
          aria-label="ファイル選択"
        />
      </div>

      {rawFile && base64 && dataUri && (
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/50 p-3 text-sm">
            <p>
              <span className="text-muted-foreground">ファイル名:</span>{" "}
              {rawFile.name}
            </p>
            <p>
              <span className="text-muted-foreground">サイズ:</span>{" "}
              {formatFileSize(rawFile.size)}
            </p>
            <p>
              <span className="text-muted-foreground">MIME:</span>{" "}
              {rawFile.mimeType}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Base64</Label>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(base64, "base64")}
                aria-label="Base64をコピー"
              >
                {copiedField === "base64" ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
              <pre className="max-h-32 overflow-auto rounded-md border bg-muted/50 p-4 pr-10 text-sm font-mono break-all whitespace-pre-wrap">
                {base64}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data URI</Label>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(dataUri, "dataUri")}
                aria-label="Data URIをコピー"
              >
                {copiedField === "dataUri" ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
              <pre className="max-h-32 overflow-auto rounded-md border bg-muted/50 p-4 pr-10 text-sm font-mono break-all whitespace-pre-wrap">
                {dataUri}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
