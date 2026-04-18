import type { CategoryConfig } from "./types";

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "length",
    label: "長さ",
    icon: "Ruler",
    baseUnitId: "m",
    units: [
      { id: "mm", name: "ミリメートル", symbol: "mm", toBase: 0.001 },
      { id: "cm", name: "センチメートル", symbol: "cm", toBase: 0.01 },
      { id: "m", name: "メートル", symbol: "m", toBase: 1 },
      { id: "km", name: "キロメートル", symbol: "km", toBase: 1000 },
      { id: "in", name: "インチ", symbol: "in", toBase: 0.0254 },
      { id: "ft", name: "フィート", symbol: "ft", toBase: 0.3048 },
      { id: "yd", name: "ヤード", symbol: "yd", toBase: 0.9144 },
      { id: "mi", name: "マイル", symbol: "mi", toBase: 1609.344 },
    ],
  },
  {
    id: "weight",
    label: "重さ",
    icon: "Weight",
    baseUnitId: "g",
    units: [
      { id: "mg", name: "ミリグラム", symbol: "mg", toBase: 0.001 },
      { id: "g", name: "グラム", symbol: "g", toBase: 1 },
      { id: "kg", name: "キログラム", symbol: "kg", toBase: 1000 },
      { id: "oz", name: "オンス", symbol: "oz", toBase: 28.3495 },
      { id: "lb", name: "ポンド", symbol: "lb", toBase: 453.592 },
    ],
  },
  {
    id: "temperature",
    label: "温度",
    icon: "Thermometer",
    baseUnitId: "c",
    units: [
      { id: "c", name: "摂氏", symbol: "°C", toBase: null },
      { id: "f", name: "華氏", symbol: "°F", toBase: null },
      { id: "k", name: "ケルビン", symbol: "K", toBase: null },
    ],
  },
  {
    id: "volume",
    label: "体積",
    icon: "Beaker",
    baseUnitId: "ml",
    units: [
      { id: "ml", name: "ミリリットル", symbol: "mL", toBase: 1 },
      { id: "l", name: "リットル", symbol: "L", toBase: 1000 },
      { id: "tsp", name: "小さじ (tsp)", symbol: "tsp", toBase: 4.92892 },
      { id: "tbsp", name: "大さじ (tbsp)", symbol: "tbsp", toBase: 14.7868 },
      { id: "floz", name: "液量オンス", symbol: "fl oz", toBase: 29.5735 },
      { id: "cup", name: "カップ (US)", symbol: "cup", toBase: 236.588 },
      { id: "gal", name: "ガロン (US)", symbol: "gal", toBase: 3785.41 },
    ],
  },
  {
    id: "speed",
    label: "速度",
    icon: "Gauge",
    baseUnitId: "ms",
    units: [
      { id: "ms", name: "メートル毎秒", symbol: "m/s", toBase: 1 },
      { id: "kmh", name: "キロメートル毎時", symbol: "km/h", toBase: 1 / 3.6 },
      { id: "mph", name: "マイル毎時", symbol: "mph", toBase: 0.44704 },
      { id: "knot", name: "ノット", symbol: "kn", toBase: 0.514444 },
    ],
  },
  {
    id: "data-size",
    label: "データサイズ",
    icon: "HardDrive",
    baseUnitId: "b",
    units: [
      { id: "b", name: "バイト", symbol: "B", toBase: 1 },
      { id: "kb", name: "キロバイト", symbol: "KB", toBase: 1000 },
      { id: "mb", name: "メガバイト", symbol: "MB", toBase: 1e6 },
      { id: "gb", name: "ギガバイト", symbol: "GB", toBase: 1e9 },
      { id: "tb", name: "テラバイト", symbol: "TB", toBase: 1e12 },
      { id: "kib", name: "キビバイト", symbol: "KiB", toBase: 1024 },
      { id: "mib", name: "メビバイト", symbol: "MiB", toBase: 1048576 },
      { id: "gib", name: "ギビバイト", symbol: "GiB", toBase: 1073741824 },
      { id: "tib", name: "テビバイト", symbol: "TiB", toBase: 1099511627776 },
    ],
  },
];

export function getCategoryConfig(categoryId: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === categoryId);
}

export function getUnit(categoryId: string, unitId: string) {
  const category = getCategoryConfig(categoryId);
  return category?.units.find((u) => u.id === unitId);
}
