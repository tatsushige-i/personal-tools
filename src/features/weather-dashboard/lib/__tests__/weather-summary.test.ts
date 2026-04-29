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
import {
  describeWeatherCode,
  getUmbrellaSummary,
  getWeatherIcon,
  UMBRELLA_THRESHOLD,
} from "../weather-summary";
import type { DailyForecast } from "../types";

function makeDay(probability: number): DailyForecast {
  return {
    date: "2026-04-29",
    weatherCode: 0,
    temperatureMax: 20,
    temperatureMin: 12,
    precipitationProbabilityMax: probability,
  };
}

describe("getUmbrellaSummary", () => {
  it("returns fallback message when today is undefined", () => {
    expect(getUmbrellaSummary(undefined)).toContain("取得できませんでした");
  });

  it("returns 'umbrella required' for very high probability (>=80)", () => {
    const message = getUmbrellaSummary(makeDay(85));
    expect(message).toContain("85%");
    expect(message).toContain("傘を必ず");
  });

  it("recommends umbrella at the threshold (50)", () => {
    const message = getUmbrellaSummary(makeDay(UMBRELLA_THRESHOLD));
    expect(message).toContain(`${UMBRELLA_THRESHOLD}%`);
    expect(message).toContain("傘を持って");
  });

  it("suggests folding umbrella between 20 and threshold", () => {
    const message = getUmbrellaSummary(makeDay(30));
    expect(message).toContain("30%");
    expect(message).toContain("折りたたみ");
  });

  it("says umbrella is unnecessary below 20", () => {
    const message = getUmbrellaSummary(makeDay(10));
    expect(message).toContain("10%");
    expect(message).toContain("不要");
  });

  it("handles 0% as no umbrella", () => {
    const message = getUmbrellaSummary(makeDay(0));
    expect(message).toContain("不要");
  });

  it("handles 100% as strongly recommended", () => {
    const message = getUmbrellaSummary(makeDay(100));
    expect(message).toContain("傘を必ず");
  });
});

describe("describeWeatherCode", () => {
  it.each([
    [0, "快晴"],
    [3, "曇り"],
    [63, "雨"],
    [95, "雷雨"],
  ])("describes code %i as %s", (code, expected) => {
    expect(describeWeatherCode(code)).toBe(expected);
  });

  it("returns '不明' for unknown code", () => {
    expect(describeWeatherCode(9999)).toBe("不明");
  });
});

describe("getWeatherIcon", () => {
  it.each([
    [0, Sun],
    [1, Sun],
    [2, CloudSun],
    [3, Cloud],
    [45, CloudFog],
    [48, CloudFog],
    [51, CloudDrizzle],
    [55, CloudDrizzle],
    [57, CloudDrizzle],
    [61, CloudRain],
    [65, CloudRain],
    [80, CloudRain],
    [82, CloudRain],
    [71, CloudSnow],
    [75, CloudSnow],
    [85, CloudSnow],
    [86, CloudSnow],
    [95, CloudLightning],
    [96, CloudHail],
    [99, CloudHail],
  ])("maps weather code %i to the expected icon", (code, expected) => {
    expect(getWeatherIcon(code)).toBe(expected);
  });

  it("falls back to Cloud for unknown codes", () => {
    expect(getWeatherIcon(9999)).toBe(Cloud);
  });
});
