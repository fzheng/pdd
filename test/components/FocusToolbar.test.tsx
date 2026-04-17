import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import FocusToolbar from "@/components/FocusToolbar";
import { WHITE } from "../fixtures";
import { renderWithI18n } from "../helpers";

function base(
  overrides: Partial<React.ComponentProps<typeof FocusToolbar>> = {},
) {
  return {
    editMode: "none" as const,
    onEditModeChange: vi.fn(),
    shape: "circle" as const,
    onShapeChange: vi.fn(),
    showLabels: false,
    onShowLabelsChange: vi.fn(),
    canUndo: true,
    canRedo: true,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    activeColor: null,
    onOpenColorPicker: vi.fn(),
    ...overrides,
  };
}

describe("FocusToolbar", () => {
  it("tapping brush fires onEditModeChange('brush')", () => {
    const onEditModeChange = vi.fn();
    renderWithI18n(<FocusToolbar {...base({ onEditModeChange })} />);
    fireEvent.click(screen.getByLabelText(/brush|画笔|畫筆/i));
    expect(onEditModeChange).toHaveBeenCalledWith("brush");
  });

  it("tapping brush again (while active) fires onEditModeChange('none')", () => {
    const onEditModeChange = vi.fn();
    renderWithI18n(
      <FocusToolbar {...base({ editMode: "brush", onEditModeChange })} />,
    );
    fireEvent.click(screen.getByLabelText(/brush|画笔|畫筆/i));
    expect(onEditModeChange).toHaveBeenCalledWith("none");
  });

  it("tapping shape toggles fire onShapeChange", () => {
    const onShapeChange = vi.fn();
    renderWithI18n(<FocusToolbar {...base({ onShapeChange })} />);
    fireEvent.click(screen.getByLabelText(/square|方格/i));
    expect(onShapeChange).toHaveBeenCalledWith("square");
  });

  it("labels checkbox fires onShowLabelsChange", () => {
    const onShowLabelsChange = vi.fn();
    renderWithI18n(<FocusToolbar {...base({ onShowLabelsChange })} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onShowLabelsChange).toHaveBeenCalledWith(true);
  });

  it("undo/redo fire their callbacks; disabled state disables them", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    renderWithI18n(
      <FocusToolbar
        {...base({ onUndo, onRedo, canUndo: false, canRedo: true })}
      />,
    );
    fireEvent.click(screen.getByLabelText(/undo|撤销|復原/i));
    expect(onUndo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(/redo|重做/i));
    expect(onRedo).toHaveBeenCalled();
  });

  it("tapping the active-color chip fires onOpenColorPicker", () => {
    const onOpenColorPicker = vi.fn();
    renderWithI18n(
      <FocusToolbar {...base({ activeColor: WHITE, onOpenColorPicker })} />,
    );
    fireEvent.click(screen.getByLabelText(/pick a color|选择颜色|選擇顏色/i));
    expect(onOpenColorPicker).toHaveBeenCalled();
  });
});
