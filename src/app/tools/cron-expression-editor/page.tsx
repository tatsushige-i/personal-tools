import type { Metadata } from "next";
import { CronExpressionEditorPage } from "@/features/cron-expression-editor/components/cron-expression-editor-page";

export const metadata: Metadata = {
  title: "Cron Expression Editor - Personal Tools",
  description: "Cron式の組み立て・検証、次回実行予定の表示",
};

export default function Page() {
  return <CronExpressionEditorPage />;
}
