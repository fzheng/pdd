import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ExportPanel from "@/components/ExportPanel";
import { patternFrom, WHITE, BLACK } from "../fixtures";
import { renderWithI18n } from "../helpers";

// Mock the heavy file-producing export helpers so these stay fast and
// don't actually trigger a download in jsdom.
vi.mock("@/lib/exportPng", () => ({ exportPatternAsPng: vi.fn() }));
vi.mock("@/lib/exportPdf", () => ({
  exportPatternAsPdf: vi.fn(),
}));

import { exportPatternAsPng } from "@/lib/exportPng";
import { exportPatternAsPdf } from "@/lib/exportPdf";

describe("ExportPanel", () => {
  it("renders nothing when no pattern exists", () => {
    const { container } = renderWithI18n(<ExportPanel pattern={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("the cell-size slider is hidden unless split-by-pegboard is checked", () => {
    renderWithI18n(<ExportPanel pattern={patternFrom([[WHITE, BLACK]])} />);
    expect(screen.queryByText(/mm per bead|毫米|mm 每豆|mm\/豆/i)).toBeNull();
    // Split-by-pegboard is the SECOND checkbox (show-codes is first)
    const toggles = screen.getAllByRole("checkbox");
    fireEvent.click(toggles[1]);
    expect(
      screen.getByText(/mm per bead|毫米|mm 每豆|每格毫米数|每格毫米數/i),
    ).toBeInTheDocument();
  });

  it("exports PNG on click", () => {
    renderWithI18n(<ExportPanel pattern={patternFrom([[WHITE]])} />);
    fireEvent.click(screen.getByText(/png/i));
    expect(exportPatternAsPng).toHaveBeenCalled();
  });

  it("default PDF export passes showColorCodes=true and a nameForColor localizer", async () => {
    renderWithI18n(<ExportPanel pattern={patternFrom([[WHITE, BLACK]])} />);
    fireEvent.click(screen.getByText(/pdf/i));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(exportPatternAsPdf).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        showColorCodes: true,
        nameForColor: expect.any(Function),
      }),
    );
  });

  it("un-checking 'show codes' flips showColorCodes to false", async () => {
    renderWithI18n(<ExportPanel pattern={patternFrom([[WHITE, BLACK]])} />);
    // Show-codes is the first checkbox
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByText(/pdf/i));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(exportPatternAsPdf).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ showColorCodes: false }),
    );
  });

  it("passes splitByPegboard through to the PDF exporter", async () => {
    renderWithI18n(<ExportPanel pattern={patternFrom([[WHITE, BLACK]])} />);

    // Default — off
    fireEvent.click(screen.getByText(/pdf/i));
    // requestAnimationFrame deferred: flush
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(exportPatternAsPdf).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ splitByPegboard: false }),
    );

    // Toggle the split-by-pegboard checkbox (index 1; index 0 is show-codes)
    (exportPatternAsPdf as unknown as ReturnType<typeof vi.fn>).mockClear();
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    fireEvent.click(screen.getByText(/pdf/i));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(exportPatternAsPdf).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ splitByPegboard: true }),
    );
  });
});
