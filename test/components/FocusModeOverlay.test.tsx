import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import FocusModeOverlay from "@/components/FocusModeOverlay";
import { patternFrom, WHITE, BLACK } from "../fixtures";
import { renderWithI18n } from "../helpers";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    strokeStyle: "",
    lineWidth: 1,
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    font: "",
    textAlign: "",
    textBaseline: "",
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

function base(
  overrides: Partial<React.ComponentProps<typeof FocusModeOverlay>> = {},
) {
  const pattern = patternFrom([[WHITE, BLACK]]);
  return {
    open: true,
    pattern,
    editMode: "none" as const,
    onEditModeChange: vi.fn(),
    activeColor: null,
    onPickColor: vi.fn(),
    onCellClick: vi.fn(),
    shape: "circle" as const,
    onShapeChange: vi.fn(),
    showLabels: false,
    onShowLabelsChange: vi.fn(),
    canUndo: true,
    canRedo: true,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onExit: vi.fn(),
    ...overrides,
  };
}

describe("FocusModeOverlay", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithI18n(
      <FocusModeOverlay {...base({ open: false })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a canvas when open", () => {
    const { container } = renderWithI18n(<FocusModeOverlay {...base()} />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("tapping the X button fires onExit", () => {
    const onExit = vi.fn();
    renderWithI18n(<FocusModeOverlay {...base({ onExit })} />);
    fireEvent.click(screen.getByLabelText(/exit focus|退出专注|退出專注/i));
    expect(onExit).toHaveBeenCalled();
  });

  it("pressing Esc fires onExit when the color picker is not open", () => {
    const onExit = vi.fn();
    renderWithI18n(<FocusModeOverlay {...base({ onExit })} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onExit).toHaveBeenCalled();
  });

  it("opens the color picker when the active-color chip is tapped", () => {
    renderWithI18n(<FocusModeOverlay {...base()} />);
    fireEvent.click(screen.getByLabelText(/pick a color|选择颜色|選擇顏色/i));
    expect(
      screen.getByRole("dialog", {
        name: /pick a color|选择颜色|選擇顏色/i,
      }),
    ).toBeInTheDocument();
  });

  it("picking a color fires onPickColor and closes the sheet", () => {
    const onPickColor = vi.fn();
    renderWithI18n(<FocusModeOverlay {...base({ onPickColor })} />);
    fireEvent.click(screen.getByLabelText(/pick a color|选择颜色|選擇顏色/i));
    fireEvent.click(screen.getByText("W").closest("button")!);
    expect(onPickColor).toHaveBeenCalledWith(WHITE);
    expect(
      screen.queryByRole("dialog", {
        name: /pick a color|选择颜色|選擇顏色/i,
      }),
    ).toBeNull();
  });

  it("locks body scroll while open and restores on close", () => {
    const originalOverflow = document.body.style.overflow;
    const { rerender } = renderWithI18n(<FocusModeOverlay {...base()} />);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<FocusModeOverlay {...base({ open: false })} />);
    expect(document.body.style.overflow).toBe(originalOverflow);
  });
});
