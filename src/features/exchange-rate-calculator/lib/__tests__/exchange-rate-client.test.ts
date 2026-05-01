import {
  ExchangeRateError,
  fetchCurrencies,
  fetchLatestRates,
  fetchTimeseries,
} from "../exchange-rate-client";

describe("fetchCurrencies", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns currency map on success", async () => {
    const payload = { USD: "United States Dollar", JPY: "Japanese Yen" };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchCurrencies();
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("mode=currencies"));
  });
});

describe("fetchLatestRates", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns latest rates on success", async () => {
    const payload = { base: "USD", date: "2026-04-30", rates: { JPY: 150.1, EUR: 0.92 } };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchLatestRates("USD", ["JPY", "EUR"]);
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("mode=latest"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("from=USD"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("to=JPY%2CEUR"));
  });

  it("throws ExchangeRateError with errorCode on validation error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: "from は3文字の通貨コードを指定してください。",
          errorCode: "VALIDATION_ERROR",
        }),
    });

    const error = await fetchLatestRates("X", ["JPY"]).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExchangeRateError);
    expect((error as ExchangeRateError).errorCode).toBe("VALIDATION_ERROR");
    expect((error as ExchangeRateError).message).toContain("from");
  });

  it("throws fallback error when response body is not JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error("invalid")),
    });

    await expect(fetchLatestRates("USD", ["JPY"])).rejects.toThrow(
      "リクエストに失敗しました。（502）"
    );
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

    const error = await fetchLatestRates("USD", ["JPY"]).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExchangeRateError);
    expect((error as ExchangeRateError).errorCode).toBe("RATE_LIMITED");
  });
});

describe("fetchTimeseries", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns timeseries on success", async () => {
    const payload = {
      base: "USD",
      target: "JPY",
      start: "2026-04-01",
      end: "2026-04-30",
      points: [
        { date: "2026-04-01", rate: 150.0 },
        { date: "2026-04-02", rate: 150.1 },
      ],
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchTimeseries("USD", "JPY", "2026-04-01", "2026-04-30");
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("mode=timeseries"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("from=USD"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("to=JPY"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("start=2026-04-01"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("end=2026-04-30"));
  });
});
