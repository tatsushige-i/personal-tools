import { validateRequestUrl } from "../url-validator";

describe("validateRequestUrl", () => {
  it("accepts https URL", () => {
    const result = validateRequestUrl("https://api.example.com/path");
    expect(result.ok).toBe(true);
  });

  it("accepts http URL", () => {
    const result = validateRequestUrl("http://api.example.com/path");
    expect(result.ok).toBe(true);
  });

  it("rejects empty input", () => {
    const result = validateRequestUrl("");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errorCode).toBe("invalid_url");
  });

  it("rejects whitespace-only input", () => {
    const result = validateRequestUrl("   ");
    expect(result.ok).toBe(false);
  });

  it("rejects malformed URL", () => {
    const result = validateRequestUrl("not a url");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errorCode).toBe("invalid_url");
  });

  it("rejects non-http(s) protocols", () => {
    for (const url of [
      "ftp://example.com",
      "file:///etc/passwd",
      "javascript:alert(1)",
    ]) {
      const result = validateRequestUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errorCode).toBe("invalid_url");
    }
  });

  it("blocks localhost variants", () => {
    for (const url of [
      "http://localhost",
      "http://localhost:8080/api",
      "http://api.localhost",
      "http://LOCALHOST",
    ]) {
      const result = validateRequestUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errorCode).toBe("blocked_url");
    }
  });

  it("blocks loopback IPv4", () => {
    for (const url of ["http://127.0.0.1", "http://127.5.5.5:8080"]) {
      const result = validateRequestUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errorCode).toBe("blocked_url");
    }
  });

  it("blocks private IPv4 ranges", () => {
    for (const url of [
      "http://10.0.0.1",
      "http://10.255.255.255",
      "http://172.16.0.1",
      "http://172.31.255.255",
      "http://192.168.1.1",
      "http://169.254.169.254",
      "http://0.0.0.0",
    ]) {
      const result = validateRequestUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errorCode).toBe("blocked_url");
    }
  });

  it("allows public IPv4", () => {
    for (const url of ["http://8.8.8.8", "http://172.15.0.1", "http://172.32.0.1"]) {
      const result = validateRequestUrl(url);
      expect(result.ok).toBe(true);
    }
  });

  it("blocks IPv6 loopback and private ranges", () => {
    for (const url of [
      "http://[::1]",
      "http://[::]",
      "http://[fe80::1]",
      "http://[fc00::1]",
      "http://[fd00::1]",
      "http://[::ffff:127.0.0.1]",
    ]) {
      const result = validateRequestUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errorCode).toBe("blocked_url");
    }
  });

  it("blocks IPv4 multicast (224.0.0.0+)", () => {
    const result = validateRequestUrl("http://224.0.0.1");
    expect(result.ok).toBe(false);
  });
});
