import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckerForm } from "../checker-form";

describe("CheckerForm", () => {
  it("disables submit when URL is empty", () => {
    render(
      <CheckerForm
        url=""
        depth={1}
        isLoading={false}
        onUrlChange={() => {}}
        onDepthChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "チェックする" })).toBeDisabled();
  });

  it("disables submit and shows loading label while loading", () => {
    render(
      <CheckerForm
        url="https://example.com"
        depth={1}
        isLoading={true}
        onUrlChange={() => {}}
        onDepthChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "チェック中…" })).toBeDisabled();
  });

  it("calls onSubmit when the user submits a valid URL", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <CheckerForm
        url="https://example.com"
        depth={1}
        isLoading={false}
        onUrlChange={() => {}}
        onDepthChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    await user.click(screen.getByRole("button", { name: "チェックする" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not call onSubmit when URL is whitespace only", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <CheckerForm
        url="   "
        depth={1}
        isLoading={false}
        onUrlChange={() => {}}
        onDepthChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    const button = screen.getByRole("button", { name: "チェックする" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("emits typed input via onUrlChange", async () => {
    const user = userEvent.setup();
    const onUrlChange = jest.fn();
    render(
      <CheckerForm
        url=""
        depth={1}
        isLoading={false}
        onUrlChange={onUrlChange}
        onDepthChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    const input = screen.getByLabelText("URL");
    await user.type(input, "h");
    expect(onUrlChange).toHaveBeenCalledWith("h");
  });
});
