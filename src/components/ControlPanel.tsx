"use client";

import { useState } from "react";
import { PipelineSettings, ColorMatchAlgorithm, DitheringMethod } from "@/types";
import { allPalettes } from "@/data/palettes";
import { useI18n } from "@/i18n/I18nProvider";

/** Preset options for the palette-size reducer. 0 = "use all colors". */
const MAX_COLOR_OPTIONS = [0, 16, 24, 36, 48, 72, 168];

/** Slider bounds. Lower: anything smaller loses meaningful detail.
 *  Upper: above ~150 beads/side the browser crunches millions of pixels per
 *  render; typical crafting projects top out well under this. */
const MIN_GRID = 20;
const MAX_GRID = 150;

interface ControlPanelProps {
  settings: PipelineSettings;
  onSettingsChange: (settings: PipelineSettings) => void;
}

/**
 * Settings panel shown above the pattern preview.
 *
 * Layout intent:
 *   - Primary controls (size + brand) are **always visible** in a single row.
 *   - Secondary tuning (max colors, color-match algo, dithering, saturation,
 *     despeckle, mirror) lives behind an **"Advanced" collapse** to keep the
 *     default view uncluttered — sensible defaults already produce great
 *     results for most images.
 *   - The big upload drop-zone is only rendered *before* the first image.
 *     Once the user has a working image, a compact "swap image" button
 *     sits inline next to the generate CTA instead of re-rendering a whole
 *     row of empty upload prompts.
 *
 * The output is always square (one side length, chosen via slider); the
 * SquareCropModal handles any non-square source upstream.
 */
export default function ControlPanel({
  settings,
  onSettingsChange,
}: ControlPanelProps) {
  const { t } = useI18n();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function update(partial: Partial<PipelineSettings>) {
    onSettingsChange({ ...settings, ...partial });
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-yellow-200 p-5 shadow-lg space-y-4">
      {/* ──────────── Primary row ──────────── */}
      <div className="flex flex-wrap items-end gap-5">
        <Field label={t("controls.gridSize")} className="flex-1 min-w-[260px]">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={MIN_GRID}
              max={MAX_GRID}
              step={1}
              value={settings.gridSize}
              onChange={(e) => update({ gridSize: parseInt(e.target.value) })}
              className="flex-1 accent-pink-400"
            />
            <span className="text-sm font-mono text-gray-700 font-bold w-20 text-right">
              {settings.gridSize} × {settings.gridSize}
            </span>
          </div>
        </Field>

        <Field label={t("controls.palette")}>
          <select
            value={settings.palette.brand}
            onChange={(e) => {
              const p =
                allPalettes.find((p) => p.brand === e.target.value) ?? allPalettes[0];
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
      </div>

      {/* ──────────── Advanced (collapsed by default) ──────────── */}
      <div>
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1"
          aria-expanded={advancedOpen}
        >
          <span aria-hidden className="transition-transform inline-block" style={{ transform: advancedOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▸</span>
          {t("controls.advanced")}
        </button>

        {advancedOpen && (
          <div className="mt-3 flex flex-wrap items-end gap-4 pt-3 border-t border-yellow-100">
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
                onChange={(e) =>
                  update({ algorithm: e.target.value as ColorMatchAlgorithm })
                }
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
                onChange={(e) =>
                  update({ dithering: e.target.value as DitheringMethod })
                }
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
          </div>
        )}
      </div>

    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-pink-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
