import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import BeadPattern from "@/components/BeadPattern";
import { patternFrom, WHITE, BLACK, RED } from "../fixtures";
import { renderWithI18n } from "../helpers";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    strokeStyle: "",
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    font: "",
    textAlign: "",
    textBaseline: "",
    lineWidth: 0,
  } as unknown as CanvasRenderingContext2D);

  // Give the canvas deterministic bounds for the hit-test math.
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    value: 320,
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      width: 320,
      height: 320,
      right: 320,
      bottom: 320,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
});

describe("BeadPattern", () => {
  it("renders the empty-state when no pattern is given", () => {
    renderWithI18n(<BeadPattern pattern={null} />);
    expect(screen.getByText(/appear here|这里|這裡/i)).toBeInTheDocument();
  });

  it("renders a canvas when a pattern is supplied", () => {
    const { container } = renderWithI18n(
      <BeadPattern pattern={patternFrom([[WHITE, BLACK, RED]])} />,
    );
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("click fires onCellClick with the cell's existing color", () => {
    const onCellClick = vi.fn();
    const { container } = renderWithI18n(
      <BeadPattern
        pattern={patternFrom([
          [WHITE, BLACK, RED],
          [RED, WHITE, BLACK],
        ])}
        editMode="brush"
        activeColor={BLACK}
        onCellClick={onCellClick}
      />,
    );
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    // Click top-left corner — guaranteed to hit cell (0, 0).
    fireEvent.click(canvas, { clientX: 2, clientY: 2 });
    expect(onCellClick).toHaveBeenCalled();
    const [row, col, color] = onCellClick.mock.calls[0];
    expect(row).toBe(0);
    expect(col).toBe(0);
    expect(color.id).toBe("w");
  });

  it("hovering sets a tooltip that shows the bead's SKU", () => {
    const { container } = renderWithI18n(
      <BeadPattern pattern={patternFrom([[WHITE, RED]])} />,
    );
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    // Top-left — definitely inside cell (0, 0) which is WHITE (sku "W")
    fireEvent.mouseMove(canvas, { clientX: 1, clientY: 1 });
    const tooltip = container.querySelector(".pointer-events-none.absolute");
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain("W");
  });

  it("mouse leaving hides the tooltip", () => {
    const { container } = renderWithI18n(
      <BeadPattern pattern={patternFrom([[WHITE, RED]])} />,
    );
    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    fireEvent.mouseMove(canvas, { clientX: 1, clientY: 1 });
    fireEvent.mouseLeave(canvas);
    expect(container.querySelector(".pointer-events-none.absolute")).toBeNull();
  });
});
