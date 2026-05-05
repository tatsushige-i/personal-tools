import { toCsv, type CsvCell } from "@/lib/csv-export";
import type { ScraperResponse } from "@/features/web-scraper/lib/types";

export const CSV_HEADERS = [
  "selector_name",
  "selector",
  "index",
  "text",
  "html",
  "href",
  "src",
] as const;

export function toScraperCsv(response: ScraperResponse): string {
  const rows: CsvCell[][] = [];
  for (const result of response.results) {
    if (result.matches.length === 0) continue;
    result.matches.forEach((match, index) => {
      rows.push([
        result.name,
        result.selector,
        index,
        match.text,
        match.html,
        match.href ?? "",
        match.src ?? "",
      ]);
    });
  }
  return toCsv([...CSV_HEADERS], rows);
}

export function toScraperJson(response: ScraperResponse): string {
  return JSON.stringify(response, null, 2);
}

export function downloadJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildExportFilename(extension: "json" | "csv"): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `web-scrape-${stamp}.${extension}`;
}
