export type MetaTag = {
  key: string;
  content: string;
};

export type JsonLdEntry = {
  raw: string;
  parsed: unknown | null;
  parseError?: string;
};

export type OgpPreviewData = {
  requestUrl: string;
  finalUrl: string;
  upstreamStatus: number;
  title: string;
  ogTags: MetaTag[];
  twitterTags: MetaTag[];
  generalTags: MetaTag[];
  canonical: string | null;
  faviconUrl: string | null;
  jsonLd: JsonLdEntry[];
  durationMs: number;
};

export type OgpPreviewError = {
  error: string;
  errorCode: string;
  upstreamStatus?: number;
};

export type OgpPreviewOptions = {
  url: string;
};

export function findTag(tags: MetaTag[], key: string): string | null {
  const hit = tags.find((t) => t.key === key);
  return hit ? hit.content : null;
}
