import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";
import { weatherIconCategory } from "../lib/weather-summary";

type Props = {
  code: number;
  className?: string;
  label?: string;
};

export function WeatherIcon({ code, className, label }: Props) {
  const ariaProps = label
    ? { "aria-label": label, role: "img" as const }
    : { "aria-hidden": true as const };
  switch (weatherIconCategory(code)) {
    case "sun":
      return <Sun className={className} {...ariaProps} />;
    case "cloudSun":
      return <CloudSun className={className} {...ariaProps} />;
    case "cloud":
      return <Cloud className={className} {...ariaProps} />;
    case "fog":
      return <CloudFog className={className} {...ariaProps} />;
    case "drizzle":
      return <CloudDrizzle className={className} {...ariaProps} />;
    case "rain":
      return <CloudRain className={className} {...ariaProps} />;
    case "snow":
      return <CloudSnow className={className} {...ariaProps} />;
    case "lightning":
      return <CloudLightning className={className} {...ariaProps} />;
    case "hail":
      return <CloudHail className={className} {...ariaProps} />;
  }
}
