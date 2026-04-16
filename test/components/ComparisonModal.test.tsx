import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ComparisonModal from "@/components/ComparisonModal";
import { patternFrom, WHITE, BLACK } from "../fixtures";
import { renderWithI18n } from "../helpers";

beforeEach(() => {
  // jsdom's canvas is a stub — give it enough of a 2D context for the
  // internal render loop not to throw.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeRect: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
    font: "",
    textAlign: "",
    textBaseline: "",
  } as unknown as CanvasRenderingContext2D);
});

describe("ComparisonModal", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithI18n(
      <ComparisonModal
        imageUrl="blob:x"
        pattern={patternFrom([[WHITE]])}
        open={false}
        onClose={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when open but without required inputs", () => {
    const { container } = renderWithI18n(
      <ComparisonModal
        imageUrl={null}
        pattern={null}
        open
        onClose={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClose when the X button is clicked", () => {
    const onClose = vi.fn();
    renderWithI18n(
      <ComparisonModal
        imageUrl="blob:x"
        pattern={patternFrom([[WHITE, BLACK]])}
        open
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByLabelText(/close|关闭|關閉/i));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when ESC is pressed", () => {
    const onClose = vi.fn();
    renderWithI18n(
      <ComparisonModal
        imageUrl="blob:x"
        pattern={patternFrom([[WHITE, BLACK]])}
        open
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
