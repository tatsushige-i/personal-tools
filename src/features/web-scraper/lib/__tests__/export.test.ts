import {
  CSV_HEADERS,
  buildExportFilename,
  toScraperCsv,
  toScraperJson,
} from "../export";
import type { ScraperResponse } from "../types";

const baseResponse = (overrides: Partial<ScraperResponse> = {}): ScraperResponse => ({
  url: "https://example.com",
  durationMs: 1234,
  results: [],
  ...overrides,
});

describe("toScraperCsv", () => {
  it("emits a header-only line when there are no matches", () => {
    const csv = toScraperCsv(baseResponse());
    expect(csv).toBe(CSV_HEADERS.join(","));
  });

  it("flattens multiple selectors into per-row records", () => {
    const csv = toScraperCsv(
      baseResponse({
        results: [
          {
            name: "headings",
            selector: "h1",
            truncated: false,
            matches: [{ text: "Hello", html: "Hello", href: undefined, src: undefined }],
          },
          {
            name: "links",
            selector: "a",
            truncated: false,
            matches: [
              {
                text: "Anchor",
                html: "Anchor",
                href: "https://example.com/x",
                src: undefined,
              },
            ],
          },
        ],
      }),
    );
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(CSV_HEADERS.join(","));
    expect(lines[1]).toBe("headings,h1,0,Hello,Hello,,");
    expect(lines[2]).toBe("links,a,0,Anchor,Anchor,https://example.com/x,");
  });

  it("escapes commas, quotes, and newlines in cell content", () => {
    const csv = toScraperCsv(
      baseResponse({
        results: [
          {
            name: "p",
            selector: "p",
            truncated: false,
            matches: [
              {
                text: 'has "quotes", commas, and\nnewlines',
                html: "<b>x</b>",
                href: undefined,
                src: undefined,
              },
            ],
          },
        ],
      }),
    );
    const lines = csv.split("\r\n");
    expect(lines[1]).toBe('p,p,0,"has ""quotes"", commas, and\nnewlines",<b>x</b>,,');
  });

  it("omits selectors with zero matches but retains others", () => {
    const csv = toScraperCsv(
      baseResponse({
        results: [
          { name: "empty", selector: ".gone", truncated: false, matches: [] },
          {
            name: "kept",
            selector: "p",
            truncated: false,
            matches: [{ text: "x", html: "x", href: undefined, src: undefined }],
          },
        ],
      }),
    );
    const lines = csv.split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe("kept,p,0,x,x,,");
  });

  it("includes index per match within a selector", () => {
    const csv = toScraperCsv(
      baseResponse({
        results: [
          {
            name: "items",
            selector: "li",
            truncated: false,
            matches: [
              { text: "a", html: "a", href: undefined, src: undefined },
              { text: "b", html: "b", href: undefined, src: undefined },
              { text: "c", html: "c", href: undefined, src: undefined },
            ],
          },
        ],
      }),
    );
    const lines = csv.split("\r\n");
    expect(lines[1]).toBe("items,li,0,a,a,,");
    expect(lines[2]).toBe("items,li,1,b,b,,");
    expect(lines[3]).toBe("items,li,2,c,c,,");
  });
});

describe("toScraperJson", () => {
  it("returns indented JSON of the response", () => {
    const json = toScraperJson(baseResponse({ durationMs: 42 }));
    const parsed = JSON.parse(json);
    expect(parsed).toEqual({ url: "https://example.com", durationMs: 42, results: [] });
    expect(json).toContain("\n  ");
  });
});

describe("buildExportFilename", () => {
  it("uses ISO timestamp with safe separators", () => {
    const filename = buildExportFilename("csv");
    expect(filename).toMatch(/^web-scrape-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.csv$/);
  });

  it("supports json extension", () => {
    expect(buildExportFilename("json")).toMatch(/\.json$/);
  });
});
