import type { Metadata } from "next";
import { RegexTesterPage } from "@/features/regex-tester/components/regex-tester-page";

export const metadata: Metadata = {
  title: "Regex Tester - Personal Tools",
  description: "正規表現のパターンマッチをリアルタイムで検証",
};

export default function Page() {
  return <RegexTesterPage />;
}
