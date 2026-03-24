import type { Metadata } from "next";
import { TextRewriterPage } from "@/features/text-rewriter/components/text-rewriter-page";

export const metadata: Metadata = {
  title: "Text Rewriter - Personal Tools",
  description: "テキストのトーン変換・翻訳・要約・校正",
};

export default function Page() {
  return <TextRewriterPage />;
}
