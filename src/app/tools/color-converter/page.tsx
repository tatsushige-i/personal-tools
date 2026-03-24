import type { Metadata } from "next";
import { ColorConverterPage } from "@/features/color-converter/components/color-converter-page";

export const metadata: Metadata = {
  title: "Color Converter - Personal Tools",
  description:
    "HEX / RGB / HSL / Tailwind色名の相互変換、コントラスト比チェック",
};

export default function Page() {
  return <ColorConverterPage />;
}
