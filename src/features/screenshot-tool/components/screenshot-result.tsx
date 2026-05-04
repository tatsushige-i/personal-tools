"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DEVICE_LABELS,
  type Device,
  type ScreenshotShot,
} from "@/features/screenshot-tool/lib/types";

type Props = {
  shots: ScreenshotShot[];
  isLoading: boolean;
  loadingDevices: Device[];
  hostname?: string;
};

export function ScreenshotResult({ shots, isLoading, loadingDevices, hostname }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {loadingDevices.map((device) => (
          <Card key={device}>
            <CardHeader>
              <CardTitle className="text-base">{DEVICE_LABELS[device]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (shots.length === 0) return null;

  return (
    <div className="space-y-4">
      {shots.map((shot) => {
        const fileName = buildFileName(hostname, shot.device, shot.format);
        return (
          <Card key={shot.device}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-baseline gap-2 text-base">
                {DEVICE_LABELS[shot.device]}
                <span className="text-xs font-normal text-muted-foreground">
                  {shot.width}×{shot.height} @ {shot.scale}x · {shot.format.toUpperCase()}
                </span>
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <a href={shot.dataUrl} download={fileName}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  ダウンロード
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-md border bg-muted/30 max-h-[600px]">
                <Image
                  src={shot.dataUrl}
                  alt={`${DEVICE_LABELS[shot.device]}のスクリーンショット`}
                  width={shot.width * shot.scale}
                  height={shot.height * shot.scale}
                  unoptimized
                  className="h-auto w-full max-w-none"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function buildFileName(hostname: string | undefined, device: string, format: string): string {
  const safeHost = (hostname ?? "screenshot").replace(/[^a-zA-Z0-9.-]/g, "_");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${safeHost}_${device}_${stamp}.${format}`;
}
