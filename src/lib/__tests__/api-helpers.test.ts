/**
 * @jest-environment node
 */
import { getClientIp, rateLimitResponse } from "../api-helpers";

describe("getClientIp", () => {
  it("x-forwarded-forからIPを抽出する", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("x-forwarded-forのカンマ区切りから最初のIPを取得する", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1, 198.51.100.1, 192.0.2.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("x-real-ipにフォールバックする", () => {
    const request = new Request("http://localhost", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(getClientIp(request)).toBe("198.51.100.1");
  });

  it("x-forwarded-forが空文字の場合にx-real-ipにフォールバックする", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": " , ", "x-real-ip": "198.51.100.1" },
    });
    expect(getClientIp(request)).toBe("198.51.100.1");
  });

  it("x-forwarded-forが空文字でx-real-ipもない場合にunknownを返す", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "" },
    });
    expect(getClientIp(request)).toBe("unknown");
  });

  it("ヘッダーなしで'unknown'を返す", () => {
    const request = new Request("http://localhost");
    expect(getClientIp(request)).toBe("unknown");
  });
});

describe("rateLimitResponse", () => {
  it("429ステータスコードを返す", async () => {
    const response = rateLimitResponse(30_000);
    expect(response.status).toBe(429);
  });

  it("Retry-Afterヘッダーを秒単位で返す", () => {
    const response = rateLimitResponse(30_000);
    expect(response.headers.get("Retry-After")).toBe("30");
  });

  it("ミリ秒を秒に切り上げる", () => {
    const response = rateLimitResponse(1_500);
    expect(response.headers.get("Retry-After")).toBe("2");
  });

  it("エラーメッセージをJSON本文に含む", async () => {
    const response = rateLimitResponse(30_000);
    const body = await response.json();
    expect(body.error).toBe(
      "リクエストが多すぎます。しばらく経ってから再度お試しください。"
    );
  });
});
