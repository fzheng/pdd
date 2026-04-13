"use client";

import { BeadPattern } from "@/types";

interface BeadInventoryProps {
  pattern: BeadPattern | null;
}

export default function BeadInventory({ pattern }: BeadInventoryProps) {
  if (!pattern) return null;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );
  const totalBeads = entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">
        Bead Inventory — {entries.length} colors, {totalBeads} beads total
      </h3>
      <div className="overflow-auto max-h-[300px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="py-1.5 pr-2">Color</th>
              <th className="py-1.5 pr-2">Name</th>
              <th className="py-1.5 pr-2">SKU</th>
              <th className="py-1.5 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ color, count }) => (
              <tr key={color.id} className="border-b border-gray-100">
                <td className="py-1 pr-2">
                  <div
                    className="w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: color.hex }}
                  />
                </td>
                <td className="py-1 pr-2 text-gray-700">{color.name}</td>
                <td className="py-1 pr-2 text-gray-500 font-mono">{color.sku}</td>
                <td className="py-1 text-right font-mono text-gray-700">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
