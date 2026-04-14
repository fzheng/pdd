"use client";

import { BeadPattern, BeadColor } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";

interface BeadInventoryProps {
  pattern: BeadPattern | null;
  onPickColor?: (color: BeadColor) => void;
  activeColorId?: string;
}

export default function BeadInventory({
  pattern,
  onPickColor,
  activeColorId,
}: BeadInventoryProps) {
  const { t } = useI18n();
  if (!pattern) return null;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );
  const total = entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="bg-white rounded-3xl border-4 border-green-200 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-green-600 flex items-center gap-1">
          {t("inventory.title")}
        </h3>
        <div className="text-xs text-gray-500">
          <span className="font-bold text-green-600">
            {t("inventory.colors", { n: entries.length })}
          </span>
          {"  ·  "}
          <span className="font-bold text-green-600">
            {t("inventory.beadsTotal", { n: total })}
          </span>
        </div>
      </div>

      <div className="overflow-auto max-h-[300px] rounded-2xl bg-green-50 p-2">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-green-50">
            <tr className="text-left text-xs text-green-700">
              <th className="py-1.5 pr-2 font-bold">{t("inventory.color")}</th>
              <th className="py-1.5 pr-2 font-bold">{t("inventory.name")}</th>
              <th className="py-1.5 pr-2 font-bold">{t("inventory.sku")}</th>
              <th className="py-1.5 text-right font-bold">{t("inventory.count")}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ color, count }) => {
              const active = color.id === activeColorId;
              return (
                <tr
                  key={color.id}
                  onClick={() => onPickColor?.(color)}
                  className={`border-b border-green-100 transition-colors ${
                    onPickColor ? "cursor-pointer hover:bg-green-100" : ""
                  } ${active ? "bg-yellow-100" : ""}`}
                >
                  <td className="py-1.5 pr-2">
                    <div
                      className={`w-6 h-6 rounded-full border-2 shadow-sm ${
                        active ? "border-pink-500 ring-2 ring-pink-300" : "border-white"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  </td>
                  <td className="py-1.5 pr-2 text-gray-700">{color.name}</td>
                  <td className="py-1.5 pr-2 text-gray-500 font-mono text-xs">{color.sku}</td>
                  <td className="py-1.5 text-right font-mono text-gray-700">{count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
