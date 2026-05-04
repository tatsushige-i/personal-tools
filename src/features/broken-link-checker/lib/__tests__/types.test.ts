import {
  DEPTHS,
  classifyStatus,
  isDepth,
  isErrorStatus,
} from "@/features/broken-link-checker/lib/types";

describe("isDepth", () => {
  it("accepts each value in DEPTHS", () => {
    for (const d of DEPTHS) {
      expect(isDepth(d)).toBe(true);
    }
  });

  it("rejects values outside DEPTHS", () => {
    expect(isDepth(0)).toBe(false);
    expect(isDepth(3)).toBe(false);
    expect(isDepth("1")).toBe(false);
    expect(isDepth(null)).toBe(false);
    expect(isDepth(undefined)).toBe(false);
  });
});

describe("classifyStatus", () => {
  it("returns 'ok' for 2xx", () => {
    expect(classifyStatus(200)).toBe("ok");
    expect(classifyStatus(204)).toBe("ok");
    expect(classifyStatus(299)).toBe("ok");
  });

  it("returns 'redirect' for 3xx", () => {
    expect(classifyStatus(301)).toBe("redirect");
    expect(classifyStatus(302)).toBe("redirect");
    expect(classifyStatus(308)).toBe("redirect");
  });

  it("returns 'client-error' for 4xx", () => {
    expect(classifyStatus(400)).toBe("client-error");
    expect(classifyStatus(404)).toBe("client-error");
    expect(classifyStatus(499)).toBe("client-error");
  });

  it("returns 'server-error' for 5xx and beyond", () => {
    expect(classifyStatus(500)).toBe("server-error");
    expect(classifyStatus(503)).toBe("server-error");
    expect(classifyStatus(599)).toBe("server-error");
  });
});

describe("isErrorStatus", () => {
  it("flags client/server/network/timeout as errors", () => {
    expect(isErrorStatus("client-error")).toBe(true);
    expect(isErrorStatus("server-error")).toBe(true);
    expect(isErrorStatus("network-error")).toBe(true);
    expect(isErrorStatus("timeout")).toBe(true);
  });

  it("does not flag ok/redirect as errors", () => {
    expect(isErrorStatus("ok")).toBe(false);
    expect(isErrorStatus("redirect")).toBe(false);
  });
});
