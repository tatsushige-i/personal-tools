export type TimezoneOption = {
  label: string;
  value: string;
};

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "UTC", value: "UTC" },
  { label: "America/New_York (ET)", value: "America/New_York" },
  { label: "America/Chicago (CT)", value: "America/Chicago" },
  { label: "America/Denver (MT)", value: "America/Denver" },
  { label: "America/Los_Angeles (PT)", value: "America/Los_Angeles" },
  { label: "Europe/London (GMT/BST)", value: "Europe/London" },
  { label: "Europe/Berlin (CET)", value: "Europe/Berlin" },
  { label: "Asia/Shanghai (CST)", value: "Asia/Shanghai" },
  { label: "Asia/Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Australia/Sydney (AEST)", value: "Australia/Sydney" },
];

export function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
