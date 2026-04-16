import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import EditorToolbar from "@/components/EditorToolbar";
import { renderWithI18n } from "../helpers";

function base() {
  return {
    mode: "none" as const,
    onModeChange: vi.fn(),
    activeColor: null,
    canUndo: false,
    canRedo: false,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
  };
}

describe("EditorToolbar (legacy layout)", () => {
  it("renders brush and replace tools", () => {
    renderWithI18n(<EditorToolbar {...base()} />);
    expect(screen.getByText(/🖌️/)).toBeInTheDocument();
    expect(screen.getByText(/🎯/)).toBeInTheDocument();
  });

  it("toggling brush dispatches onModeChange('brush')", () => {
    const props = base();
    renderWithI18n(<EditorToolbar {...props} />);
    fireEvent.click(screen.getByText(/🖌️/).closest("button")!);
    expect(props.onModeChange).toHaveBeenCalledWith("brush");
  });

  it("disables undo/redo unless allowed", () => {
    renderWithI18n(<EditorToolbar {...base()} />);
    const buttons = screen.getAllByRole("button");
    const undo = buttons.find((b) => b.textContent?.match(/↶/))!;
    const redo = buttons.find((b) => b.textContent?.match(/↷/))!;
    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();
  });
});
