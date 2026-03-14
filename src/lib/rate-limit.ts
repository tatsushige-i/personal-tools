type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; remaining: 0; retryAfterMs: number };

export function createRateLimit(options: RateLimitOptions) {
  const { limit, windowMs } = options;
  const requests = new Map<string, number[]>();

  // 期限切れエントリの自動クリーンアップ（60秒間隔）
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, valid);
      }
    }
  }, 60_000);

  // Node.js でプロセス終了をブロックしないようにする
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  function check(key: string, now: number = Date.now()): RateLimitResult {
    const timestamps = requests.get(key) ?? [];
    const valid = timestamps.filter((t) => now - t < windowMs);

    if (valid.length >= limit) {
      const oldestInWindow = valid[0];
      const retryAfterMs = oldestInWindow + windowMs - now;
      return { allowed: false, remaining: 0, retryAfterMs };
    }

    valid.push(now);
    requests.set(key, valid);

    return { allowed: true, remaining: limit - valid.length };
  }

  return { check };
}
