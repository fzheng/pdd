import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import PatternCanvas from "@/components/PatternCanvas";
import { patternFrom, WHITE, BLACK } from "../fixtures";

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

describe("PatternCanvas", () => {
  it("mounts a canvas element and fires onCellClick with (row, col, color)", () => {
    const pattern = patternFrom([[WHITE, BLACK]]);
    const onCellClick = vi.fn();
    const { container } = render(
      <PatternCanvas
        pattern={pattern}
        shape="circle"
        showLabels={false}
        editMode="brush"
        activeColor={null}
        onCellClick={onCellClick}
        maxCellSize={32}
      />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    Object.defineProperty(canvas!, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 100, height: 50 }),
      configurable: true,
    });
    Object.defineProperty(canvas!, "width", { value: 100, configurable: true });
    Object.defineProperty(canvas!, "height", { value: 50, configurable: true });
    fireEvent.click(canvas!, { clientX: 10, clientY: 10 });
    expect(onCellClick).toHaveBeenCalled();
  });

  it("does not fire onCellClick when editMode is 'none'", () => {
    const pattern = patternFrom([[WHITE, BLACK]]);
    const onCellClick = vi.fn();
    const { container } = render(
      <PatternCanvas
        pattern={pattern}
        shape="circle"
        showLabels={false}
        editMode="none"
        activeColor={null}
        onCellClick={onCellClick}
        maxCellSize={32}
      />,
    );
    const canvas = container.querySelector("canvas")!;
    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 100, height: 50 }),
      configurable: true,
    });
    Object.defineProperty(canvas, "width", { value: 100, configurable: true });
    Object.defineProperty(canvas, "height", { value: 50, configurable: true });
    fireEvent.click(canvas, { clientX: 10, clientY: 10 });
    expect(onCellClick).not.toHaveBeenCalled();
  });
});
