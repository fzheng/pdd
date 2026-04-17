"use client";

import { useState } from "react";
import { PipelineSettings, ColorMatchAlgorithm, DitheringMethod } from "@/types";
import { allPalettes } from "@/data/palettes";
import { useI18n } from "@/i18n/I18nProvider";

/** Preset options for the palette-size reducer. 0 = "use all colors". */
const MAX_COLOR_OPTIONS = [0, 16, 24, 36, 48, 72, 168];

const MIN_GRID = 20;
const MAX_GRID = 150;

interface ControlPanelProps {
  settings: PipelineSettings;
  onSettingsChange: (settings: PipelineSettings) => void;
}

/**
 * Settings — quiet row. Primary pair (size + palette) always visible;
 * secondary tuning folds behind an "Advanced" reveal. Every control
 * is at least 44pt tall so it works with fingertips on iPad.
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
    <section className="card p-5 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-5 items-end">
        <Field
          label={t("controls.gridSize")}
          value={`${settings.gridSize} × ${settings.gridSize}`}
        >
          <input
            type="range"
            min={MIN_GRID}
            max={MAX_GRID}
            step={1}
            value={settings.gridSize}
            onChange={(e) => update({ gridSize: parseInt(e.target.value) })}
            className="riso w-full"
            aria-label={t("controls.gridSize")}
          />
        </Field>

        <Field label={t("controls.palette")}>
          <select
            value={settings.palette.brand}
            onChange={(e) => {
              const p =
                allPalettes.find((p) => p.brand === e.target.value) ??
                allPalettes[0];
              update({ palette: p });
            }}
            className="riso min-w-[180px]"
            aria-label={t("controls.palette")}
          >
            {allPalettes.map((p) => (
              <option key={p.brand} value={p.brand}>
                {p.brand} ({p.colors.length})
              </option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
          className="btn btn-ghost text-[0.85rem] self-end"
        >
          <span
            aria-hidden
            className="inline-block transition-transform"
            style={{ transform: advancedOpen ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            +
          </span>
          {t("controls.advanced")}
        </button>
      </div>

      {advancedOpen && (
        <div className="mt-6 pt-6 border-t border-[color:var(--hairline)] animate-reveal">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label={t("controls.maxColors")}>
              <select
                value={settings.maxColors}
                onChange={(e) => update({ maxColors: parseInt(e.target.value) })}
                className="riso w-full"
                aria-label={t("controls.maxColors")}
              >
                {MAX_COLOR_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n === 0
                      ? t("controls.maxColors.all")
                      : t("controls.maxColors.n", { n })}
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
                className="riso w-full"
                aria-label={t("controls.algorithm")}
              >
                <option value="rgb-euclidean">{t("controls.algorithm.rgb")}</option>
                <option value="cielab-euclidean">
                  {t("controls.algorithm.cielab")}
                </option>
                <option value="ciede2000">
                  {t("controls.algorithm.ciede2000")}
                </option>
              </select>
            </Field>

            <Field label={t("controls.dithering")}>
              <select
                value={settings.dithering}
                onChange={(e) =>
                  update({ dithering: e.target.value as DitheringMethod })
                }
                className="riso w-full"
                aria-label={t("controls.dithering")}
              >
                <option value="none">{t("controls.dithering.none")}</option>
                <option value="floyd-steinberg">{t("controls.dithering.fs")}</option>
                <option value="atkinson">{t("controls.dithering.atkinson")}</option>
                <option value="stucki">{t("controls.dithering.stucki")}</option>
                <option value="burkes">{t("controls.dithering.burkes")}</option>
                <option value="sierra">{t("controls.dithering.sierra")}</option>
              </select>
            </Field>

            <Field
              label={t("controls.saturation")}
              value={settings.saturation.toFixed(2)}
            >
              <input
                type="range"
                min={0.5}
                max={1.6}
                step={0.05}
                value={settings.saturation}
                onChange={(e) => update({ saturation: parseFloat(e.target.value) })}
                className="riso w-full"
                aria-label={t("controls.saturation")}
              />
            </Field>

            <Field
              label={t("controls.despeckle")}
              value={settings.despeckle === 0 ? "off" : String(settings.despeckle)}
            >
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={settings.despeckle}
                onChange={(e) => update({ despeckle: parseInt(e.target.value) })}
                className="riso w-full"
                aria-label={t("controls.despeckle")}
              />
            </Field>

            <label className="flex items-center gap-3 self-end cursor-pointer select-none min-h-[44px] px-3 rounded-xl border border-[color:var(--hairline)] hover:bg-paper-2 transition-colors">
              <input
                type="checkbox"
                checked={settings.mirror}
                onChange={(e) => update({ mirror: e.target.checked })}
                className="riso"
              />
              <span className="text-[0.9rem] text-ink">
                {t("controls.mirror")}
              </span>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.78rem] font-medium text-ink-soft">
          {label}
        </span>
        {value !== undefined && (
          <span className="font-mono text-[0.78rem] text-ink tabular-nums">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
