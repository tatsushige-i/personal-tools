import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OgpPreviewResult } from "../ogp-preview-result";
import type { OgpPreviewData } from "../../lib/types";

const baseData: OgpPreviewData = {
  requestUrl: "https://example.com/",
  finalUrl: "https://example.com/",
  upstreamStatus: 200,
  title: "Example Domain",
  ogTags: [
    { key: "og:title", content: "Example OG Title" },
    { key: "og:description", content: "Example OG Description" },
    { key: "og:image", content: "https://example.com/og.png" },
    { key: "og:site_name", content: "Example Site" },
  ],
  twitterTags: [
    { key: "twitter:card", content: "summary_large_image" },
    { key: "twitter:site", content: "@example" },
  ],
  generalTags: [{ key: "description", content: "general description" }],
  canonical: "https://example.com/canonical",
  faviconUrl: "https://example.com/favicon.ico",
  jsonLd: [{ raw: '{"@context":"https://schema.org"}', parsed: { "@context": "https://schema.org" } }],
  durationMs: 1234,
};

describe("OgpPreviewResult", () => {
  it("renders the summary card with status, canonical, and final URL", () => {
    render(<OgpPreviewResult data={baseData} />);
    expect(screen.getByText("HTTP 200")).toBeInTheDocument();
    expect(screen.getByText("https://example.com/canonical")).toBeInTheDocument();
    expect(screen.getAllByText("https://example.com/").length).toBeGreaterThan(0);
  });

  it("switches to the Tags tab and shows tag counts in the heading", async () => {
    const user = userEvent.setup();
    render(<OgpPreviewResult data={baseData} />);
    await user.click(screen.getByRole("tab", { name: "タグ" }));
    expect(screen.getByText(/Open Graph \(4\)/)).toBeInTheDocument();
    expect(screen.getByText(/Twitter Card \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/一般メタ \(1\)/)).toBeInTheDocument();
  });

  it("surfaces a JSON-LD parse error in an alert", async () => {
    const user = userEvent.setup();
    const data: OgpPreviewData = {
      ...baseData,
      jsonLd: [
        {
          raw: "{ broken json",
          parsed: null,
          parseError: "Unexpected token",
        },
      ],
    };
    render(<OgpPreviewResult data={data} />);
    await user.click(screen.getByRole("tab", { name: "JSON-LD" }));
    expect(screen.getByText("JSON-LDの解析に失敗しました")).toBeInTheDocument();
    expect(screen.getByText("Unexpected token")).toBeInTheDocument();
  });

  it("shows an empty-state message when no JSON-LD is present", async () => {
    const user = userEvent.setup();
    const data: OgpPreviewData = { ...baseData, jsonLd: [] };
    render(<OgpPreviewResult data={data} />);
    await user.click(screen.getByRole("tab", { name: "JSON-LD" }));
    expect(
      screen.getByText("構造化データ（JSON-LD）は見つかりませんでした。"),
    ).toBeInTheDocument();
  });
});
