import type { Metadata } from "next";
import { ApiTesterPage } from "@/features/api-tester/components/api-tester-page";

export const metadata: Metadata = {
  title: "API Tester - Personal Tools",
  description:
    "REST API へリクエストを送信、レスポンスを整形表示・cURLエクスポート、セッション履歴",
};

export default function Page() {
  return <ApiTesterPage />;
}
