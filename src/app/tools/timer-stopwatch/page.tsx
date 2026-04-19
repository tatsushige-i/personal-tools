import type { Metadata } from "next";
import { TimerStopwatchPage } from "@/features/timer-stopwatch/components/timer-stopwatch-page";

export const metadata: Metadata = {
  title: "Timer / Stopwatch - Personal Tools",
  description: "複数タイマーの同時計測と、ラップ記録付きストップウォッチ",
};

export default function Page() {
  return <TimerStopwatchPage />;
}
