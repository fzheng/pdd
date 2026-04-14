"use client";

import { PipelineSettings, ColorMatchAlgorithm, DitheringMethod } from "@/types";
import { allPalettes } from "@/data/palettes";
import { useI18n } from "@/i18n/I18nProvider";

const MAX_COLOR_OPTIONS = [0, 16, 24, 36, 48, 72, 168];

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
  const { t } = useI18n();

  function update(partial: Partial<PipelineSettings>) {
    onSettingsChange({ ...settings, ...partial });
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-yellow-200 p-5 shadow-lg">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex gap-2 items-end">
          <Field label={t("controls.width")}>
            <input
              type="number"
              min={5}
              max={200}
              value={settings.gridWidth}
              onChange={(e) =>
                update({
                  gridWidth: Math.max(5, Math.min(200, parseInt(e.target.value) || 5)),
                })
              }
              className="w-20 px-3 py-1.5 border-2 border-yellow-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
            />
          </Field>
          <span className="text-pink-400 pb-2 text-lg">×</span>
          <Field label={t("controls.height")}>
            <input
              type="number"
              min={5}
              max={200}
              value={settings.gridHeight}
              onChange={(e) =>
                update({
                  gridHeight: Math.max(5, Math.min(200, parseInt(e.target.value) || 5)),
                })
              }
              className="w-20 px-3 py-1.5 border-2 border-yellow-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
            />
          </Field>
        </div>

        <Field label={t("controls.palette")}>
          <select
            value={settings.palette.brand}
            onChange={(e) => {
              const p = allPalettes.find((p) => p.brand === e.target.value) ?? allPalettes[0];
              update({ palette: p });
            }}
            className="px-3 py-1.5 border-2 border-yellow-200 rounded-xl text-sm bg-white focus:outline-none focus:border-pink-300"
          >
            {allPalettes.map((p) => (
              <option key={p.brand} value={p.brand}>
                {p.brand} ({p.colors.length})
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("controls.maxColors")}>
          <select
            value={settings.maxColors}
            onChange={(e) => update({ maxColors: parseInt(e.target.value) })}
            className="px-3 py-1.5 border-2 border-yellow-200 rounded-xl text-sm bg-white focus:outline-none focus:border-pink-300"
          >
            {MAX_COLOR_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 0 ? t("controls.maxColors.all") : t("controls.maxColors.n", { n })}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("controls.algorithm")}>
          <select
            value={settings.algorithm}
            onChange={(e) => update({ algorithm: e.target.value as ColorMatchAlgorithm })}
            className="px-3 py-1.5 border-2 border-yellow-200 rounded-xl text-sm bg-white focus:outline-none focus:border-pink-300"
          >
            <option value="rgb-euclidean">{t("controls.algorithm.rgb")}</option>
            <option value="cielab-euclidean">{t("controls.algorithm.cielab")}</option>
            <option value="ciede2000">{t("controls.algorithm.ciede2000")}</option>
          </select>
        </Field>

        <Field label={t("controls.dithering")}>
          <select
            value={settings.dithering}
            onChange={(e) => update({ dithering: e.target.value as DitheringMethod })}
            className="px-3 py-1.5 border-2 border-yellow-200 rounded-xl text-sm bg-white focus:outline-none focus:border-pink-300"
          >
            <option value="none">{t("controls.dithering.none")}</option>
            <option value="floyd-steinberg">{t("controls.dithering.fs")}</option>
            <option value="atkinson">{t("controls.dithering.atkinson")}</option>
            <option value="stucki">{t("controls.dithering.stucki")}</option>
            <option value="burkes">{t("controls.dithering.burkes")}</option>
            <option value="sierra">{t("controls.dithering.sierra")}</option>
          </select>
        </Field>

        <Field label={t("controls.saturation")}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0.5}
              max={1.6}
              step={0.05}
              value={settings.saturation}
              onChange={(e) => update({ saturation: parseFloat(e.target.value) })}
              className="w-24 accent-pink-400"
            />
            <span className="text-xs font-mono text-gray-500 w-8">
              {settings.saturation.toFixed(2)}
            </span>
          </div>
        </Field>

        <Field label={t("controls.despeckle")}>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={settings.despeckle}
              onChange={(e) => update({ despeckle: parseInt(e.target.value) })}
              className="w-24 accent-pink-400"
            />
            <span className="text-xs font-mono text-gray-500 w-8">
              {settings.despeckle === 0 ? "off" : settings.despeckle}
            </span>
          </div>
        </Field>

        <label className="flex items-center gap-2 pb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.mirror}
            onChange={(e) => update({ mirror: e.target.checked })}
            className="w-4 h-4 rounded accent-pink-400"
          />
          <span className="text-sm text-gray-700">{t("controls.mirror")}</span>
        </label>

        <button
          onClick={onGenerate}
          disabled={!hasImage || isProcessing}
          className="ml-auto px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
        >
          {isProcessing ? t("controls.generating") : t("controls.generate")}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-pink-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
