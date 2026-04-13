"use client";

import { PipelineSettings, ColorMatchAlgorithm } from "@/types";
import { perlerPalette } from "@/data/perlerPalette";
import { hamaPalette } from "@/data/hamaPalette";

const palettes = [perlerPalette, hamaPalette];

interface ControlPanelProps {
  settings: PipelineSettings;
  onSettingsChange: (settings: PipelineSettings) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  hasImage: boolean;
}

export default function ControlPanel({
  settings,
  onSettingsChange,
  onGenerate,
  isProcessing,
  hasImage,
}: ControlPanelProps) {
  function update(partial: Partial<PipelineSettings>) {
    onSettingsChange({ ...settings, ...partial });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-end gap-4">
      <div className="flex gap-2 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Width</label>
          <input
            type="number"
            min={5}
            max={200}
            value={settings.gridWidth}
            onChange={(e) => update({ gridWidth: Math.max(5, Math.min(200, parseInt(e.target.value) || 5)) })}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
        <span className="text-gray-400 pb-1.5">x</span>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Height</label>
          <input
            type="number"
            min={5}
            max={200}
            value={settings.gridHeight}
            onChange={(e) => update({ gridHeight: Math.max(5, Math.min(200, parseInt(e.target.value) || 5)) })}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Palette</label>
        <select
          value={settings.palette.brand}
          onChange={(e) => {
            const p = palettes.find((p) => p.brand === e.target.value) ?? perlerPalette;
            update({ palette: p });
          }}
          className="px-2 py-1.5 border border-gray-300 rounded text-sm"
        >
          {palettes.map((p) => (
            <option key={p.brand} value={p.brand}>
              {p.brand} ({p.colors.length} colors)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Algorithm</label>
        <select
          value={settings.algorithm}
          onChange={(e) => update({ algorithm: e.target.value as ColorMatchAlgorithm })}
          className="px-2 py-1.5 border border-gray-300 rounded text-sm"
        >
          <option value="rgb-euclidean">RGB Euclidean (fast)</option>
          <option value="cielab-euclidean">CIELAB Euclidean (accurate)</option>
        </select>
      </div>

      <label className="flex items-center gap-2 pb-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.ditheringEnabled}
          onChange={(e) => update({ ditheringEnabled: e.target.checked })}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Dithering</span>
      </label>

      <button
        onClick={onGenerate}
        disabled={!hasImage || isProcessing}
        className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? "Generating..." : "Generate Pattern"}
      </button>
    </div>
  );
}
