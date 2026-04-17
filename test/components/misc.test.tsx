import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, render } from "@testing-library/react";
import ControlPanel from "@/components/ControlPanel";
import ImageUploader from "@/components/ImageUploader";
import ExportPanel from "@/components/ExportPanel";
import BeadPattern from "@/components/BeadPattern";
import { PipelineSettings } from "@/types";
import { allPalettes } from "@/data/palettes";
import { perlerPalette } from "@/data/perlerPalette";
import { patternFrom, WHITE, BLACK } from "../fixtures";
import { renderWithI18n } from "../helpers";
import { useI18n } from "@/i18n/I18nProvider";

// Additional coverage tests that exercise edge cases left out of the
// component-focused suites.

function base(): PipelineSettings {
  return {
    gridSize: 58,
    palette: perlerPalette,
    algorithm: "ciede2000",
    dithering: "none",
    maxColors: 0,
    mirror: false,
    saturation: 1.05,
    despeckle: 6,
  };
}

function stubCanvas() {
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
}

describe("ControlPanel — all selectors", () => {
  function cp(overrides: Partial<PipelineSettings> = {}) {
    return {
      settings: { ...base(), ...overrides },
      onSettingsChange: vi.fn(),
      onImageSelected: vi.fn(),
    };
  }

  it("changes palette via the brand dropdown (primary row)", () => {
    const props = cp();
    renderWithI18n(<ControlPanel {...props} />);
    const paletteSelect = screen.getByRole("combobox");
    const other = allPalettes.find((p) => p.brand !== perlerPalette.brand)!;
    fireEvent.change(paletteSelect, { target: { value: other.brand } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        palette: expect.objectContaining({ brand: other.brand }),
      }),
    );
  });

  it("Advanced selects — algorithm / dithering / maxColors", () => {
    const props = cp();
    renderWithI18n(<ControlPanel {...props} />);
    fireEvent.click(screen.getByText(/advanced|高级|進階/i));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "24" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ maxColors: 24 }),
    );
    fireEvent.change(selects[2], { target: { value: "rgb-euclidean" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ algorithm: "rgb-euclidean" }),
    );
    fireEvent.change(selects[3], { target: { value: "floyd-steinberg" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ dithering: "floyd-steinberg" }),
    );
  });

  it("adjusts saturation and despeckle via range sliders (Advanced)", () => {
    const props = cp();
    const { container } = renderWithI18n(<ControlPanel {...props} />);
    fireEvent.click(screen.getByText(/advanced|高级|進階/i));
    const ranges = container.querySelectorAll("input[type='range']");
    fireEvent.change(ranges[1], { target: { value: "1.3" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ saturation: 1.3 }),
    );
    fireEvent.change(ranges[2], { target: { value: "12" } });
    expect(props.onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ despeckle: 12 }),
    );
  });

  it("shows 'off' when despeckle is 0 (once Advanced is open)", () => {
    renderWithI18n(<ControlPanel {...cp({ despeckle: 0 })} />);
    fireEvent.click(screen.getByText(/advanced|高级|進階/i));
    expect(screen.getByText("off")).toBeInTheDocument();
  });
});

describe("ImageUploader drag states", () => {
  it("dragover and dragleave toggle the visual state without throwing", () => {
    const { container } = renderWithI18n(
      <ImageUploader onImageSelected={vi.fn()} />,
    );
    const zone = container.firstChild as HTMLElement;
    fireEvent.dragOver(zone, { dataTransfer: { files: [] } });
    fireEvent.dragLeave(zone, { dataTransfer: { files: [] } });
    expect(zone).toBeInTheDocument();
  });

  it("an empty drop is ignored", () => {
    const onImageSelected = vi.fn();
    const { container } = renderWithI18n(
      <ImageUploader onImageSelected={onImageSelected} />,
    );
    const zone = container.firstChild as HTMLElement;
    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    expect(onImageSelected).not.toHaveBeenCalled();
  });
});

describe("ExportPanel cell-size slider", () => {
  it("updates when the range is moved", () => {
    const { container } = renderWithI18n(
      <ExportPanel pattern={patternFrom([[WHITE, BLACK]])} />,
    );
    // Second checkbox is split-by-pegboard, which reveals the cell-size slider
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    const slider = container.querySelector("input[type='range']") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "7.5" } });
    expect(slider.value).toBe("7.5");
  });
});

describe("I18nProvider boundary", () => {
  function Boom() {
    useI18n();
    return null;
  }

  it("throws when useI18n is called outside the provider", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Boom />)).toThrow(/useI18n/);
    err.mockRestore();
  });
});

function LocaleReader() {
  const { locale, setLocale } = useI18n();
  return (
    <>
      <span data-testid="l">{locale}</span>
      <button onClick={() => setLocale("en")}>go-en</button>
    </>
  );
}

describe("I18nProvider locale persistence", () => {
  it("setLocale writes to localStorage and updates context", () => {
    renderWithI18n(<LocaleReader />);
    fireEvent.click(screen.getByText("go-en"));
    expect(screen.getByTestId("l").textContent).toBe("en");
    expect(window.localStorage.getItem("pdd.locale")).toBe("en");
  });
});

describe("BeadPattern UI controls", () => {
  beforeEach(() => {
    stubCanvas();
  });

  it("toggles between circle and square shapes", () => {
    const { container } = renderWithI18n(
      <BeadPattern pattern={patternFrom([[WHITE, BLACK]])} />,
    );
    const square = screen.getByTitle(/grid|方格|square/i);
    fireEvent.click(square);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("toggles the SKU-label checkbox", () => {
    renderWithI18n(<BeadPattern pattern={patternFrom([[WHITE, BLACK]])} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("renders the Focus button and fires onEnterFocus when clicked", () => {
    const onEnterFocus = vi.fn();
    renderWithI18n(
      <BeadPattern
        pattern={patternFrom([[WHITE, BLACK]])}
        onEnterFocus={onEnterFocus}
      />,
    );
    fireEvent.click(screen.getByLabelText(/^focus$|专注模式|專注模式/i));
    expect(onEnterFocus).toHaveBeenCalled();
  });

  it("does not render the Focus button when onEnterFocus is not provided", () => {
    renderWithI18n(<BeadPattern pattern={patternFrom([[WHITE, BLACK]])} />);
    expect(screen.queryByLabelText(/^focus$|专注模式|專注模式/i)).toBeNull();
  });
});
