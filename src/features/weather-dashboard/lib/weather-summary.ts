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
  type LucideIcon,
} from "lucide-react";
import type { DailyForecast } from "./types";

export const UMBRELLA_THRESHOLD = 50;

export function getUmbrellaSummary(today: DailyForecast | undefined): string {
  if (!today) {
    return "本日の予報を取得できませんでした。";
  }
  const probability = today.precipitationProbabilityMax;
  if (probability >= 80) {
    return `本日は雨の可能性が非常に高いです（降水確率 ${probability}%）。傘を必ず持って出かけましょう。`;
  }
  if (probability >= UMBRELLA_THRESHOLD) {
    return `本日は雨が降るかもしれません（降水確率 ${probability}%）。傘を持って出かけると安心です。`;
  }
  if (probability >= 20) {
    return `本日の降水確率は ${probability}% です。念のため折りたたみ傘があると安心です。`;
  }
  return `本日の降水確率は ${probability}% です。傘は不要そうです。`;
}

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: "快晴",
  1: "晴れ",
  2: "薄曇り",
  3: "曇り",
  45: "霧",
  48: "霧氷",
  51: "霧雨（弱）",
  53: "霧雨",
  55: "霧雨（強）",
  56: "着氷性の霧雨",
  57: "着氷性の強い霧雨",
  61: "雨（弱）",
  63: "雨",
  65: "雨（強）",
  66: "凍雨",
  67: "強い凍雨",
  71: "雪（弱）",
  73: "雪",
  75: "雪（強）",
  77: "霧雪",
  80: "にわか雨（弱）",
  81: "にわか雨",
  82: "激しいにわか雨",
  85: "にわか雪（弱）",
  86: "にわか雪",
  95: "雷雨",
  96: "雷雨と弱いひょう",
  99: "雷雨と強いひょう",
};

export function describeWeatherCode(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? "不明";
}

export type WeatherIconCategory =
  | "sun"
  | "cloudSun"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "lightning"
  | "hail";

export function weatherIconCategory(code: number): WeatherIconCategory {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "cloudSun";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code === 95) return "lightning";
  if (code === 96 || code === 99) return "hail";
  return "cloud";
}

const ICON_BY_CATEGORY: Record<WeatherIconCategory, LucideIcon> = {
  sun: Sun,
  cloudSun: CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  lightning: CloudLightning,
  hail: CloudHail,
};

export function getWeatherIcon(code: number): LucideIcon {
  return ICON_BY_CATEGORY[weatherIconCategory(code)];
}
