import { copyHtmlToClipboard } from "../clipboard";

// ClipboardItem is not available in jsdom
class MockClipboardItem {
  readonly types: string[];
  private items: Record<string, Blob>;

  constructor(items: Record<string, Blob>) {
    this.items = items;
    this.types = Object.keys(items);
  }

  async getType(type: string): Promise<Blob> {
    return this.items[type];
  }
}

describe("copyHtmlToClipboard", () => {
  const mockWrite = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    globalThis.ClipboardItem =
      MockClipboardItem as unknown as typeof ClipboardItem;
    Object.defineProperty(navigator, "clipboard", {
      value: { write: mockWrite },
      writable: true,
      configurable: true,
    });
  });

  it("writes HTML and plain text to clipboard", async () => {
    mockWrite.mockResolvedValue(undefined);

    const result = await copyHtmlToClipboard("<p>Hello</p>", "Hello");

    expect(result).toBe(true);
    expect(mockWrite).toHaveBeenCalledTimes(1);

    const clipboardItems = mockWrite.mock.calls[0][0];
    expect(clipboardItems).toHaveLength(1);
    expect(clipboardItems[0]).toBeInstanceOf(MockClipboardItem);
    expect(clipboardItems[0].types).toContain("text/html");
    expect(clipboardItems[0].types).toContain("text/plain");
  });

  it("returns false when clipboard write fails", async () => {
    mockWrite.mockRejectedValue(new Error("Permission denied"));

    const result = await copyHtmlToClipboard("<p>Hello</p>", "Hello");

    expect(result).toBe(false);
  });
});
