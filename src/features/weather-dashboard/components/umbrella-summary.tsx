import { Umbrella } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getUmbrellaSummary } from "../lib/weather-summary";
import type { DailyForecast } from "../lib/types";

type Props = {
  today: DailyForecast | undefined;
};

export function UmbrellaSummary({ today }: Props) {
  const message = getUmbrellaSummary(today);
  return (
    <Alert>
      <Umbrella className="h-4 w-4" />
      <AlertTitle>本日の傘判定</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
