"use client";

import { Badge } from "@/components/ui/badge";
import type { MetaTag } from "@/features/ogp-preview/lib/types";

type Props = {
  tags: MetaTag[];
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  emptyLabel?: string;
};

export function TagList({ tags, badgeVariant = "secondary", emptyLabel }: Props) {
  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyLabel ?? "該当するタグはありません。"}
      </p>
    );
  }

  return (
    <ul className="divide-y rounded-md border">
      {tags.map((tag, i) => (
        <li
          key={`${tag.key}-${i}`}
          className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-start sm:gap-3"
        >
          <Badge variant={badgeVariant} className="w-fit shrink-0 font-mono text-xs">
            {tag.key}
          </Badge>
          <span className="break-all text-sm text-foreground">{tag.content || "(空)"}</span>
        </li>
      ))}
    </ul>
  );
}
