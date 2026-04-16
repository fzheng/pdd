import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ControlPanel from "@/components/ControlPanel";
import { PipelineSettings } from "@/types";
import { perlerPalette } from "@/data/perlerPalette";
import { renderWithI18n } from "../helpers";

function baseSettings(): PipelineSettings {
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

describe("ControlPanel", () => {
  it("renders a single square-size label (no width/height pair)", () => {
    renderWithI18n(
      <ControlPanel settings={baseSettings()} onSettingsChange={vi.fn()} />,
    );
    expect(screen.getByText(/58\s*×\s*58/)).toBeInTheDocument();
  });

  it("emits a new gridSize when the slider moves", () => {
    const onSettingsChange = vi.fn();
    const { container } = renderWithI18n(
      <ControlPanel settings={baseSettings()} onSettingsChange={onSettingsChange} />,
    );
    const slider = container.querySelector("input[type='range']") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "100" } });
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ gridSize: 100 }),
    );
  });

  it("has no generate button — pattern auto-regens on settings change", () => {
    renderWithI18n(
      <ControlPanel settings={baseSettings()} onSettingsChange={vi.fn()} />,
    );
    const buttons = screen.getAllByRole("button");
    const buttonTexts = buttons.map((b) => b.textContent ?? "");
    expect(buttonTexts.some((t) => t.match(/make pattern|生成图纸|產生圖紙/i))).toBe(false);
  });

  it("advanced settings are hidden until toggled", () => {
    renderWithI18n(
      <ControlPanel settings={baseSettings()} onSettingsChange={vi.fn()} />,
    );
    expect(screen.queryByText(/mirror|镜像|鏡像/i)).toBeNull();
    fireEvent.click(screen.getByText(/advanced|高级|進階/i));
    expect(screen.getByText(/mirror|镜像|鏡像/i)).toBeInTheDocument();
  });

  it("mirror checkbox (inside Advanced) toggles settings.mirror", () => {
    const onSettingsChange = vi.fn();
    renderWithI18n(
      <ControlPanel settings={baseSettings()} onSettingsChange={onSettingsChange} />,
    );
    fireEvent.click(screen.getByText(/advanced|高级|進階/i));
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ mirror: true }),
    );
  });

  // swap-image tests moved to ImagePreview.test.tsx (the button lives there now)
});
