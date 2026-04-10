import type { WifiConfig } from "./types";

function escapeWifiField(value: string): string {
  return value.replace(/[\\;,:"]/g, (c) => `\\${c}`);
}

export function buildWifiString(config: WifiConfig): string {
  const parts = [
    `T:${config.encryption}`,
    `S:${escapeWifiField(config.ssid)}`,
  ];

  if (config.encryption !== "nopass") {
    parts.push(`P:${escapeWifiField(config.password)}`);
  }

  if (config.hidden) {
    parts.push("H:true");
  }

  return `WIFI:${parts.join(";")};;`;
}
