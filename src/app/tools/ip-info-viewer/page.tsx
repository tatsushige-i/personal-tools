import type { Metadata } from "next";
import { IpInfoViewerPage } from "@/features/ip-info-viewer/components/ip-info-viewer-page";

export const metadata: Metadata = {
  title: "IP Info Viewer - Personal Tools",
  description:
    "自分のグローバルIPとジオロケーション、ISP・タイムゾーン、HTTPリクエストヘッダーを表示",
};

export default function Page() {
  return <IpInfoViewerPage />;
}
