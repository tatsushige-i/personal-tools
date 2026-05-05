import type { Metadata } from "next";
import { WebScraperPage } from "@/features/web-scraper/components/web-scraper-page";

export const metadata: Metadata = {
  title: "Webスクレイピングツール - Personal Tools",
  description:
    "URLとCSSセレクタを指定してPlaywrightでWebページから要素を抽出、テキスト/属性をテーブル表示しJSON/CSVエクスポート",
};

export default function Page() {
  return <WebScraperPage />;
}
