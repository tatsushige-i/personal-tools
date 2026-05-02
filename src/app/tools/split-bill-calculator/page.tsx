import type { Metadata } from "next";
import { SplitBillCalculatorPage } from "@/features/split-bill-calculator/components/split-bill-calculator-page";

export const metadata: Metadata = {
  title: "Split Bill Calculator - Personal Tools",
  description: "割り勘計算、端数処理、傾斜配分、税・サービス料の別計算",
};

export default function Page() {
  return <SplitBillCalculatorPage />;
}
