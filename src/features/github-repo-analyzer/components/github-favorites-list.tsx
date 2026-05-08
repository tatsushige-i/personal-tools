"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GithubFavorite } from "../lib/types";

type Props = {
  favorites: GithubFavorite[];
  onSelectUser: (username: string) => void;
  onSelectRepo: (fullName: string) => void;
  onRemove: (id: string) => void;
};

export function GithubFavoritesList({
  favorites,
  onSelectUser,
  onSelectRepo,
  onRemove,
}: Props) {
  const users = favorites.filter((f) => f.type === "user");
  const repos = favorites.filter((f) => f.type === "repo");

  return (
    <Card>
      <CardHeader>
        <CardTitle>お気に入り</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            検索したユーザーやリポジトリを「お気に入り」ボタンで登録できます。
          </p>
        ) : (
          <>
            {users.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  ユーザー
                </h3>
                <div className="flex flex-wrap gap-2">
                  {users.map((fav) => (
                    <Badge
                      key={fav.id}
                      variant="outline"
                      className="gap-1 px-2 py-1 font-mono text-sm"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectUser(fav.value)}
                        className="hover:underline"
                      >
                        @{fav.value}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(fav.id)}
                        aria-label={`お気に入り @${fav.value} を削除`}
                        className="ml-1 inline-flex items-center justify-center rounded-sm hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {repos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  リポジトリ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {repos.map((fav) => (
                    <Badge
                      key={fav.id}
                      variant="outline"
                      className="gap-1 px-2 py-1 font-mono text-sm"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectRepo(fav.value)}
                        className="hover:underline"
                      >
                        {fav.value}
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(fav.id)}
                        aria-label={`お気に入り ${fav.value} を削除`}
                        className="ml-1 inline-flex items-center justify-center rounded-sm hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
