"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  isFavorite: boolean;
  onToggle: () => void;
};

export function UserFavoriteToggle({ username, isFavorite, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border bg-card px-4 py-2 text-sm">
      <span className="truncate text-muted-foreground">
        検索中: <span className="font-mono text-foreground">@{username}</span>
      </span>
      <Button
        type="button"
        size="sm"
        variant={isFavorite ? "default" : "outline"}
        onClick={onToggle}
        aria-pressed={isFavorite}
      >
        <Star
          className={cn("size-4", isFavorite && "fill-current")}
          aria-hidden="true"
        />
        {isFavorite ? "お気に入り済み" : "お気に入り"}
      </Button>
    </div>
  );
}
