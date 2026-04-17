"use client";

import { BeadColor } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedColorName } from "@/i18n/colorNames";

export type ColorTileVariant = "row" | "grid";

interface ColorTileProps {
  color: BeadColor;
  count: number;
  variant: ColorTileVariant;
  /** When provided, the tile becomes a button; tapping fires this with `color`. */
  onSelect?: (color: BeadColor) => void;
  /** Visually highlights the tile (active/selected). */
  active?: boolean;
}

/**
 * A single bead color entry. Used in two places:
 *   - BeadSidebar (variant="row")  — full-width row with swatch/name/SKU/count
 *   - ColorPickerSheet (variant="grid") — small tile with swatch over SKU
 *
 * Extracted to one file so the two surfaces stay visually consistent.
 */
export default function ColorTile({
  color,
  count,
  variant,
  onSelect,
  active = false,
}: ColorTileProps) {
  const { locale } = useI18n();
  const clickable = !!onSelect;
  const handleClick = clickable ? () => onSelect!(color) : undefined;

  if (variant === "grid") {
    const content = (
      <>
        <span
          className="w-12 h-12 rounded-full shrink-0 mb-1.5"
          style={{
            backgroundColor: color.hex,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
          }}
        />
        <span className="font-mono text-[0.7rem] text-ink-soft tabular-nums">
          {color.sku}
        </span>
      </>
    );
    const cls = `flex flex-col items-center justify-start p-2 rounded-xl transition-colors ${
      clickable ? "hover:bg-paper-2 cursor-pointer" : ""
    } ${active ? "ring-2 ring-ink bg-paper-2" : ""}`;
    return clickable ? (
      <button
        type="button"
        onClick={handleClick}
        data-variant="grid"
        data-active={active || undefined}
        className={cls}
        aria-label={`${localizedColorName(color.name, locale)} ${color.sku}`}
      >
        {content}
      </button>
    ) : (
      <div data-variant="grid" data-active={active || undefined} className={cls}>
        {content}
      </div>
    );
  }

  // variant === "row"
  const content = (
    <>
      <span
        className="w-7 h-7 rounded-full shrink-0"
        style={{
          backgroundColor: color.hex,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
        }}
      />
      <span className="truncate text-[0.88rem] text-ink">
        {localizedColorName(color.name, locale)}
      </span>
      <span className="font-mono text-[0.72rem] text-ink-soft">
        {color.sku}
      </span>
      <span className="font-mono text-[0.85rem] text-ink tabular-nums">
        {count}
      </span>
    </>
  );
  const cls = `w-full grid grid-cols-[auto_1fr_auto_auto] items-center gap-2.5 px-3 py-2 min-h-[48px] text-left rounded-xl transition-colors ${
    clickable ? "hover:bg-paper-2 cursor-pointer" : "cursor-default"
  } ${active ? "bg-paper-2 ring-1 ring-ink" : ""}`;
  return clickable ? (
    <button
      type="button"
      onClick={handleClick}
      data-variant="row"
      data-active={active || undefined}
      className={cls}
    >
      {content}
    </button>
  ) : (
    <div data-variant="row" data-active={active || undefined} className={cls}>
      {content}
    </div>
  );
}
