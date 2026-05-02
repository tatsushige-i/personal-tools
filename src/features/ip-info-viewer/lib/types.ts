export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "UPSTREAM_ERROR"
  | "SERVER_ERROR";

export type IpVersion = "IPv4" | "IPv6";

export type IpInfo = {
  ip: string;
  version: IpVersion | null;
  city: string | null;
  region: string | null;
  countryCode: string | null;
  countryName: string | null;
  postal: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  utcOffset: string | null;
  org: string | null;
  asn: string | null;
};

export type SelfInfoResponse = {
  geo: IpInfo;
  headers: Record<string, string>;
};

export type LookupResponse = {
  geo: IpInfo;
};
