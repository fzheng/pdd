import { BeadColor, BeadPattern } from "@/types";
import { buildPatternFromCells } from "./pipeline";

export interface DespeckleOptions {
  /** Components smaller than this many cells are candidates for removal. */
  threshold: number;
}

/**
 * Remove small isolated non-background components that sit in the
 * exterior region of the pattern. Preserves small features adjacent
 * to the main subject (like eyes) by checking that ALL boundary
 * neighbors of a candidate component are exterior background.
 *
 * Algorithm:
 *  1. Background = the most common bead color in the pattern.
 *  2. Flood-fill the "exterior" set: start from every border cell whose
 *     color matches the background, then expand to all reachable
 *     same-color neighbors. This gives us the wraparound background
 *     surrounding the subject (NOT the interior background like a
 *     character's white face, which is enclosed by outline pixels).
 *  3. For each non-background connected component:
 *     - If it is smaller than `threshold` AND every one of its boundary
 *       neighbors is in the exterior set → snap it to background.
 *     - Otherwise leave it alone (it's part of, or adjacent to, the
 *       main subject).
 */
export function despecklePattern(
  pattern: BeadPattern,
  options: DespeckleOptions,
): BeadPattern {
  const { threshold } = options;
  if (threshold <= 0) return pattern;

  const w = pattern.width;
  const h = pattern.height;
  if (w === 0 || h === 0) return pattern;

  // 1. Identify background color
  let bgColor: BeadColor | null = null;
  let maxCount = 0;
  for (const entry of pattern.colorCounts.values()) {
    if (entry.count > maxCount) {
      maxCount = entry.count;
      bgColor = entry.color;
    }
  }
  if (!bgColor) return pattern;
  const bgId = bgColor.id;

  const cellAt = (y: number, x: number) => pattern.cells[y][x].beadColor;
  const idx = (y: number, x: number) => y * w + x;

  // 2. Flood-fill exterior from every border cell whose color is bg.
  const exterior = new Uint8Array(w * h);
  const queue: number[] = [];

  const seedBorder = (y: number, x: number) => {
    if (cellAt(y, x).id === bgId) {
      const i = idx(y, x);
      if (!exterior[i]) {
        exterior[i] = 1;
        queue.push(i);
      }
    }
  };
  for (let x = 0; x < w; x++) {
    seedBorder(0, x);
    seedBorder(h - 1, x);
  }
  for (let y = 0; y < h; y++) {
    seedBorder(y, 0);
    seedBorder(y, w - 1);
  }

  while (queue.length) {
    const i = queue.shift()!;
    const cy = Math.floor(i / w);
    const cx = i % w;
    for (const [dy, dx] of NEIGHBORS) {
      const ny = cy + dy;
      const nx = cx + dx;
      if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
      const ni = idx(ny, nx);
      if (exterior[ni]) continue;
      if (cellAt(ny, nx).id !== bgId) continue;
      exterior[ni] = 1;
      queue.push(ni);
    }
  }

  // 3. Walk non-background components; replace small exterior-only ones.
  const visited = new Uint8Array(w * h);
  const newCells: BeadColor[][] = pattern.cells.map((row) =>
    row.map((c) => c.beadColor),
  );

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(y, x);
      if (visited[i]) continue;
      const color = cellAt(y, x);
      visited[i] = 1;
      if (color.id === bgId) continue;

      // BFS the component
      const compQueue: number[] = [i];
      const cells: number[] = [];
      let allBoundaryExterior = true;

      while (compQueue.length) {
        const ci = compQueue.shift()!;
        const cy = Math.floor(ci / w);
        const cx = ci % w;
        cells.push(ci);

        for (const [dy, dx] of NEIGHBORS) {
          const ny = cy + dy;
          const nx = cx + dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
          const ni = idx(ny, nx);
          if (cellAt(ny, nx).id === color.id) {
            if (!visited[ni]) {
              visited[ni] = 1;
              compQueue.push(ni);
            }
          } else if (!exterior[ni]) {
            // boundary neighbor that is not exterior → component is
            // adjacent to the main subject; protect it.
            allBoundaryExterior = false;
          }
        }
      }

      if (cells.length < threshold && allBoundaryExterior) {
        for (const ci of cells) {
          const cy = Math.floor(ci / w);
          const cx = ci % w;
          newCells[cy][cx] = bgColor!;
        }
      }
    }
  }

  return buildPatternFromCells(newCells);
}

const NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
