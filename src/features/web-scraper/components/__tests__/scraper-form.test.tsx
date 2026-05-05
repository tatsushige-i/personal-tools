import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScraperForm } from "../scraper-form";
import type { ScraperSelectorInput } from "@/features/web-scraper/lib/types";

const oneSelector: ScraperSelectorInput[] = [{ name: "", selector: "" }];

describe("ScraperForm", () => {
  it("disables submit when URL is empty", () => {
    render(
      <ScraperForm
        url=""
        selectors={[{ name: "", selector: "h1" }]}
        isLoading={false}
        onUrlChange={() => {}}
        onSelectorsChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "抽出する" })).toBeDisabled();
  });

  it("disables submit when no selector has been entered", () => {
    render(
      <ScraperForm
        url="https://example.com"
        selectors={oneSelector}
        isLoading={false}
        onUrlChange={() => {}}
        onSelectorsChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "抽出する" })).toBeDisabled();
  });

  it("disables submit and shows loading label while loading", () => {
    render(
      <ScraperForm
        url="https://example.com"
        selectors={[{ name: "", selector: "h1" }]}
        isLoading={true}
        onUrlChange={() => {}}
        onSelectorsChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "抽出中…" })).toBeDisabled();
  });

  it("calls onSubmit when URL and at least one selector are present", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <ScraperForm
        url="https://example.com"
        selectors={[{ name: "", selector: "h1" }]}
        isLoading={false}
        onUrlChange={() => {}}
        onSelectorsChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "抽出する" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("appends a new selector row when 「セレクタを追加」 is clicked", async () => {
    const user = userEvent.setup();
    const onSelectorsChange = jest.fn();
    render(
      <ScraperForm
        url=""
        selectors={oneSelector}
        isLoading={false}
        onUrlChange={() => {}}
        onSelectorsChange={onSelectorsChange}
        onSubmit={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: /セレクタを追加/ }));
    expect(onSelectorsChange).toHaveBeenCalledWith([
      { name: "", selector: "" },
      { name: "", selector: "" },
    ]);
  });

  it("removes a row when its delete button is clicked, but not the last remaining row", async () => {
    const user = userEvent.setup();
    const onSelectorsChange = jest.fn();
    const { rerender } = render(
      <ScraperForm
        url=""
        selectors={[
          { name: "a", selector: "h1" },
          { name: "b", selector: "p" },
        ]}
        isLoading={false}
        onUrlChange={() => {}}
        onSelectorsChange={onSelectorsChange}
        onSubmit={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "セレクタ 2 を削除" }));
    expect(onSelectorsChange).toHaveBeenCalledWith([{ name: "a", selector: "h1" }]);

    rerender(
      <ScraperForm
        url=""
        selectors={oneSelector}
        isLoading={false}
        onUrlChange={() => {}}
        onSelectorsChange={onSelectorsChange}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "セレクタ 1 を削除" })).toBeDisabled();
  });

  it("emits selector changes via onSelectorsChange when typing into a selector input", async () => {
    const user = userEvent.setup();
    const onSelectorsChange = jest.fn();
    render(
      <ScraperForm
        url=""
        selectors={oneSelector}
        isLoading={false}
        onUrlChange={() => {}}
        onSelectorsChange={onSelectorsChange}
        onSubmit={() => {}}
      />,
    );
    const selectorInput = screen.getByLabelText("CSS セレクタ 1");
    await user.type(selectorInput, "h");
    expect(onSelectorsChange).toHaveBeenLastCalledWith([{ name: "", selector: "h" }]);
  });
});
