"use client";

import { useState } from "react";
import { CheckCircle2, ImageOff, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  checkDescription,
  checkTitle,
  type LengthCheck,
} from "@/features/ogp-preview/lib/seo-checks";
import { findTag, type OgpPreviewData } from "@/features/ogp-preview/lib/types";
import { JsonLdView } from "./json-ld-view";
import { SlackPreview } from "./slack-preview";
import { TagList } from "./tag-list";
import { TwitterCardPreview } from "./twitter-card-preview";

type Props = {
  data: OgpPreviewData;
};

export function OgpPreviewResult({ data }: Props) {
  const description =
    findTag(data.ogTags, "og:description") ??
    findTag(data.generalTags, "description");

  const titleCheck = checkTitle(data.title || null);
  const descriptionCheck = checkDescription(description);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Favicon src={data.faviconUrl} />
            <span className="break-all">{data.title || "(タイトルなし)"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="リクエストURL" value={data.requestUrl} mono />
          <Row label="最終URL" value={data.finalUrl} mono />
          <Row label="ステータス" value={`HTTP ${data.upstreamStatus}`} />
          <Row label="canonical" value={data.canonical ?? "(なし)"} mono />
          <Row label="favicon" value={data.faviconUrl ?? "(なし)"} mono />
          <div className="grid gap-2 sm:grid-cols-2">
            <SeoBadge label="title" check={titleCheck} />
            <SeoBadge label="description" check={descriptionCheck} />
          </div>
          <p className="text-xs text-muted-foreground">取得時間 {data.durationMs} ms</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="previews">
        <TabsList>
          <TabsTrigger value="previews">プレビュー</TabsTrigger>
          <TabsTrigger value="tags">タグ</TabsTrigger>
          <TabsTrigger value="jsonld">JSON-LD</TabsTrigger>
        </TabsList>

        <TabsContent value="previews" className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Twitter Card</h3>
            <TwitterCardPreview data={data} />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Slack風プレビュー</h3>
            <SlackPreview data={data} />
          </section>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Open Graph ({data.ogTags.length})
            </h3>
            <TagList tags={data.ogTags} emptyLabel="og: タグはありません。" />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Twitter Card ({data.twitterTags.length})
            </h3>
            <TagList
              tags={data.twitterTags}
              badgeVariant="outline"
              emptyLabel="twitter: タグはありません。"
            />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              一般メタ ({data.generalTags.length})
            </h3>
            <TagList
              tags={data.generalTags}
              badgeVariant="default"
              emptyLabel="一般メタタグはありません。"
            />
          </section>
        </TabsContent>

        <TabsContent value="jsonld">
          <JsonLdView entries={data.jsonLd} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[140px_1fr]">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={`break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function SeoBadge({ label, check }: { label: string; check: LengthCheck }) {
  const tone =
    check.status === "ok"
      ? "text-emerald-600 dark:text-emerald-400"
      : check.status === "missing"
        ? "text-muted-foreground"
        : "text-amber-600 dark:text-amber-400";
  const Icon = check.status === "ok" ? CheckCircle2 : TriangleAlert;
  const message =
    check.status === "missing"
      ? "未設定"
      : check.status === "ok"
        ? `${check.actual} 文字 (推奨 ${check.recommended.min}〜${check.recommended.max})`
        : check.status === "short"
          ? `${check.actual} 文字（推奨 ${check.recommended.min}〜${check.recommended.max}より短い）`
          : `${check.actual} 文字（推奨 ${check.recommended.min}〜${check.recommended.max}より長い）`;

  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{message}</span>
    </div>
  );
}

function Favicon({ src }: { src: string | null }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-muted-foreground">
        <ImageOff className="h-3 w-3" aria-hidden="true" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className="h-5 w-5 shrink-0 rounded"
    />
  );
}
