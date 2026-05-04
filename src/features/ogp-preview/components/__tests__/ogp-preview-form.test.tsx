import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OgpPreviewForm } from "../ogp-preview-form";

describe("OgpPreviewForm", () => {
  it("disables submit when URL is empty", () => {
    render(
      <OgpPreviewForm url="" isLoading={false} onUrlChange={() => {}} onSubmit={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "解析する" })).toBeDisabled();
  });

  it("disables submit and shows loading label while loading", () => {
    render(
      <OgpPreviewForm
        url="https://example.com"
        isLoading={true}
        onUrlChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "解析中…" })).toBeDisabled();
  });

  it("calls onSubmit when the user submits a valid URL", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <OgpPreviewForm
        url="https://example.com"
        isLoading={false}
        onUrlChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "解析する" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not call onSubmit when URL is whitespace only", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <OgpPreviewForm
        url="   "
        isLoading={false}
        onUrlChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    const button = screen.getByRole("button", { name: "解析する" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("emits typed input via onUrlChange", async () => {
    const user = userEvent.setup();
    const onUrlChange = jest.fn();
    render(
      <OgpPreviewForm
        url=""
        isLoading={false}
        onUrlChange={onUrlChange}
        onSubmit={() => {}}
      />,
    );
    const input = screen.getByLabelText("URL");
    await user.type(input, "h");
    expect(onUrlChange).toHaveBeenCalledWith("h");
  });
});
