import type { Metadata } from "next";
import { MarkdownPreviewPage } from "@/features/markdown-preview/components/markdown-preview-page";

export const metadata: Metadata = {
  title: "Markdown Preview - Personal Tools",
  description: "Markdownのリアルタイムプレビュー・HTMLコピー",
};

export default function Page() {
  return <MarkdownPreviewPage />;
}
