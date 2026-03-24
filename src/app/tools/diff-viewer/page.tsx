import type { Metadata } from "next";
import { DiffViewerPage } from "@/features/diff-viewer/components/diff-viewer-page";

export const metadata: Metadata = {
  title: "Diff Viewer - Personal Tools",
  description:
    "テキスト・JSONの差分表示、行単位/単語単位のdiffモード、unified diffエクスポート",
};

export default function Page() {
  return <DiffViewerPage />;
}
