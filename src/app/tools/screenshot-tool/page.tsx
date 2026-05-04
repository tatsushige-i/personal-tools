import type { Metadata } from "next";
import { ScreenshotPage } from "@/features/screenshot-tool/components/screenshot-page";

export const metadata: Metadata = {
  title: "Screenshot Tool - Personal Tools",
  description:
    "URLを入力するとPlaywrightでデスクトップ/タブレット/モバイルの3サイズを撮影、PNG・WebPでダウンロード",
};

export default function Page() {
  return <ScreenshotPage />;
}
