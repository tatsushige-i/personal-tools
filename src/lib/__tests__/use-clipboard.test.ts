import { act, renderHook } from "@testing-library/react";

import { useClipboard } from "../use-clipboard";

const writeTextMock = jest.fn().mockResolvedValue(undefined);

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: { writeText: writeTextMock },
  });
});

beforeEach(() => {
  jest.useFakeTimers();
  writeTextMock.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useClipboard", () => {
  it("initially returns isCopied as false", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedValue).toBeNull();
  });

  it("sets isCopied to true after copy", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(writeTextMock).toHaveBeenCalledWith("hello");
    expect(result.current.isCopied).toBe(true);
    expect(result.current.copiedValue).toBe("hello");
  });

  it("resets isCopied after default timeout (2000ms)", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedValue).toBeNull();
  });

  it("supports custom timeout", async () => {
    const { result } = renderHook(() => useClipboard(1000));

    await act(async () => {
      await result.current.copy("hello");
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it("clears previous timer on consecutive copies", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("first");
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current.isCopied).toBe(true);

    await act(async () => {
      await result.current.copy("second");
    });

    expect(result.current.copiedValue).toBe("second");

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current.isCopied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it("handles clipboard API failure silently", async () => {
    writeTextMock.mockRejectedValueOnce(new Error("Not allowed"));

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(result.current.isCopied).toBe(false);
  });

  it("markCopied sets isCopied without clipboard write", () => {
    const { result } = renderHook(() => useClipboard());

    act(() => {
      result.current.markCopied();
    });

    expect(result.current.isCopied).toBe(true);
    expect(writeTextMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.isCopied).toBe(false);
  });
});
