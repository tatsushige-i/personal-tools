import { act, renderHook, waitFor } from "@testing-library/react";
import { useFavoritePairs } from "../use-favorite-pairs";

const STORAGE_KEY = "exchange-rate-calculator:favorite-pairs";

describe("useFavoritePairs", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty when localStorage has no entries", async () => {
    const { result } = renderHook(() => useFavoritePairs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.pairs).toEqual([]);
  });

  it("hydrates from localStorage on mount", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "abc", from: "USD", to: "JPY" }])
    );

    const { result } = renderHook(() => useFavoritePairs());
    await waitFor(() => expect(result.current.pairs).toHaveLength(1));
    expect(result.current.pairs[0]).toEqual({ id: "abc", from: "USD", to: "JPY" });
    expect(result.current.has("USD", "JPY")).toBe(true);
  });

  it("ignores corrupt JSON in localStorage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    const { result } = renderHook(() => useFavoritePairs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.pairs).toEqual([]);
  });

  it("adds a new pair and persists to localStorage", async () => {
    const { result } = renderHook(() => useFavoritePairs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.add("USD", "JPY");
    });

    expect(result.current.pairs).toHaveLength(1);
    expect(result.current.pairs[0]).toMatchObject({ from: "USD", to: "JPY" });
    expect(result.current.has("USD", "JPY")).toBe(true);

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ from: "USD", to: "JPY" });
  });

  it("does not add a duplicate pair", async () => {
    const { result } = renderHook(() => useFavoritePairs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.add("USD", "JPY");
    });
    act(() => {
      result.current.add("USD", "JPY");
    });

    expect(result.current.pairs).toHaveLength(1);
  });

  it("removes a pair by id", async () => {
    const { result } = renderHook(() => useFavoritePairs());
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => {
      result.current.add("USD", "JPY");
    });
    const id = result.current.pairs[0].id;

    act(() => {
      result.current.remove(id);
    });

    expect(result.current.pairs).toEqual([]);
    expect(result.current.has("USD", "JPY")).toBe(false);
  });
});
