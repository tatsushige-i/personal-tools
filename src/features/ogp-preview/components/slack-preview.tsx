"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { findTag, type OgpPreviewData } from "@/features/ogp-preview/lib/types";

type Props = {
  data: OgpPreviewData;
};

export function SlackPreview({ data }: Props) {
  const siteName =
    findTag(data.ogTags, "og:site_name") ??
    findTag(data.generalTags, "application-name") ??
    safeHostname(data.finalUrl);
  const title =
    findTag(data.ogTags, "og:title") ?? data.title ?? "(タイトルなし)";
  const description =
    findTag(data.ogTags, "og:description") ??
    findTag(data.generalTags, "description") ??
    "";
  const image = findTag(data.ogTags, "og:image") ?? null;

  return (
    <div className="rounded-md border-l-4 border-muted-foreground/40 bg-muted/30 px-3 py-2">
      {siteName && <p className="text-xs text-muted-foreground">{siteName}</p>}
      <div className="mt-1 flex gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="line-clamp-2 text-sm font-semibold text-primary">{title}</p>
          {description && (
            <p className="line-clamp-3 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {image && (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded">
            <ImageBox src={image} alt={title} className="h-full w-full" />
          </div>
        )}
      </div>
    </div>
  );
}

function ImageBox({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}
      >
        <ImageOff className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setErrored(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
