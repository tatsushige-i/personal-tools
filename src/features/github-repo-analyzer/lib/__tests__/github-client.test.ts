import {
  GithubApiError,
  fetchCloseTimeStats,
  fetchContributionCalendar,
  fetchRepoStats,
  fetchUserRepos,
} from "../github-client";

describe("fetchUserRepos", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns repos on success", async () => {
    const payload = {
      repos: [
        {
          id: 1,
          name: "demo",
          fullName: "facebook/demo",
          description: null,
          htmlUrl: "https://github.com/facebook/demo",
          stargazersCount: 10,
          forksCount: 2,
          openIssuesCount: 1,
          language: "TypeScript",
          updatedAt: "2026-04-30T00:00:00Z",
          isFork: false,
          isArchived: false,
        },
      ],
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchUserRepos("facebook", "updated");
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("mode=repos")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("username=facebook")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("sort=updated")
    );
  });

  it("throws GithubApiError with errorCode on validation error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: "username は1〜39文字の英数字とハイフンで指定してください。",
          errorCode: "VALIDATION_ERROR",
        }),
    });

    const error = await fetchUserRepos("!!", "updated").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("VALIDATION_ERROR");
    expect((error as GithubApiError).message).toContain("username");
  });

  it("throws fallback error when response body is not JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error("invalid")),
    });

    await expect(fetchUserRepos("facebook", "updated")).rejects.toThrow(
      "リクエストに失敗しました。（502）"
    );
  });

  it("propagates RATE_LIMITED errorCode", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          error: "GitHub API のレート制限に達しました。",
          errorCode: "RATE_LIMITED",
        }),
    });

    const error = await fetchUserRepos("facebook", "updated").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("RATE_LIMITED");
  });
});

describe("fetchRepoStats", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns stats on success", async () => {
    const payload = {
      languages: { TypeScript: 1000, JavaScript: 500 },
      openIssueCount: 12,
      openPullRequestCount: 3,
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchRepoStats("facebook", "react");
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("mode=repo-stats")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("owner=facebook")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("repo=react")
    );
  });

  it("propagates NOT_FOUND errorCode", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () =>
        Promise.resolve({
          error: "指定されたリソースが見つかりませんでした。",
          errorCode: "NOT_FOUND",
        }),
    });

    const error = await fetchRepoStats("facebook", "nope").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("NOT_FOUND");
  });
});

describe("fetchCloseTimeStats", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns stats on success", async () => {
    const payload = {
      issues: { count: 10, averageMs: 86_400_000, medianMs: 43_200_000 },
      pullRequests: { count: 5, averageMs: 3_600_000, medianMs: 1_800_000 },
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchCloseTimeStats("facebook", "react");
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("mode=close-time-stats")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("owner=facebook")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("repo=react")
    );
  });

  it("propagates NOT_FOUND errorCode", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () =>
        Promise.resolve({
          error: "指定されたリソースが見つかりませんでした。",
          errorCode: "NOT_FOUND",
        }),
    });

    const error = await fetchCloseTimeStats("facebook", "nope").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("NOT_FOUND");
  });

  it("propagates RATE_LIMITED errorCode", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          error: "GitHub API のレート制限に達しました。",
          errorCode: "RATE_LIMITED",
        }),
    });

    const error = await fetchCloseTimeStats("facebook", "react").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("RATE_LIMITED");
  });
});

describe("fetchContributionCalendar", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns calendar on success", async () => {
    const payload = {
      totalContributions: 1234,
      weeks: [
        {
          days: [
            { date: "2025-05-05", count: 0, level: 0 },
            { date: "2025-05-06", count: 5, level: 2 },
          ],
        },
      ],
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });
    global.fetch = fetchMock;

    const result = await fetchContributionCalendar("octocat");
    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("mode=contributions")
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("username=octocat")
    );
  });

  it("propagates NO_AUTH_TOKEN errorCode when token is unset", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () =>
        Promise.resolve({
          error: "GITHUB_TOKEN が設定されていません。",
          errorCode: "NO_AUTH_TOKEN",
        }),
    });

    const error = await fetchContributionCalendar("octocat").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("NO_AUTH_TOKEN");
  });

  it("propagates INVALID_TOKEN errorCode on 401", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({
          error: "GITHUB_TOKEN が無効です。",
          errorCode: "INVALID_TOKEN",
        }),
    });

    const error = await fetchContributionCalendar("octocat").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("INVALID_TOKEN");
  });

  it("propagates NOT_FOUND errorCode for unknown user", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () =>
        Promise.resolve({
          error: "指定されたユーザーが見つかりませんでした。",
          errorCode: "NOT_FOUND",
        }),
    });

    const error = await fetchContributionCalendar("nope-such-user").catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(GithubApiError);
    expect((error as GithubApiError).errorCode).toBe("NOT_FOUND");
  });
});
