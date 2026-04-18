import type { Metadata } from "next";
import { UnitConverterPage } from "@/features/unit-converter/components/unit-converter-page";

export const metadata: Metadata = {
  title: "Unit Converter - Personal Tools",
  description: "長さ・重さ・温度など各種単位を変換するツール",
};

export default function Page() {
  return <UnitConverterPage />;
}
