import type { IpInfo } from "./types";

export function formatLocation(info: IpInfo): string {
  const parts = [info.city, info.region, info.countryName].filter(
    (part): part is string => Boolean(part)
  );
  return parts.length > 0 ? parts.join(", ") : "不明";
}

export function formatCoordinates(info: IpInfo): string | null {
  if (info.latitude === null || info.longitude === null) return null;
  return `${info.latitude.toFixed(4)}, ${info.longitude.toFixed(4)}`;
}

export function formatTimezone(info: IpInfo): string | null {
  if (!info.timezone) return null;
  return info.utcOffset ? `${info.timezone} (UTC${info.utcOffset})` : info.timezone;
}
