import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportQrAsPng, exportQrAsSvg, downloadBlob, downloadSvgString } from "../lib/qr-renderer";
import type { QrOptions } from "../lib/types";

type QrDownloadActionsProps = {
  content: string;
  options: QrOptions;
};

export function QrDownloadActions({ content, options }: QrDownloadActionsProps) {
  const [downloading, setDownloading] = useState(false);
  const disabled = !content || downloading;

  const handleDownloadPng = async () => {
    setDownloading(true);
    try {
      const blob = await exportQrAsPng(content, options);
      downloadBlob(blob, "qrcode.png");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSvg = async () => {
    setDownloading(true);
    try {
      const svgString = await exportQrAsSvg(content, options);
      downloadSvgString(svgString, "qrcode.svg");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        disabled={disabled}
        onClick={handleDownloadPng}
        className="flex-1"
      >
        <Download className="mr-2 h-4 w-4" />
        PNG
      </Button>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={handleDownloadSvg}
        className="flex-1"
      >
        <Download className="mr-2 h-4 w-4" />
        SVG
      </Button>
    </div>
  );
}
