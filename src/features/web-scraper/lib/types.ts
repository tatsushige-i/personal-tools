export const MAX_SELECTORS = 10;
export const MAX_MATCHES_PER_SELECTOR = 200;
export const NAVIGATION_TIMEOUT_MS = 20_000;

export type ScraperSelectorInput = {
  name: string;
  selector: string;
};

export type ScrapedElement = {
  text: string;
  html: string;
  href?: string;
  src?: string;
};

export type SelectorResult = {
  name: string;
  selector: string;
  matches: ScrapedElement[];
  truncated: boolean;
  error?: string;
};

export type ScraperOptions = {
  url: string;
  selectors: ScraperSelectorInput[];
};

export type ScraperResponse = {
  url: string;
  results: SelectorResult[];
  durationMs: number;
};

export type ScraperError = {
  error: string;
  errorCode: string;
};

export function isSelectorInput(value: unknown): value is ScraperSelectorInput {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === "string" && typeof v.selector === "string";
}
