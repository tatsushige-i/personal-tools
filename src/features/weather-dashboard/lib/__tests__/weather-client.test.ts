import { fetchForecast, searchCities, WeatherError } from "../weather-client";

describe("fetchForecast", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns forecast on successful response", async () => {
    const payload = {
      timezone: "Asia/Tokyo",
      current: {
        time: "2026-04-29T12:00",
        temperature: 22,
        humidity: 60,
        precipitationProbability: 10,
        windSpeed: 3,
        weatherCode: 0,
      },
      hourly: [],
      daily: [],
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchForecast(35.0, 139.0);
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("mode=forecast"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("lat=35"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("lon=139"));
  });

  it("throws WeatherError with errorCode on validation error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: "緯度・経度の指定が不正です。",
          errorCode: "VALIDATION_ERROR",
        }),
    });

    const error = await fetchForecast(999, 0).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(WeatherError);
    expect((error as WeatherError).errorCode).toBe("VALIDATION_ERROR");
    expect((error as WeatherError).message).toBe("緯度・経度の指定が不正です。");
  });

  it("throws fallback error when response body is not JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error("invalid")),
    });

    await expect(fetchForecast(0, 0)).rejects.toThrow("リクエストに失敗しました。（502）");
  });
});

describe("searchCities", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns geocoding results", async () => {
    const payload = {
      results: [
        {
          id: 1,
          name: "Tokyo",
          latitude: 35.68,
          longitude: 139.76,
          country: "Japan",
        },
      ],
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await searchCities("Tokyo");
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("mode=geocode"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("q=Tokyo"));
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

    const error = await searchCities("a".repeat(5)).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(WeatherError);
    expect((error as WeatherError).errorCode).toBe("RATE_LIMITED");
  });
});
