import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import BeadSidebar from "@/components/BeadSidebar";
import { patternFrom, WHITE, BLACK, RED } from "../fixtures";
import { renderWithI18n } from "../helpers";

function base(pattern = patternFrom([[WHITE, BLACK, RED]])) {
  return {
    pattern,
    mode: "none" as const,
    onModeChange: vi.fn(),
    activeColor: null,
    onPickColor: vi.fn(),
    canUndo: false,
    canRedo: false,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
  };
}

describe("BeadSidebar", () => {
  it("renders nothing when no pattern is available", () => {
    const { container } = renderWithI18n(
      <BeadSidebar {...base()} pattern={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("defaults to collapsed — only the expand handle is interactive", () => {
    renderWithI18n(
      <BeadSidebar {...base(patternFrom([[WHITE, WHITE, BLACK]]))} />,
    );
    // Drawer is rendered but hidden from interactions (translate-x-full +
    // pointer-events-none). The expand handle sits alongside it.
    const handle = screen.getByLabelText(/expand|展开|展開/i);
    expect(handle).toBeInTheDocument();
  });

  it("opens the drawer and reveals the color list", () => {
    renderWithI18n(<BeadSidebar {...base(patternFrom([[WHITE, BLACK]]))} />);
    fireEvent.click(screen.getByLabelText(/expand|展开|展開/i));
    // Both colors appear once the drawer opens
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("BK")).toBeInTheDocument();
  });

  it("enters brush mode when the brush tool is clicked", () => {
    const props = base();
    renderWithI18n(<BeadSidebar {...props} />);
    fireEvent.click(screen.getByLabelText(/expand|展开|展開/i));
    fireEvent.click(screen.getByText(/🖌️/).closest("button")!);
    expect(props.onModeChange).toHaveBeenCalledWith("brush");
  });

  it("clicking a color row while in brush mode picks the active color", () => {
    const props = base();
    const { rerender } = renderWithI18n(
      <BeadSidebar {...props} mode="brush" />,
    );
    fireEvent.click(screen.getByLabelText(/expand|展开|展開/i));
    const firstRow = document.querySelector("tbody tr") as HTMLElement;
    fireEvent.click(firstRow);
    expect(props.onPickColor).toHaveBeenCalled();

    // In "none" mode the rows must not be clickable
    props.onPickColor.mockClear();
    rerender(<BeadSidebar {...props} mode="none" />);
    fireEvent.click(document.querySelector("tbody tr") as HTMLElement);
    expect(props.onPickColor).not.toHaveBeenCalled();
  });

  it("closes when the × button is pressed", () => {
    renderWithI18n(<BeadSidebar {...base()} />);
    fireEvent.click(screen.getByLabelText(/expand|展开|展開/i));
    fireEvent.click(screen.getByLabelText(/collapse|折叠|收合/i));
    // After closing, the expand handle is visible again
    expect(screen.getByLabelText(/expand|展开|展開/i)).toBeInTheDocument();
  });

  it("closes when ESC is pressed", () => {
    renderWithI18n(<BeadSidebar {...base()} />);
    fireEvent.click(screen.getByLabelText(/expand|展开|展開/i));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByLabelText(/expand|展开|展開/i)).toBeInTheDocument();
  });
});
