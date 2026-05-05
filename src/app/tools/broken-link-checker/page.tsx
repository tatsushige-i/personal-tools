import type { Metadata } from "next";
import { BrokenLinkCheckerPage } from "@/features/broken-link-checker/components/broken-link-checker-page";

export const metadata: Metadata = {
  title: "リンク切れチェッカー - Personal Tools",
  description:
    "URLを入力するとPlaywrightでページ内の全リンクをクロールし、404/500/リダイレクト等のステータスと内部/外部分類を一覧化、CSVエクスポート対応",
};

export default function Page() {
  return <BrokenLinkCheckerPage />;
}
