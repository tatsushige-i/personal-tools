"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useIpInfo } from "../lib/use-ip-info";
import { HeadersTable } from "./headers-table";
import { IpInfoCard } from "./ip-info-card";

export function IpInfoViewerPage() {
  const { self, selfError, selfLoading, lookupState, lookup } = useIpInfo();
  const [ipInput, setIpInput] = useState("");

  const handleLookupSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    lookup(ipInput);
  };

  const lookupLoading = lookupState.status === "loading";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IP Info Viewer</h1>
        <p className="mt-2 text-muted-foreground">
          自分のグローバルIPとジオロケーション、HTTPリクエストヘッダーを表示します。任意のIPアドレスの情報も検索できます（ipapi.co、レート制限30req/min）。
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">自分のIP情報</h2>
        {selfLoading && (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {selfError && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="size-4" />
            <AlertTitle>自分のIP情報の取得に失敗しました</AlertTitle>
            <AlertDescription>{selfError.message}</AlertDescription>
          </Alert>
        )}
        {self && (
          <div className="space-y-4">
            <IpInfoCard info={self.geo} />
            <HeadersTable headers={self.headers} />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">任意のIPを検索</h2>
        <form
          onSubmit={handleLookupSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="ip-lookup">IPアドレス</Label>
            <Input
              id="ip-lookup"
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="例: 8.8.8.8"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button type="submit" disabled={!ipInput.trim() || lookupLoading}>
            {lookupLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="size-4" aria-hidden="true" />
            )}
            検索
          </Button>
        </form>

        {lookupState.status === "loading" && (
          <Skeleton className="h-40 w-full" />
        )}
        {lookupState.status === "error" && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="size-4" />
            <AlertTitle>IPアドレス情報の取得に失敗しました</AlertTitle>
            <AlertDescription>{lookupState.error.message}</AlertDescription>
          </Alert>
        )}
        {lookupState.status === "success" && (
          <IpInfoCard info={lookupState.data} />
        )}
      </section>
    </div>
  );
}
