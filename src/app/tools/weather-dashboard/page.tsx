import type { Metadata } from "next";
import { WeatherDashboardPage } from "@/features/weather-dashboard/components/weather-dashboard-page";

export const metadata: Metadata = {
  title: "Weather Dashboard - Personal Tools",
  description: "現在の天気と週間予報を表示するダッシュボード",
};

export default function Page() {
  return <WeatherDashboardPage />;
}
