import { buildCurl } from "../curl-builder";

describe("buildCurl", () => {
  it("builds GET curl without body", () => {
    const result = buildCurl({
      method: "GET",
      url: "https://api.example.com/users",
      headers: {},
      body: null,
    });
    expect(result).toBe("curl -X GET \\\n  'https://api.example.com/users'");
  });

  it("includes headers", () => {
    const result = buildCurl({
      method: "GET",
      url: "https://api.example.com",
      headers: { Accept: "application/json", "X-Token": "abc" },
      body: null,
    });
    expect(result).toContain("-H 'Accept: application/json'");
    expect(result).toContain("-H 'X-Token: abc'");
  });

  it("includes body for POST", () => {
    const result = buildCurl({
      method: "POST",
      url: "https://api.example.com/posts",
      headers: { "Content-Type": "application/json" },
      body: '{"title":"hello"}',
    });
    expect(result).toContain("--data '{\"title\":\"hello\"}'");
  });

  it("escapes single quotes in values", () => {
    const result = buildCurl({
      method: "POST",
      url: "https://api.example.com",
      headers: { "X-Note": "it's fine" },
      body: "name='alice'",
    });
    expect(result).toContain("'X-Note: it'\\''s fine'");
    expect(result).toContain("'name='\\''alice'\\'''");
  });

  it("omits body when null or empty", () => {
    expect(
      buildCurl({
        method: "POST",
        url: "https://x.test",
        headers: {},
        body: null,
      })
    ).not.toContain("--data");
    expect(
      buildCurl({
        method: "POST",
        url: "https://x.test",
        headers: {},
        body: "",
      })
    ).not.toContain("--data");
  });
});
