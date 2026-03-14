import { createRateLimit } from "../rate-limit";

describe("createRateLimit", () => {
  it("制限内のリクエストを許可する", () => {
    const rateLimit = createRateLimit({ limit: 3, windowMs: 60_000 });
    const result = rateLimit.check("192.168.1.1", 1000);
    expect(result).toEqual({ allowed: true, remaining: 2 });
  });

  it("remainingカウントが正しく減少する", () => {
    const rateLimit = createRateLimit({ limit: 3, windowMs: 60_000 });

    const r1 = rateLimit.check("ip1", 1000);
    expect(r1).toEqual({ allowed: true, remaining: 2 });

    const r2 = rateLimit.check("ip1", 2000);
    expect(r2).toEqual({ allowed: true, remaining: 1 });

    const r3 = rateLimit.check("ip1", 3000);
    expect(r3).toEqual({ allowed: true, remaining: 0 });
  });

  it("制限超過時に拒否しretryAfterMsを返す", () => {
    const rateLimit = createRateLimit({ limit: 2, windowMs: 60_000 });

    rateLimit.check("ip1", 1000);
    rateLimit.check("ip1", 2000);

    const result = rateLimit.check("ip1", 3000);
    expect(result).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterMs: 58_000, // 1000 + 60000 - 3000
    });
  });

  it("ウィンドウ外のリクエストはカウントされない（スライディングウィンドウ）", () => {
    const rateLimit = createRateLimit({ limit: 2, windowMs: 10_000 });

    rateLimit.check("ip1", 1000);
    rateLimit.check("ip1", 2000);

    // 3000ms時点では制限超過
    const blocked = rateLimit.check("ip1", 3000);
    expect(blocked.allowed).toBe(false);

    // 11001ms時点では最初のリクエストがウィンドウ外
    const allowed = rateLimit.check("ip1", 11_001);
    expect(allowed).toEqual({ allowed: true, remaining: 0 });
  });

  it("異なるキー（IP）が独立して管理される", () => {
    const rateLimit = createRateLimit({ limit: 1, windowMs: 60_000 });

    rateLimit.check("ip1", 1000);
    const blockedIp1 = rateLimit.check("ip1", 2000);
    expect(blockedIp1.allowed).toBe(false);

    const allowedIp2 = rateLimit.check("ip2", 2000);
    expect(allowedIp2).toEqual({ allowed: true, remaining: 0 });
  });
});
