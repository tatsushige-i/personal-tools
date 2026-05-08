import { act, renderHook, waitFor } from "@testing-library/react";
import { useGithubFavorites } from "../use-github-favorites";

const STORAGE_KEY = "github-repo-analyzer:favorites";

describe("useGithubFavorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty when localStorage has no entries", async () => {
    const { result } = renderHook(() => useGithubFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.favorites).toEqual([]);
  });

  it("hydrates from localStorage on mount", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "u1", type: "user", value: "facebook" },
        { id: "r1", type: "repo", value: "facebook/react" },
      ])
    );

    const { result } = renderHook(() => useGithubFavorites());
    await waitFor(() => expect(result.current.favorites).toHaveLength(2));
    expect(result.current.has("user", "facebook")).toBe(true);
    expect(result.current.has("repo", "facebook/react")).toBe(true);
  });

  it("ignores corrupt JSON in localStorage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    const { result } = renderHook(() => useGithubFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.favorites).toEqual([]);
  });

  it("adds user and repo favorites and persists to localStorage", async () => {
    const { result } = renderHook(() => useGithubFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.add("user", "facebook");
    });
    act(() => {
      result.current.add("repo", "facebook/react");
    });

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.has("user", "facebook")).toBe(true);
    expect(result.current.has("repo", "facebook/react")).toBe(true);

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(2);
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "user", value: "facebook" }),
        expect.objectContaining({ type: "repo", value: "facebook/react" }),
      ])
    );
  });

  it("does not add a duplicate favorite", async () => {
    const { result } = renderHook(() => useGithubFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.add("user", "facebook");
    });
    act(() => {
      result.current.add("user", "facebook");
    });

    expect(result.current.favorites).toHaveLength(1);
  });

  it("removes a favorite by id", async () => {
    const { result } = renderHook(() => useGithubFavorites());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.add("repo", "facebook/react");
    });
    const id = result.current.favorites[0].id;

    act(() => {
      result.current.remove(id);
    });

    expect(result.current.favorites).toEqual([]);
    expect(result.current.has("repo", "facebook/react")).toBe(false);
  });
});
