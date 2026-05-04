"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { findTag, type OgpPreviewData } from "@/features/ogp-preview/lib/types";

type Props = {
  data: OgpPreviewData;
};

export function TwitterCardPreview({ data }: Props) {
  const cardType = findTag(data.twitterTags, "twitter:card") ?? "summary";
  const isLarge = cardType === "summary_large_image";

  const title =
    findTag(data.twitterTags, "twitter:title") ??
    findTag(data.ogTags, "og:title") ??
    data.title ??
    "(タイトルなし)";
  const description =
    findTag(data.twitterTags, "twitter:description") ??
    findTag(data.ogTags, "og:description") ??
    "";
  const image =
    findTag(data.twitterTags, "twitter:image") ??
    findTag(data.ogTags, "og:image") ??
    null;
  const site = findTag(data.twitterTags, "twitter:site");

  let domain = "";
  try {
    domain = new URL(data.finalUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = "";
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground">
      {isLarge ? (
        <div className="space-y-0">
          <ImageBox src={image} alt={title} className="aspect-[1.91/1] w-full" />
          <div className="space-y-1 px-3 py-2">
            {domain && <p className="text-xs text-muted-foreground">{domain}</p>}
            <p className="line-clamp-2 text-sm font-medium">{title}</p>
            {description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
            )}
            {site && <p className="text-xs text-muted-foreground">{site}</p>}
          </div>
        </div>
      ) : (
        <div className="flex">
          <div className="aspect-square w-32 shrink-0 border-r">
            <ImageBox src={image} alt={title} className="h-full w-full" />
          </div>
          <div className="min-w-0 flex-1 space-y-1 px-3 py-2">
            {domain && <p className="text-xs text-muted-foreground">{domain}</p>}
            <p className="line-clamp-2 text-sm font-medium">{title}</p>
            {description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
            )}
            {site && <p className="text-xs text-muted-foreground">{site}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageBox({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className ?? ""}`}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
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
