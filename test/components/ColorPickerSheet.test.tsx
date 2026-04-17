import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ColorPickerSheet from "@/components/ColorPickerSheet";
import { patternFrom, WHITE, BLACK, RED } from "../fixtures";
import { renderWithI18n } from "../helpers";

function base(
  overrides: Partial<React.ComponentProps<typeof ColorPickerSheet>> = {},
) {
  const pattern = patternFrom([[WHITE, BLACK, RED]]);
  return {
    open: true,
    pattern,
    activeColor: null,
    onPick: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

describe("ColorPickerSheet", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithI18n(
      <ColorPickerSheet {...base({ open: false })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a tile per color in the pattern when open", () => {
    renderWithI18n(<ColorPickerSheet {...base()} />);
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("BK")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
  });

  it("fires onPick with the tapped color", () => {
    const onPick = vi.fn();
    renderWithI18n(<ColorPickerSheet {...base({ onPick })} />);
    fireEvent.click(screen.getByText("W").closest("button")!);
    expect(onPick).toHaveBeenCalledWith(WHITE);
  });

  it("fires onClose when Esc is pressed", () => {
    const onClose = vi.fn();
    renderWithI18n(<ColorPickerSheet {...base({ onClose })} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("fires onClose when the X button is pressed", () => {
    const onClose = vi.fn();
    renderWithI18n(<ColorPickerSheet {...base({ onClose })} />);
    fireEvent.click(screen.getByLabelText(/close|关闭|關閉/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("marks the active color tile", () => {
    const { container } = renderWithI18n(
      <ColorPickerSheet {...base({ activeColor: WHITE })} />,
    );
    const activeTiles = container.querySelectorAll('[data-active="true"]');
    expect(activeTiles.length).toBe(1);
  });
});
