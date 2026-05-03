import type { KeyValue } from "./types";

export function createEmptyRow(): KeyValue {
  return {
    id: crypto.randomUUID(),
    enabled: true,
    key: "",
    value: "",
  };
}

export function toRecord(rows: KeyValue[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    if (!row.enabled) continue;
    const key = row.key.trim();
    if (!key) continue;
    result[key] = row.value;
  }
  return result;
}

export function paramsToQueryString(rows: KeyValue[]): string {
  const params = new URLSearchParams();
  for (const row of rows) {
    if (!row.enabled) continue;
    const key = row.key.trim();
    if (!key) continue;
    params.append(key, row.value);
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export function paramsFromUrl(url: string): { base: string; params: KeyValue[] } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const queryStart = trimmed.indexOf("?");
  if (queryStart === -1) {
    return { base: trimmed, params: [] };
  }

  const base = trimmed.slice(0, queryStart);
  const queryAndHash = trimmed.slice(queryStart + 1);
  const hashStart = queryAndHash.indexOf("#");
  const queryString = hashStart === -1 ? queryAndHash : queryAndHash.slice(0, hashStart);
  const hash = hashStart === -1 ? "" : queryAndHash.slice(hashStart);

  const search = new URLSearchParams(queryString);
  const params: KeyValue[] = [];
  for (const [key, value] of search.entries()) {
    params.push({
      id: crypto.randomUUID(),
      enabled: true,
      key,
      value,
    });
  }
  return { base: base + hash, params };
}

export function buildUrl(base: string, params: KeyValue[]): string {
  if (!base) return "";
  const trimmed = base.trim();
  const hashStart = trimmed.indexOf("#");
  const beforeHash = hashStart === -1 ? trimmed : trimmed.slice(0, hashStart);
  const hash = hashStart === -1 ? "" : trimmed.slice(hashStart);
  const queryStart = beforeHash.indexOf("?");
  const baseWithoutQuery = queryStart === -1 ? beforeHash : beforeHash.slice(0, queryStart);
  const query = paramsToQueryString(params);
  return `${baseWithoutQuery}${query}${hash}`;
}
