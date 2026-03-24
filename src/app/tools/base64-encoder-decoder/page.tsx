import type { Metadata } from "next";
import { Base64EncoderDecoderPage } from "@/features/base64-encoder-decoder/components/base64-encoder-decoder-page";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder - Personal Tools",
  description:
    "テキスト⇔Base64の相互変換、ファイルエンコード・Data URI生成",
};

export default function Page() {
  return <Base64EncoderDecoderPage />;
}
