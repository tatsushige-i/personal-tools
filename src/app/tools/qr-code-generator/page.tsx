import type { Metadata } from "next";
import { QrCodeGeneratorPage } from "@/features/qr-code-generator/components/qr-code-generator-page";

export const metadata: Metadata = {
  title: "QR Code Generator - Personal Tools",
  description:
    "URLやテキストからQRコード生成、サイズ・色・ロゴのカスタマイズ、PNG/SVGダウンロード",
};

export default function Page() {
  return <QrCodeGeneratorPage />;
}
