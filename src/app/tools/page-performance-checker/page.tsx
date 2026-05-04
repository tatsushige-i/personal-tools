import type { Metadata } from "next";
import { PagePerformanceCheckerPage } from "@/features/page-performance-checker/components/page-performance-checker-page";

export const metadata: Metadata = {
  title: "ページパフォーマンスチェッカー - Personal Tools",
  description:
    "URLからWeb Vitals相当（LCP/CLS/FCP/TBT）・読み込みタイミング・リソース一覧を計測し、デスクトップ/モバイルで比較",
};

export default function Page() {
  return <PagePerformanceCheckerPage />;
}
