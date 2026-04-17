# Pattern Focus Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-tap "Focus" mode that expands the bead pattern to ~95 % of the viewport with brush/replace/undo/redo/shape/labels tools and a bottom-sheet color picker, plus close every remaining English-under-Chinese leak.

**Architecture:** Extract `PatternCanvas` from `BeadPattern` so it can be reused; add `FocusModeOverlay` (fixed, `z-50+`) that composes a `FocusToolbar` pill and an optional `ColorPickerSheet` bottom sheet over a large `PatternCanvas`. Lift shape/labels and `isFocus` state to `src/app/page.tsx` so state persists across enter/exit. Paint-tray drawer accepts a `forceClosed` prop so focus-mode auto-closes it. Color rows in the drawer and color tiles in the sheet share one `ColorTile` helper.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind 4, Vitest + React Testing Library, existing i18n helper (`useI18n`/`renderWithI18n`).

---

## Task 1: Add i18n keys and fix hardcoded English

**Files:**
- Modify: `src/i18n/dictionary.ts` (union + zh-CN + zh-TW + en dicts)
- Modify: `src/components/ImageUploader.tsx`
- Modify: `src/components/ImagePreview.tsx`

- [ ] **Step 1: Add new keys to the `TranslationKey` union**

In `src/i18n/dictionary.ts`, extend the union — insert these lines alongside the existing ones (the exact order doesn't matter for correctness but grouping by feature keeps the file readable):

```typescript
  | "hero.headlineA"
  | "hero.headlineB"
  | "preview.altSource"
  | "focus.enter"
  | "focus.exit"
  | "focus.title"
  | "focus.colorPickerTitle"
  | "focus.toolbarShape"
  | "focus.toolbarLabels"
```

- [ ] **Step 2: Add the three dictionary entries**

Add the following nine key/value pairs to **each** of the `zhCN`, `zhTW`, `en` dicts in `src/i18n/dictionary.ts`.

```typescript
// zhCN additions
"hero.headlineA": "一张照片，",
"hero.headlineB": "变成豆豆。",
"preview.altSource": "原图预览",
"focus.enter": "专注模式",
"focus.exit": "退出专注",
"focus.title": "专注模式",
"focus.colorPickerTitle": "选择颜色",
"focus.toolbarShape": "豆型",
"focus.toolbarLabels": "显示色号",
```

```typescript
// zhTW additions
"hero.headlineA": "一張照片，",
"hero.headlineB": "變成豆豆。",
"preview.altSource": "原圖預覽",
"focus.enter": "專注模式",
"focus.exit": "退出專注",
"focus.title": "專注模式",
"focus.colorPickerTitle": "選擇顏色",
"focus.toolbarShape": "豆型",
"focus.toolbarLabels": "顯示色號",
```

```typescript
// en additions
"hero.headlineA": "A photo, ",
"hero.headlineB": "beaded.",
"preview.altSource": "Source preview",
"focus.enter": "Focus",
"focus.exit": "Exit focus",
"focus.title": "Focus mode",
"focus.colorPickerTitle": "Pick a color",
"focus.toolbarShape": "Shape",
"focus.toolbarLabels": "Labels",
```

- [ ] **Step 3: Wire `hero.headline*` into `ImageUploader.tsx`**

Replace the hardcoded `<h1>` in `src/components/ImageUploader.tsx`:

```tsx
<h1 className="display text-[2.5rem] sm:text-[3.5rem] leading-[0.95] text-ink text-center tracking-[-0.03em]">
  {t("hero.headlineA")}
  <span className="display-italic text-coral">{t("hero.headlineB")}</span>
</h1>
```

Keep the italic-span wrapper — Chinese glyphs fall through to Noto Serif SC upright, which is the correct Chinese typographic convention; the coral color still provides emphasis.

- [ ] **Step 4: Wire `preview.altSource` into `ImagePreview.tsx`**

Replace `alt="Source"` with `alt={t("preview.altSource")}` in `src/components/ImagePreview.tsx`.

- [ ] **Step 5: Run the dictionary parity test**

```bash
npm test -- dictionary
```

Expected: PASS (the parity test auto-covers the new keys).

- [ ] **Step 6: Run the full typecheck + test suite**

```bash
npm run typecheck && npm test
```

Expected: typecheck passes, all existing tests still pass. (145 tests before the new work.)

- [ ] **Step 7: Commit**

```bash
git add src/i18n/dictionary.ts src/components/ImageUploader.tsx src/components/ImagePreview.tsx
git commit -m "$(cat <<'EOF'
Add focus-mode i18n keys and remove English leakage

Adds hero.headlineA/B, preview.altSource, and the focus.* keys across
zh-CN / zh-TW / en. Wires hero.headline* into the ImageUploader hero
and preview.altSource into the source image alt. Chinese glyphs fall
through to Noto Serif SC upright; coral color still provides emphasis.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Create `ColorTile` helper and refactor `BeadSidebar` to use it

**Files:**
- Create: `src/components/ColorTile.tsx`
- Modify: `src/components/BeadSidebar.tsx`
- Create: `test/components/ColorTile.test.tsx`

- [ ] **Step 1: Write the failing test for `ColorTile`**

Create `test/components/ColorTile.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import ColorTile from "@/components/ColorTile";
import { WHITE } from "../fixtures";
import { renderWithI18n } from "../helpers";

describe("ColorTile", () => {
  it("renders the swatch, localized name, SKU, and count", () => {
    renderWithI18n(
      <ColorTile color={WHITE} count={42} variant="row" />,
    );
    expect(screen.getByText("W")).toBeInTheDocument(); // SKU
    expect(screen.getByText("42")).toBeInTheDocument(); // count
  });

  it("fires onSelect when clickable and clicked", () => {
    const onSelect = vi.fn();
    renderWithI18n(
      <ColorTile
        color={WHITE}
        count={10}
        variant="row"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(WHITE);
  });

  it("does not fire onSelect when not clickable", () => {
    const onSelect = vi.fn();
    renderWithI18n(
      <ColorTile color={WHITE} count={10} variant="row" />,
    );
    // When no onSelect prop, there's no role=button (plain div)
    expect(screen.queryByRole("button")).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders the 'grid' variant as a tile (swatch above SKU)", () => {
    const onSelect = vi.fn();
    const { container } = renderWithI18n(
      <ColorTile
        color={WHITE}
        count={10}
        variant="grid"
        onSelect={onSelect}
      />,
    );
    // Grid variant has a data attribute for styling differentiation
    expect(container.querySelector('[data-variant="grid"]')).not.toBeNull();
  });

  it("marks the active tile visually", () => {
    const { container } = renderWithI18n(
      <ColorTile
        color={WHITE}
        count={10}
        variant="grid"
        active
        onSelect={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-active="true"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- ColorTile
```

Expected: FAIL with "Cannot find module '@/components/ColorTile'".

- [ ] **Step 3: Implement `ColorTile`**

Create `src/components/ColorTile.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the test**

```bash
npm test -- ColorTile
```

Expected: all five tests PASS.

- [ ] **Step 5: Refactor `BeadSidebar` to use `ColorTile` for its rows**

In `src/components/BeadSidebar.tsx`, replace the inner-row button block with `<ColorTile variant="row" ... />`. The block looks like this today (inside the `<ul>` map):

```tsx
<li key={color.id}>
  <button ...>
    <span className="w-7 h-7 ..." />
    <span className="truncate ...">{localizedColorName(...)}</span>
    <span className="font-mono ...">{color.sku}</span>
    <span className="font-mono ...">{count}</span>
  </button>
</li>
```

Replace with:

```tsx
<li key={color.id}>
  <ColorTile
    color={color}
    count={count}
    variant="row"
    active={color.id === activeColor?.id}
    onSelect={mode !== "none" ? onPickColor : undefined}
  />
</li>
```

Add the import at the top of `BeadSidebar.tsx`:

```tsx
import ColorTile from "@/components/ColorTile";
```

Remove the now-unused `localizedColorName` import only if it's no longer referenced anywhere else in the file (it's still used by the active-color chip — keep it if so).

- [ ] **Step 6: Run the sidebar tests**

```bash
npm test -- BeadSidebar
```

Expected: all existing tests PASS. The row-click test still works because `ColorTile` renders a `button` when `onSelect` is provided, matching the previous markup.

- [ ] **Step 7: Commit**

```bash
git add src/components/ColorTile.tsx src/components/BeadSidebar.tsx test/components/ColorTile.test.tsx
git commit -m "$(cat <<'EOF'
Extract ColorTile shared between BeadSidebar and focus-mode picker

Adds variant='row' (full-width sidebar row) and variant='grid' (compact
tile for the upcoming ColorPickerSheet). BeadSidebar now delegates its
color rows to ColorTile so the two surfaces stay visually consistent.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Extract `PatternCanvas` from `BeadPattern`

**Files:**
- Create: `src/components/PatternCanvas.tsx`
- Modify: `src/components/BeadPattern.tsx`
- Create: `test/components/PatternCanvas.test.tsx`

- [ ] **Step 1: Write the failing test for `PatternCanvas`**

Create `test/components/PatternCanvas.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import PatternCanvas from "@/components/PatternCanvas";
import { patternFrom, WHITE, BLACK } from "../fixtures";

beforeEach(() => {
  // jsdom has no canvas; stub the 2D context so render calls don't crash.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    strokeStyle: "",
    lineWidth: 1,
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    font: "",
    textAlign: "",
    textBaseline: "",
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

describe("PatternCanvas", () => {
  it("mounts a canvas element and fires onCellClick with (row, col, color)", () => {
    const pattern = patternFrom([[WHITE, BLACK]]);
    const onCellClick = vi.fn();
    const { container } = render(
      <PatternCanvas
        pattern={pattern}
        shape="circle"
        showLabels={false}
        editMode="brush"
        activeColor={null}
        onCellClick={onCellClick}
        maxCellSize={32}
      />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    // Simulate a click on the canvas; we rely on stubbed getBoundingClientRect
    // to return 0,0,pattern.width*cs,pattern.height*cs so the click lands
    // in-bounds regardless of exact cell-size calculation.
    Object.defineProperty(canvas!, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 100, height: 50 }),
      configurable: true,
    });
    Object.defineProperty(canvas!, "width", { value: 100, configurable: true });
    Object.defineProperty(canvas!, "height", { value: 50, configurable: true });
    fireEvent.click(canvas!, { clientX: 10, clientY: 10 });
    expect(onCellClick).toHaveBeenCalled();
  });

  it("does not fire onCellClick when editMode is 'none'", () => {
    const pattern = patternFrom([[WHITE, BLACK]]);
    const onCellClick = vi.fn();
    const { container } = render(
      <PatternCanvas
        pattern={pattern}
        shape="circle"
        showLabels={false}
        editMode="none"
        activeColor={null}
        onCellClick={onCellClick}
        maxCellSize={32}
      />,
    );
    const canvas = container.querySelector("canvas")!;
    Object.defineProperty(canvas, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 100, height: 50 }),
      configurable: true,
    });
    Object.defineProperty(canvas, "width", { value: 100, configurable: true });
    Object.defineProperty(canvas, "height", { value: 50, configurable: true });
    fireEvent.click(canvas, { clientX: 10, clientY: 10 });
    expect(onCellClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- PatternCanvas
```

Expected: FAIL with "Cannot find module '@/components/PatternCanvas'".

- [ ] **Step 3: Implement `PatternCanvas`**

Create `src/components/PatternCanvas.tsx`. This is the canvas-specific logic currently living inside `BeadPattern.tsx`, lifted out and parameterized so either a card view or a focus-mode overlay can size it.

```tsx
"use client";

import {
  useRef,
  useEffect,
  MouseEvent,
  useState,
  useCallback,
} from "react";
import { BeadPattern as BeadPatternType, BeadColor } from "@/types";
import { renderPatternToCanvas, BeadShape } from "@/lib/renderPattern";

interface PatternCanvasProps {
  pattern: BeadPatternType;
  shape: BeadShape;
  showLabels: boolean;
  editMode: "none" | "brush" | "replace";
  activeColor: BeadColor | null;
  onCellClick?: (row: number, col: number, existingColor: BeadColor) => void;
  /** Max cell size in px (cap). Card view passes 32, focus mode passes 48. */
  maxCellSize: number;
  /**
   * Minimum cell size when labels are on. Card view: 14, focus mode: 18.
   * Defaults to 14.
   */
  minCellSizeWithLabels?: number;
  /**
   * Explicit viewport size overrides. Focus mode passes window-sized values.
   * Omit to auto-measure the container's width and remaining viewport height.
   */
  viewportW?: number;
  viewportH?: number;
  /** Canvas background color (hex). Defaults to the paper token. */
  background?: string;
}

/**
 * Pure canvas renderer for a bead pattern. Owns:
 *   - cell-size calculation (picks the size that fits both w and h, clamped
 *     by `maxCellSize` and, when labels are on, by `minCellSizeWithLabels`);
 *   - `renderPatternToCanvas` invocation;
 *   - brush/replace cell-click dispatch (converts viewport → grid coords);
 *   - hover tooltip.
 *
 * The component does NOT own the pattern-level header (shape/labels toggles,
 * Focus button, color count) — those live in each consumer's surrounding UI.
 */
export default function PatternCanvas({
  pattern,
  shape,
  showLabels,
  editMode,
  activeColor,
  onCellClick,
  maxCellSize,
  minCellSizeWithLabels = 14,
  viewportW,
  viewportH,
  background = "#FAF6EF",
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cellSizeRef = useRef(16);
  const [resizeTick, setResizeTick] = useState(0);
  const [hover, setHover] = useState<{
    color: BeadColor;
    row: number;
    col: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const containerW =
      viewportW ?? Math.max(240, wrapper.clientWidth - 24);
    let availH: number;
    if (viewportH !== undefined) {
      availH = viewportH;
    } else {
      const rect = wrapper.getBoundingClientRect();
      availH = Math.max(240, window.innerHeight - rect.top - 40);
    }
    const innerH = availH - 120;

    const maxByW = Math.floor(containerW / pattern.width);
    const maxByH = Math.floor(innerH / pattern.height);
    let cs = Math.max(4, Math.min(maxByW, maxByH, maxCellSize));
    if (showLabels) cs = Math.max(cs, minCellSizeWithLabels);
    cellSizeRef.current = cs;

    canvas.width = pattern.width * cs;
    canvas.height = pattern.height * cs;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderPatternToCanvas(ctx, pattern, {
      cellSize: cs,
      shape,
      showGridLines: shape === "square",
      showColorCodes: showLabels,
      background,
    });
  }, [
    pattern,
    shape,
    showLabels,
    maxCellSize,
    minCellSizeWithLabels,
    viewportW,
    viewportH,
    background,
    resizeTick,
  ]);

  const getCellAt = useCallback(
    (e: MouseEvent<HTMLCanvasElement>): { row: number; col: number } | null => {
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = e.currentTarget.width / rect.width;
      const scaleY = e.currentTarget.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const cs = cellSizeRef.current;
      const col = Math.floor(x / cs);
      const row = Math.floor(y / cs);
      if (
        col < 0 ||
        col >= pattern.width ||
        row < 0 ||
        row >= pattern.height
      ) {
        return null;
      }
      return { row, col };
    },
    [pattern],
  );

  function handleClick(e: MouseEvent<HTMLCanvasElement>) {
    if (editMode === "none" || !onCellClick) return;
    const hit = getCellAt(e);
    if (!hit) return;
    onCellClick(hit.row, hit.col, pattern.cells[hit.row][hit.col].beadColor);
  }

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    const hit = getCellAt(e);
    if (!hit) {
      setHover(null);
      return;
    }
    const color = pattern.cells[hit.row][hit.col].beadColor;
    const wrapRect = wrapperRef.current?.getBoundingClientRect();
    const px = wrapRect ? e.clientX - wrapRect.left : e.clientX;
    const py = wrapRect ? e.clientY - wrapRect.top : e.clientY;
    setHover({ color, row: hit.row, col: hit.col, x: px, y: py });
  }

  function handleLeave() {
    setHover(null);
  }

  const cursor =
    editMode === "brush"
      ? activeColor
        ? "cell"
        : "not-allowed"
      : editMode === "replace"
        ? "pointer"
        : "crosshair";

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full flex items-center justify-center overflow-auto"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ cursor, imageRendering: "auto" }}
        className="rounded-md block"
      />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md bg-ink text-paper px-2 py-1 text-[0.72rem] font-mono whitespace-nowrap shadow-lg"
          style={{
            left: Math.min(hover.x + 14, (wrapperRef.current?.clientWidth ?? 9999) - 120),
            top: Math.max(hover.y - 30, 4),
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
            style={{ backgroundColor: hover.color.hex }}
          />
          {hover.color.sku}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- PatternCanvas
```

Expected: both tests PASS.

- [ ] **Step 5: Replace the canvas block inside `BeadPattern.tsx`**

In `src/components/BeadPattern.tsx`, import `PatternCanvas` at the top:

```tsx
import PatternCanvas from "@/components/PatternCanvas";
```

Remove the now-duplicate state/refs/effects (`canvasRef`, `containerRef`, `cellSizeRef`, `resizeTick`, `containerWidth`, `hover`, the two `useEffect`s, `getCellAt`, `handleClick`, `handleMove`, `handleLeave`, the `cursor` computation) from `BeadPattern`. Remove the imports that become unused: `useRef`, `useEffect`, `MouseEvent`, `useCallback`, `renderPatternToCanvas`.

Keep: `useState` (for `shape` and `showLabels` — Task 4 lifts these out, but for this task leave them as-is), the `BeadShape` import from `@/lib/renderPattern`.

Replace the rendering block that was:

```tsx
{pattern ? (
  <div className="overflow-auto rounded-[16px] bg-paper-2 p-3">
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ cursor, imageRendering: "auto" }}
      className="rounded-md mx-auto block"
    />
  </div>
) : canGenerate && onGenerate ? (
  // …generate CTA…
) : (
  // …empty state…
)}
```

With:

```tsx
{pattern ? (
  <div className="overflow-auto rounded-[16px] bg-paper-2 p-3 min-h-[240px]">
    <PatternCanvas
      pattern={pattern}
      shape={shape}
      showLabels={showLabels}
      editMode={editMode}
      activeColor={activeColor ?? null}
      onCellClick={onCellClick}
      maxCellSize={32}
    />
  </div>
) : canGenerate && onGenerate ? (
  // …generate CTA unchanged…
) : (
  // …empty state unchanged…
)}
```

Also remove the outer `ref={containerRef}` on the `<section>` and the trailing hover-tooltip `{hover && …}` block — both have moved into `PatternCanvas`.

- [ ] **Step 6: Run the BeadPattern tests**

```bash
npm test -- misc.test BeadPattern
```

Expected: all existing tests PASS. The shape-toggle test and SKU-label-checkbox test rely only on the header controls, which are unchanged.

- [ ] **Step 7: Full typecheck + test suite**

```bash
npm run typecheck && npm test
```

Expected: all PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/PatternCanvas.tsx src/components/BeadPattern.tsx test/components/PatternCanvas.test.tsx
git commit -m "$(cat <<'EOF'
Extract PatternCanvas from BeadPattern for reuse in focus mode

Pulls the canvas rendering, hover tooltip, and click-to-edit logic into
a standalone PatternCanvas. The focus-mode overlay will reuse this with
a larger maxCellSize and explicit viewport dimensions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Lift `shape` and `showLabels` to optional props on `BeadPattern`

**Files:**
- Modify: `src/components/BeadPattern.tsx`

- [ ] **Step 1: Add optional controlled-value props**

In `src/components/BeadPattern.tsx`, extend the props interface:

```tsx
interface BeadPatternProps {
  pattern: BeadPatternType | null;
  editMode?: "none" | "brush" | "replace";
  activeColor?: BeadColor | null;
  onCellClick?: (row: number, col: number, existingColor: BeadColor) => void;
  onGenerate?: () => void;
  canGenerate?: boolean;
  isProcessing?: boolean;
  /** Optional controlled value. Falls back to internal state. */
  shape?: BeadShape;
  onShapeChange?: (next: BeadShape) => void;
  /** Optional controlled value. Falls back to internal state. */
  showLabels?: boolean;
  onShowLabelsChange?: (next: boolean) => void;
  /** Fires when the user taps the Focus button. Task 8 wires this up. */
  onEnterFocus?: () => void;
}
```

- [ ] **Step 2: Replace local state with controlled-or-fallback pattern**

At the top of the function body, replace:

```tsx
const [shape, setShape] = useState<BeadShape>("circle");
const [showLabels, setShowLabels] = useState(false);
```

With:

```tsx
const [shapeInternal, setShapeInternal] = useState<BeadShape>("circle");
const [showLabelsInternal, setShowLabelsInternal] = useState(false);
const shape = propsShape ?? shapeInternal;
const showLabels = propsShowLabels ?? showLabelsInternal;
const setShape = (next: BeadShape) => {
  if (onShapeChange) onShapeChange(next);
  else setShapeInternal(next);
};
const setShowLabels = (next: boolean) => {
  if (onShowLabelsChange) onShowLabelsChange(next);
  else setShowLabelsInternal(next);
};
```

Update the destructuring at the top of the function to rename the prop forms:

```tsx
export default function BeadPattern({
  pattern,
  editMode = "none",
  activeColor,
  onCellClick,
  onGenerate,
  canGenerate = false,
  isProcessing = false,
  shape: propsShape,
  onShapeChange,
  showLabels: propsShowLabels,
  onShowLabelsChange,
  onEnterFocus, // used in Task 8
}: BeadPatternProps) {
```

- [ ] **Step 3: Run the tests**

```bash
npm test -- misc.test BeadPattern
```

Expected: all existing tests still PASS. When a test doesn't pass `shape`/`showLabels`, the component falls back to its own internal state — identical behavior to before.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/BeadPattern.tsx
git commit -m "$(cat <<'EOF'
Make BeadPattern shape/labels controllable by parent

Adds optional shape/onShapeChange and showLabels/onShowLabelsChange
props. When absent, the component keeps its existing internal state —
no behavior change for current callers. Page.tsx will soon lift these
upward so state survives entering/exiting focus mode.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Build `ColorPickerSheet`

**Files:**
- Create: `src/components/ColorPickerSheet.tsx`
- Create: `test/components/ColorPickerSheet.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/components/ColorPickerSheet.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ColorPickerSheet from "@/components/ColorPickerSheet";
import { patternFrom, WHITE, BLACK, RED } from "../fixtures";
import { renderWithI18n } from "../helpers";

function base(overrides: Partial<React.ComponentProps<typeof ColorPickerSheet>> = {}) {
  const pattern = patternFrom([[WHITE, BLACK, RED]]);
  return {
    open: true,
    pattern,
    activeColor: null,
    onPick: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

describe("ColorPickerSheet", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithI18n(
      <ColorPickerSheet {...base({ open: false })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a tile per color in the pattern when open", () => {
    renderWithI18n(<ColorPickerSheet {...base()} />);
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("BK")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
  });

  it("fires onPick with the tapped color", () => {
    const onPick = vi.fn();
    renderWithI18n(<ColorPickerSheet {...base({ onPick })} />);
    fireEvent.click(screen.getByText("W").closest("button")!);
    expect(onPick).toHaveBeenCalledWith(WHITE);
  });

  it("fires onClose when Esc is pressed", () => {
    const onClose = vi.fn();
    renderWithI18n(<ColorPickerSheet {...base({ onClose })} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("fires onClose when the X button is pressed", () => {
    const onClose = vi.fn();
    renderWithI18n(<ColorPickerSheet {...base({ onClose })} />);
    fireEvent.click(screen.getByLabelText(/close|关闭|關閉/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("marks the active color tile", () => {
    const { container } = renderWithI18n(
      <ColorPickerSheet {...base({ activeColor: WHITE })} />,
    );
    const activeTiles = container.querySelectorAll('[data-active="true"]');
    expect(activeTiles.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- ColorPickerSheet
```

Expected: FAIL with "Cannot find module '@/components/ColorPickerSheet'".

- [ ] **Step 3: Implement `ColorPickerSheet`**

Create `src/components/ColorPickerSheet.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { BeadColor, BeadPattern } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";
import ColorTile from "@/components/ColorTile";

interface ColorPickerSheetProps {
  open: boolean;
  pattern: BeadPattern;
  activeColor: BeadColor | null;
  onPick: (color: BeadColor) => void;
  onClose: () => void;
}

/**
 * Bottom sheet that slides up over the focus-mode canvas. Renders the
 * pattern's color inventory as a responsive grid of tiles.
 *
 *  - Esc closes it (consumers can still capture Esc after this if the sheet
 *    is closed — the event listener is only bound while `open`).
 *  - Tap-outside scrim closes it.
 *  - Tapping a tile fires `onPick` (consumers typically close the sheet
 *    as a side-effect).
 */
export default function ColorPickerSheet({
  open,
  pattern,
  activeColor,
  onPick,
  onClose,
}: ColorPickerSheetProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-ink/25 backdrop-blur-[2px] animate-reveal"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("focus.colorPickerTitle")}
        className="fixed left-0 right-0 bottom-0 z-[81] bg-paper rounded-t-[24px] shadow-[0_-8px_24px_-10px_rgba(27,20,24,0.35)] max-h-[60vh] sm:max-h-[60vh] flex flex-col animate-reveal"
        style={{ height: "min(60vh, 560px)" }}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--hairline)]">
          <span className="display text-[1.2rem] text-ink">
            {t("focus.colorPickerTitle")}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-paper-2 flex items-center justify-center transition-colors"
            aria-label={t("common.close")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className="overflow-auto p-3 flex-1">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}
          >
            {entries.map(({ color, count }) => (
              <ColorTile
                key={color.id}
                color={color}
                count={count}
                variant="grid"
                active={color.id === activeColor?.id}
                onSelect={onPick}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run the test**

```bash
npm test -- ColorPickerSheet
```

Expected: all six tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ColorPickerSheet.tsx test/components/ColorPickerSheet.test.tsx
git commit -m "$(cat <<'EOF'
Add ColorPickerSheet bottom-sheet for focus-mode color picking

Bottom sheet rendered above the focus-mode toolbar. Uses ColorTile in
grid variant, dismisses on Esc/scrim/X, and marks the active color.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Build `FocusToolbar`

**Files:**
- Create: `src/components/FocusToolbar.tsx`
- Create: `test/components/FocusToolbar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/components/FocusToolbar.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import FocusToolbar from "@/components/FocusToolbar";
import { WHITE } from "../fixtures";
import { renderWithI18n } from "../helpers";

function base(
  overrides: Partial<React.ComponentProps<typeof FocusToolbar>> = {},
) {
  return {
    editMode: "none" as const,
    onEditModeChange: vi.fn(),
    shape: "circle" as const,
    onShapeChange: vi.fn(),
    showLabels: false,
    onShowLabelsChange: vi.fn(),
    canUndo: true,
    canRedo: true,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    activeColor: null,
    onOpenColorPicker: vi.fn(),
    ...overrides,
  };
}

describe("FocusToolbar", () => {
  it("tapping brush fires onEditModeChange('brush')", () => {
    const onEditModeChange = vi.fn();
    renderWithI18n(<FocusToolbar {...base({ onEditModeChange })} />);
    fireEvent.click(screen.getByLabelText(/brush|画笔|畫筆/i));
    expect(onEditModeChange).toHaveBeenCalledWith("brush");
  });

  it("tapping brush again (while active) fires onEditModeChange('none')", () => {
    const onEditModeChange = vi.fn();
    renderWithI18n(
      <FocusToolbar {...base({ editMode: "brush", onEditModeChange })} />,
    );
    fireEvent.click(screen.getByLabelText(/brush|画笔|畫筆/i));
    expect(onEditModeChange).toHaveBeenCalledWith("none");
  });

  it("tapping shape toggles fire onShapeChange", () => {
    const onShapeChange = vi.fn();
    renderWithI18n(<FocusToolbar {...base({ onShapeChange })} />);
    fireEvent.click(screen.getByLabelText(/square|方格/i));
    expect(onShapeChange).toHaveBeenCalledWith("square");
  });

  it("labels checkbox fires onShowLabelsChange", () => {
    const onShowLabelsChange = vi.fn();
    renderWithI18n(<FocusToolbar {...base({ onShowLabelsChange })} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onShowLabelsChange).toHaveBeenCalledWith(true);
  });

  it("undo/redo fire their callbacks; disabled state disables them", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    renderWithI18n(
      <FocusToolbar
        {...base({ onUndo, onRedo, canUndo: false, canRedo: true })}
      />,
    );
    fireEvent.click(screen.getByLabelText(/undo|撤销|復原/i));
    expect(onUndo).not.toHaveBeenCalled(); // disabled
    fireEvent.click(screen.getByLabelText(/redo|重做/i));
    expect(onRedo).toHaveBeenCalled();
  });

  it("tapping the active-color chip fires onOpenColorPicker", () => {
    const onOpenColorPicker = vi.fn();
    renderWithI18n(
      <FocusToolbar
        {...base({ activeColor: WHITE, onOpenColorPicker })}
      />,
    );
    fireEvent.click(screen.getByLabelText(/pick a color|选择颜色|選擇顏色/i));
    expect(onOpenColorPicker).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- FocusToolbar
```

Expected: FAIL with "Cannot find module '@/components/FocusToolbar'".

- [ ] **Step 3: Implement `FocusToolbar`**

Create `src/components/FocusToolbar.tsx`:

```tsx
"use client";

import { BeadColor } from "@/types";
import { BeadShape } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";

type EditMode = "none" | "brush" | "replace";

interface FocusToolbarProps {
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  shape: BeadShape;
  onShapeChange: (shape: BeadShape) => void;
  showLabels: boolean;
  onShowLabelsChange: (next: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  activeColor: BeadColor | null;
  onOpenColorPicker: () => void;
}

/**
 * Bottom-center pill toolbar for focus mode. Contents (left → right):
 *   brush | replace  ·  circle | square  ·  labels  ·  undo | redo  ·  color chip.
 *
 * On narrow viewports (<640 px) text labels collapse to icons only and the
 * color chip shrinks to a swatch-only dot.
 */
export default function FocusToolbar({
  editMode,
  onEditModeChange,
  shape,
  onShapeChange,
  showLabels,
  onShowLabelsChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  activeColor,
  onOpenColorPicker,
}: FocusToolbarProps) {
  const { t } = useI18n();
  return (
    <div
      role="toolbar"
      aria-label={t("focus.title")}
      className="fixed z-[71] bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-paper border border-[color:var(--hairline)] rounded-full shadow-[0_10px_30px_-12px_rgba(27,20,24,0.35)] px-3 sm:px-4 py-2"
    >
      <IconButton
        active={editMode === "brush"}
        onClick={() => onEditModeChange(editMode === "brush" ? "none" : "brush")}
        label={t("editor.brush")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 20l6-2 9-9a2.8 2.8 0 00-4-4l-9 9-2 6z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      <IconButton
        active={editMode === "replace"}
        onClick={() =>
          onEditModeChange(editMode === "replace" ? "none" : "replace")
        }
        label={t("editor.replace")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M11 8h5M8 11v5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </IconButton>

      <Divider />

      <div className="inline-flex rounded-full bg-paper-2 p-1">
        <ShapeToggle
          active={shape === "circle"}
          onClick={() => onShapeChange("circle")}
          label={t("preview.shape.circle")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          </svg>
        </ShapeToggle>
        <ShapeToggle
          active={shape === "square"}
          onClick={() => onShapeChange("square")}
          label={t("preview.shape.square")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="2" />
          </svg>
        </ShapeToggle>
      </div>

      <label className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-full cursor-pointer select-none hover:bg-paper-2 transition-colors">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(e) => onShowLabelsChange(e.target.checked)}
          className="riso"
          aria-label={t("preview.labels")}
        />
        <span className="text-[0.8rem] text-ink">
          {t("focus.toolbarLabels")}
        </span>
      </label>
      {/* Icon-only fallback for <640 px */}
      <label className="inline-flex sm:hidden items-center h-9 px-2 rounded-full cursor-pointer select-none hover:bg-paper-2 transition-colors">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(e) => onShowLabelsChange(e.target.checked)}
          className="riso"
          aria-label={t("preview.labels")}
        />
      </label>

      <Divider />

      <IconButton onClick={onUndo} label={t("editor.undo")} disabled={!canUndo}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 14l-5-5 5-5m-5 5h10a6 6 0 010 12H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      <IconButton onClick={onRedo} label={t("editor.redo")} disabled={!canRedo}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 14l5-5-5-5m5 5H10a6 6 0 000 12h5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>

      <Divider />

      <button
        type="button"
        onClick={onOpenColorPicker}
        aria-label={t("editor.pickColor")}
        className="inline-flex items-center gap-2 h-10 px-2 sm:px-3 rounded-full hover:bg-paper-2 transition-colors"
      >
        <span
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
          style={{
            backgroundColor: activeColor?.hex ?? "transparent",
            boxShadow: activeColor
              ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
              : "inset 0 0 0 2px var(--hairline)",
          }}
        />
        {activeColor && (
          <span className="hidden sm:inline font-mono text-[0.78rem] text-ink-soft">
            {activeColor.sku}
          </span>
        )}
      </button>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="w-px h-6 bg-[color:var(--hairline)]" />;
}

function IconButton({
  onClick,
  label,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
        active
          ? "bg-ink text-paper"
          : "text-ink hover:bg-paper-2 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}

function ShapeToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 h-8 px-2.5 text-[0.78rem] font-medium rounded-full transition-colors ${
        active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run the test**

```bash
npm test -- FocusToolbar
```

Expected: all six tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/FocusToolbar.tsx test/components/FocusToolbar.test.tsx
git commit -m "$(cat <<'EOF'
Add FocusToolbar bottom pill for focus mode

Contains brush/replace, circle/square segmented, labels, undo/redo,
active-color chip. Responsive: labels collapse to icons <640 px.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Build `FocusModeOverlay`

**Files:**
- Create: `src/components/FocusModeOverlay.tsx`
- Create: `test/components/FocusModeOverlay.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `test/components/FocusModeOverlay.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import FocusModeOverlay from "@/components/FocusModeOverlay";
import { patternFrom, WHITE, BLACK } from "../fixtures";
import { renderWithI18n } from "../helpers";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    strokeStyle: "",
    lineWidth: 1,
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    font: "",
    textAlign: "",
    textBaseline: "",
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
});

function base(
  overrides: Partial<React.ComponentProps<typeof FocusModeOverlay>> = {},
) {
  const pattern = patternFrom([[WHITE, BLACK]]);
  return {
    open: true,
    pattern,
    editMode: "none" as const,
    onEditModeChange: vi.fn(),
    activeColor: null,
    onPickColor: vi.fn(),
    onCellClick: vi.fn(),
    shape: "circle" as const,
    onShapeChange: vi.fn(),
    showLabels: false,
    onShowLabelsChange: vi.fn(),
    canUndo: true,
    canRedo: true,
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onExit: vi.fn(),
    ...overrides,
  };
}

describe("FocusModeOverlay", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithI18n(
      <FocusModeOverlay {...base({ open: false })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a canvas when open", () => {
    const { container } = renderWithI18n(<FocusModeOverlay {...base()} />);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("tapping the X button fires onExit", () => {
    const onExit = vi.fn();
    renderWithI18n(<FocusModeOverlay {...base({ onExit })} />);
    fireEvent.click(screen.getByLabelText(/exit focus|退出专注|退出專注/i));
    expect(onExit).toHaveBeenCalled();
  });

  it("pressing Esc fires onExit when the color picker is not open", () => {
    const onExit = vi.fn();
    renderWithI18n(<FocusModeOverlay {...base({ onExit })} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onExit).toHaveBeenCalled();
  });

  it("opens the color picker when the active-color chip is tapped", () => {
    renderWithI18n(<FocusModeOverlay {...base()} />);
    fireEvent.click(screen.getByLabelText(/pick a color|选择颜色|選擇顏色/i));
    // Sheet header uses focus.colorPickerTitle
    expect(
      screen.getByRole("dialog", { name: /pick a color|选择颜色|選擇顏色/i }),
    ).toBeInTheDocument();
  });

  it("picking a color fires onPickColor and closes the sheet", () => {
    const onPickColor = vi.fn();
    renderWithI18n(<FocusModeOverlay {...base({ onPickColor })} />);
    fireEvent.click(screen.getByLabelText(/pick a color|选择颜色|選擇顏色/i));
    fireEvent.click(screen.getByText("W").closest("button")!);
    expect(onPickColor).toHaveBeenCalledWith(WHITE);
    // Sheet closed — dialog role gone
    expect(
      screen.queryByRole("dialog", { name: /pick a color|选择颜色|選擇顏色/i }),
    ).toBeNull();
  });

  it("locks body scroll while open and restores on close", () => {
    const originalOverflow = document.body.style.overflow;
    const { rerender } = renderWithI18n(<FocusModeOverlay {...base()} />);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<FocusModeOverlay {...base({ open: false })} />);
    expect(document.body.style.overflow).toBe(originalOverflow);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- FocusModeOverlay
```

Expected: FAIL with "Cannot find module '@/components/FocusModeOverlay'".

- [ ] **Step 3: Implement `FocusModeOverlay`**

Create `src/components/FocusModeOverlay.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { BeadColor, BeadPattern } from "@/types";
import { BeadShape } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";
import PatternCanvas from "@/components/PatternCanvas";
import FocusToolbar from "@/components/FocusToolbar";
import ColorPickerSheet from "@/components/ColorPickerSheet";

type EditMode = "none" | "brush" | "replace";

interface FocusModeOverlayProps {
  open: boolean;
  pattern: BeadPattern;
  editMode: EditMode;
  onEditModeChange: (m: EditMode) => void;
  activeColor: BeadColor | null;
  onPickColor: (c: BeadColor) => void;
  onCellClick: (row: number, col: number, existing: BeadColor) => void;
  shape: BeadShape;
  onShapeChange: (s: BeadShape) => void;
  showLabels: boolean;
  onShowLabelsChange: (v: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExit: () => void;
}

/**
 * Viewport-covering focus mode. Mounts only when `open` — callers keep the
 * component in the tree for stable ref management, but the first `if`
 * bails out when the flag is false so no DOM is produced.
 *
 * Body scroll is locked while the overlay is mounted; restored on unmount.
 */
export default function FocusModeOverlay({
  open,
  pattern,
  editMode,
  onEditModeChange,
  activeColor,
  onPickColor,
  onCellClick,
  shape,
  onShapeChange,
  showLabels,
  onShowLabelsChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExit,
}: FocusModeOverlayProps) {
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const previousOverflow = useRef<string>("");

  // Body-scroll lock while open.
  useEffect(() => {
    if (!open) return;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [open]);

  // Track the viewport size so PatternCanvas can size its cells.
  useEffect(() => {
    if (!open) return;
    const measure = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [open]);

  // Esc handling — close picker first, then overlay.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pickerOpen) {
        // Sheet's own handler already handles its close; swallow so we don't
        // also exit focus in the same key press.
        return;
      }
      onExit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, pickerOpen, onExit]);

  if (!open) return null;

  const availW = Math.max(240, viewport.w - 48);
  const availH = Math.max(240, viewport.h - 160);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("focus.title")}
      className="fixed inset-0 z-[70] bg-paper-2 animate-reveal"
    >
      {/* Tiny meta line, top-left */}
      <div className="absolute top-5 left-5 font-mono text-[0.72rem] text-ink-soft tabular-nums">
        {pattern.width} × {pattern.height}
      </div>

      {/* X close, top-right */}
      <button
        type="button"
        onClick={onExit}
        aria-label={t("focus.exit")}
        title={t("focus.exit")}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-paper border border-[color:var(--hairline)] hover:bg-paper-2 flex items-center justify-center shadow-sm transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M6 18L18 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Canvas area */}
      <div
        className="absolute"
        style={{
          top: 56,
          left: 24,
          right: 24,
          bottom: 104,
        }}
      >
        <PatternCanvas
          pattern={pattern}
          shape={shape}
          showLabels={showLabels}
          editMode={editMode}
          activeColor={activeColor}
          onCellClick={onCellClick}
          maxCellSize={48}
          minCellSizeWithLabels={18}
          viewportW={availW}
          viewportH={availH}
        />
      </div>

      <FocusToolbar
        editMode={editMode}
        onEditModeChange={onEditModeChange}
        shape={shape}
        onShapeChange={onShapeChange}
        showLabels={showLabels}
        onShowLabelsChange={onShowLabelsChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        activeColor={activeColor}
        onOpenColorPicker={() => setPickerOpen(true)}
      />

      <ColorPickerSheet
        open={pickerOpen}
        pattern={pattern}
        activeColor={activeColor}
        onPick={(c) => {
          onPickColor(c);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run the test**

```bash
npm test -- FocusModeOverlay
```

Expected: all seven tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/FocusModeOverlay.tsx test/components/FocusModeOverlay.test.tsx
git commit -m "$(cat <<'EOF'
Add FocusModeOverlay — viewport-covering pattern editor

Composes PatternCanvas, FocusToolbar, and ColorPickerSheet. Locks body
scroll while mounted, handles Esc (closes picker first, then exits),
and sizes the canvas to ~95 % of viewport for easy SKU reading.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Add the Focus button to `BeadPattern` header

**Files:**
- Modify: `src/components/BeadPattern.tsx`

- [ ] **Step 1: Add the Focus button to the header row**

In `src/components/BeadPattern.tsx`, within the header row that currently contains the shape segmented toggle and labels checkbox (only rendered when `pattern` exists), append a new Focus button element **after** the labels label. Only render it when both `pattern` and `onEnterFocus` are defined.

Add the button JSX at the end of the inner flex container:

```tsx
{onEnterFocus && (
  <button
    type="button"
    onClick={onEnterFocus}
    aria-label={t("focus.enter")}
    title={t("focus.enter")}
    className="btn btn-ink h-9 min-h-0 px-3 text-[0.82rem]"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10V4h6M14 4h6v6M20 14v6h-6M10 20H4v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="hidden sm:inline">{t("focus.enter")}</span>
  </button>
)}
```

- [ ] **Step 2: Update the misc.test.tsx BeadPattern block**

In `test/components/misc.test.tsx`, add a new test within the existing `describe("BeadPattern UI controls", …)`:

```tsx
it("renders the Focus button and fires onEnterFocus when clicked", () => {
  const onEnterFocus = vi.fn();
  renderWithI18n(
    <BeadPattern
      pattern={patternFrom([[WHITE, BLACK]])}
      onEnterFocus={onEnterFocus}
    />,
  );
  fireEvent.click(screen.getByLabelText(/focus|专注|專注/i));
  expect(onEnterFocus).toHaveBeenCalled();
});

it("does not render the Focus button when onEnterFocus is not provided", () => {
  renderWithI18n(<BeadPattern pattern={patternFrom([[WHITE, BLACK]])} />);
  expect(screen.queryByLabelText(/focus|专注|專注/i)).toBeNull();
});
```

If `vi`, `fireEvent`, or `screen` isn't already imported at the top of that test file, leave the existing imports — they are already pulled in for other tests in the same file.

- [ ] **Step 3: Run the tests**

```bash
npm test -- misc.test
```

Expected: the two new tests PASS plus the two existing ones.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/BeadPattern.tsx test/components/misc.test.tsx
git commit -m "$(cat <<'EOF'
Add Focus trigger button to pattern card header

Renders only when pattern + onEnterFocus are both provided. Uses the
solid ink btn variant so it reads as the primary action next to the
quieter view toggles. Collapses to icon-only under 640 px.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Wire `page.tsx` — isFocus state, overlay rendering, drawer force-close

**Files:**
- Modify: `src/components/BeadSidebar.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add `forceClosed` prop to `BeadSidebar`**

In `src/components/BeadSidebar.tsx`, extend the props interface:

```tsx
interface BeadSidebarProps {
  pattern: BeadPattern | null;
  mode: EditMode;
  onModeChange: (mode: EditMode) => void;
  activeColor: BeadColor | null;
  onPickColor: (c: BeadColor) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  /** When true, the drawer is forced closed (and the floating handle hides). */
  forceClosed?: boolean;
}
```

Accept the prop in the component signature and add the effect + conditional rendering:

```tsx
export default function BeadSidebar({
  pattern,
  mode,
  onModeChange,
  activeColor,
  onPickColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  forceClosed = false,
}: BeadSidebarProps) {
  // …existing body…
  const [open, setOpen] = useState(false);

  // When the parent forces the drawer closed (e.g. entering focus mode),
  // make sure our internal state follows.
  useEffect(() => {
    if (forceClosed && open) setOpen(false);
  }, [forceClosed, open]);
```

And in both the floating-handle render and the drawer render guard, also gate on `!forceClosed`:

```tsx
{/* Floating handle */}
{!open && !forceClosed && (
  <button … />
)}
```

```tsx
{/* Dim scrim */}
{open && !forceClosed && (
  <div … />
)}
```

```tsx
<aside
  className={`… transition-transform duration-200 ease-out ${
    open && !forceClosed
      ? "translate-x-0"
      : "translate-x-full pointer-events-none"
  }`}
  aria-hidden={!open || forceClosed}
>
```

- [ ] **Step 2: Run the sidebar tests to make sure the refactor is non-breaking**

```bash
npm test -- BeadSidebar
```

Expected: all existing tests PASS (none of them pass `forceClosed`; default is `false`, so behavior is unchanged).

- [ ] **Step 3: Wire focus mode into `src/app/page.tsx`**

Add new state near the existing `editMode` / `activeColor`:

```tsx
const [shape, setShape] = useState<BeadShape>("circle");
const [showLabels, setShowLabels] = useState(false);
const [isFocus, setIsFocus] = useState(false);
```

Import `BeadShape`:

```tsx
import { BeadShape } from "@/lib/renderPattern";
import FocusModeOverlay from "@/components/FocusModeOverlay";
```

Pass the new props to `BeadPattern` (both call-sites — the one inside the conditional `croppedUrl ? (…) : (…)` and the fallback else branch):

```tsx
<BeadPatternView
  pattern={pattern}
  editMode={editMode}
  activeColor={activeColor}
  onCellClick={handleCellClick}
  onGenerate={handleGenerate}
  canGenerate={!!croppedImage}
  isProcessing={isProcessing}
  shape={shape}
  onShapeChange={setShape}
  showLabels={showLabels}
  onShowLabelsChange={setShowLabels}
  onEnterFocus={pattern ? () => setIsFocus(true) : undefined}
/>
```

Pass `forceClosed` to the sidebar:

```tsx
<BeadSidebar
  pattern={pattern}
  mode={editMode}
  …existing props…
  forceClosed={isFocus}
/>
```

Render the focus overlay at the end of `<main>` (before the closing `</main>` or after `<ExportPanel>`):

```tsx
{pattern && (
  <FocusModeOverlay
    open={isFocus}
    pattern={pattern}
    editMode={editMode}
    onEditModeChange={(m) => {
      setEditMode(m);
      if (m === "none") setActiveColor(null);
    }}
    activeColor={activeColor}
    onPickColor={setActiveColor}
    onCellClick={handleCellClick}
    shape={shape}
    onShapeChange={setShape}
    showLabels={showLabels}
    onShowLabelsChange={setShowLabels}
    canUndo={canUndo(history)}
    canRedo={canRedo(history)}
    onUndo={handleUndo}
    onRedo={handleRedo}
    onExit={() => setIsFocus(false)}
  />
)}
```

- [ ] **Step 4: Run typecheck + full test suite**

```bash
npm run typecheck && npm test
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/BeadSidebar.tsx src/app/page.tsx
git commit -m "$(cat <<'EOF'
Wire focus mode into page.tsx and auto-close the paint tray

Lifts shape and showLabels into page state so they persist across
entering/exiting focus. BeadSidebar accepts forceClosed to suppress
itself while the focus overlay is open.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Full verification + browser smoke test

**Files:** (none; verification-only)

- [ ] **Step 1: Lint, typecheck, and full test suite**

```bash
npm run lint && npm run typecheck && npm test
```

Expected: lint clean, typecheck clean, all tests PASS (original 145 + the new tests added across tasks).

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: build succeeds without warnings or errors.

- [ ] **Step 3: Dev server + browser smoke test**

Start the dev server on a free port and open the app in a headed browser (Playwright MCP):

```bash
PORT=3030 npm run dev
```

Open `http://localhost:3030` in Playwright at 1024×1366 (iPad portrait). Run through:

1. Hero: confirm headline reads "一张照片，变成豆豆。" in zh-CN (default). Switch to EN, re-confirm "A photo, beaded."
2. Upload the test image (already at `.playwright-mcp/sample-bead.png`).
3. Crop confirm → generate pattern.
4. Verify a **Focus** button appears in the pattern card header.
5. Click Focus → overlay should fill the viewport; pattern canvas should be visibly larger than the card view.
6. Toggle labels on inside focus → SKUs should render readably on beads.
7. Click the active-color chip → picker sheet slides up; tap a tile → chip updates and sheet closes.
8. Tap brush → click a bead → it changes color.
9. Press Esc → overlay closes; shape/labels/active color persist back in the card view.
10. Repeat at 1366×1024 (iPad landscape).

- [ ] **Step 4: Stop the dev server and tear down**

Stop the background task that's running the dev server.

- [ ] **Step 5: Final commit (if any manual tweaks were required)**

If the smoke test surfaced any visual bug (e.g. cell-size math slightly off, toolbar overlap), fix it before committing. If no fixes required, skip this step.

```bash
git status
# If anything changed:
git add <files>
git commit -m "Focus mode polish after browser smoke test"
```
