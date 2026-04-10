import { useEffect, type RefObject } from "react";
import { renderQrToCanvas } from "../lib/qr-renderer";
import type { QrOptions } from "../lib/types";

type QrPreviewProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  content: string;
  options: QrOptions;
};

export function QrPreview({ canvasRef, content, options }: QrPreviewProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderQrToCanvas(canvas, content, options);
  }, [canvasRef, content, options]);

  return (
    <div className="flex items-center justify-center rounded-md border bg-muted/30 p-6">
      <canvas
        ref={canvasRef}
        className="max-w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
