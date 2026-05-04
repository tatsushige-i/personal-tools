import type { Metadata } from "next";
import { OgpPreviewPage } from "@/features/ogp-preview/components/ogp-preview-page";

export const metadata: Metadata = {
  title: "OGP Meta Preview - Personal Tools",
  description:
    "URLからOGP/Twitter Card/メタ情報を抽出し、Twitter・Slack風プレビューとSEOチェックを表示",
};

export default function Page() {
  return <OgpPreviewPage />;
}
