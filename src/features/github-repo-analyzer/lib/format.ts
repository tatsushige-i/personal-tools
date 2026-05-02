export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0";
  if (value < 1000) return String(value);
  if (value < 10_000) {
    const thousands = value / 1000;
    return `${thousands.toFixed(1).replace(/\.0$/, "")}k`;
  }
  if (value < 1_000_000) {
    return `${Math.floor(value / 1000)}k`;
  }
  const millions = value / 1_000_000;
  return `${millions.toFixed(1).replace(/\.0$/, "")}M`;
}

export function formatRelativeDate(
  isoDate: string,
  now: Date = new Date()
): string {
  const target = Date.parse(isoDate);
  if (!Number.isFinite(target)) return isoDate;
  const diffMs = now.getTime() - target;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return "数秒前";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "昨日";
  if (diffDays < 30) return `${diffDays}日前`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}ヶ月前`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}年前`;
}

export function computeLanguagePercentages(
  languages: Record<string, number>
): Array<{ language: string; bytes: number; percentage: number }> {
  const total = Object.values(languages).reduce((sum, n) => sum + n, 0);
  if (total <= 0) return [];
  return Object.entries(languages)
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: (bytes / total) * 100,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}
