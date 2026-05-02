import type { Metadata } from "next";
import { ExchangeRateCalculatorPage } from "@/features/exchange-rate-calculator/components/exchange-rate-calculator-page";

export const metadata: Metadata = {
  title: "Exchange Rate Calculator - Personal Tools",
  description:
    "ECB公表の日次為替レートで通貨変換、お気に入り通貨ペア・30日推移グラフ",
};

export default function Page() {
  return <ExchangeRateCalculatorPage />;
}
