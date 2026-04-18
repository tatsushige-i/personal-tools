import type { Category, ConversionResult } from "./types";
import { getCategoryConfig, getUnit } from "./units";

function convertTemperature(
  value: number,
  from: string,
  to: string,
): { value: number; formula: string } {
  const fmt = (n: number) => formatNumber(n);

  if (from === to) {
    return { value, formula: `${fmt(value)} = ${fmt(value)}` };
  }

  // Convert to Celsius first
  let celsius: number;
  let step1: string;

  switch (from) {
    case "c":
      celsius = value;
      step1 = `${fmt(value)} °C`;
      break;
    case "f":
      celsius = (value - 32) * (5 / 9);
      step1 = `(${fmt(value)} °F − 32) × 5/9 = ${fmt(celsius)} °C`;
      break;
    case "k":
      celsius = value - 273.15;
      step1 = `${fmt(value)} K − 273.15 = ${fmt(celsius)} °C`;
      break;
    default:
      return { value, formula: "" };
  }

  // Convert from Celsius to target
  let result: number;
  let formula: string;

  switch (to) {
    case "c":
      result = celsius;
      formula = from === "c" ? step1 : step1;
      break;
    case "f":
      result = celsius * (9 / 5) + 32;
      if (from === "c") {
        formula = `${fmt(value)} °C × 9/5 + 32 = ${fmt(result)} °F`;
      } else {
        formula = `${step1} → ${fmt(celsius)} °C × 9/5 + 32 = ${fmt(result)} °F`;
      }
      break;
    case "k":
      result = celsius + 273.15;
      if (from === "c") {
        formula = `${fmt(value)} °C + 273.15 = ${fmt(result)} K`;
      } else {
        formula = `${step1} → ${fmt(celsius)} °C + 273.15 = ${fmt(result)} K`;
      }
      break;
    default:
      return { value, formula: "" };
  }

  return { value: result, formula };
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  // Show up to 10 significant digits, trim trailing zeros
  return parseFloat(n.toPrecision(10)).toString();
}

export function convert(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: Category,
): ConversionResult {
  if (fromUnitId === toUnitId) {
    const unit = getUnit(category, fromUnitId);
    const symbol = unit?.symbol ?? fromUnitId;
    return {
      value,
      formula: `${formatNumber(value)} ${symbol} = ${formatNumber(value)} ${symbol}`,
    };
  }

  if (category === "temperature") {
    const result = convertTemperature(value, fromUnitId, toUnitId);
    return result;
  }

  const config = getCategoryConfig(category);
  if (!config) return { value: 0, formula: "" };

  const fromUnit = config.units.find((u) => u.id === fromUnitId);
  const toUnit = config.units.find((u) => u.id === toUnitId);

  if (!fromUnit?.toBase || !toUnit?.toBase) {
    return { value: 0, formula: "" };
  }

  const baseValue = value * fromUnit.toBase;
  const result = baseValue / toUnit.toBase;

  const ratio = fromUnit.toBase / toUnit.toBase;
  const formula = `${formatNumber(value)} ${fromUnit.symbol} × ${formatNumber(ratio)} = ${formatNumber(result)} ${toUnit.symbol}`;

  return { value: result, formula };
}
