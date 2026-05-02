import {
  IpInfoError,
  fetchLookup,
  fetchSelfInfo,
} from "../ip-info-client";

const sampleGeo = {
  ip: "8.8.8.8",
  version: "IPv4" as const,
  city: "Mountain View",
  region: "California",
  countryCode: "US",
  countryName: "United States",
  postal: "94043",
  latitude: 37.4056,
  longitude: -122.0775,
  timezone: "America/Los_Angeles",
  utcOffset: "-0700",
  org: "GOOGLE",
  asn: "AS15169",
};

describe("fetchSelfInfo", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns geo and headers on success", async () => {
    const payload = {
      geo: sampleGeo,
      headers: { "user-agent": "Mozilla/5.0" },
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchSelfInfo();
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("mode=self")
    );
  });

  it("throws IpInfoError with errorCode on upstream error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () =>
        Promise.resolve({
          error: "IP情報サービスに接続できませんでした。",
          errorCode: "UPSTREAM_ERROR",
        }),
    });

    const error = await fetchSelfInfo().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IpInfoError);
    expect((error as IpInfoError).errorCode).toBe("UPSTREAM_ERROR");
  });

  it("propagates RATE_LIMITED errorCode", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          error: "リクエストが多すぎます。",
          errorCode: "RATE_LIMITED",
        }),
    });

    const error = await fetchSelfInfo().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IpInfoError);
    expect((error as IpInfoError).errorCode).toBe("RATE_LIMITED");
  });
});

describe("fetchLookup", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns geo on success and passes ip in query", async () => {
    const payload = { geo: sampleGeo };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchLookup("8.8.8.8");
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("mode=lookup")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("ip=8.8.8.8")
    );
  });

  it("throws IpInfoError with VALIDATION_ERROR on bad input", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: "IPアドレスの形式が正しくありません。",
          errorCode: "VALIDATION_ERROR",
        }),
    });

    const error = await fetchLookup("not-an-ip").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IpInfoError);
    expect((error as IpInfoError).errorCode).toBe("VALIDATION_ERROR");
    expect((error as IpInfoError).message).toContain("IPアドレス");
  });

  it("throws fallback error when response body is not JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("invalid")),
    });

    await expect(fetchLookup("8.8.8.8")).rejects.toThrow(
      "リクエストに失敗しました。（500）"
    );
  });
});
