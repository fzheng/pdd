# Pattern focus mode — design

**Date:** 2026-04-17
**Status:** Design approved
**Scope:** One implementation plan / one feature branch

## Problem

On iPad (and every other viewport), the generated bead pattern is sized to fit inside a card that coexists with the header, settings row, thumbnail, export panel, and footer. When a user wants to **work on the pattern** — read individual bead SKUs, paint, or replace colors — the card view leaves the canvas too small. The user needs a one-tap way to expand the pattern into an almost-full-viewport work surface without losing the editing tools.

Secondary problem: the current codebase has some English strings that leak through when a Chinese locale is selected (notably the hero headline in `ImageUploader.tsx` and an image `alt` in `ImagePreview.tsx`). This spec includes an i18n sweep so every user-visible string goes through `t(...)`.

## Goals

- One obvious, discoverable button enters a "focus mode" that gives the pattern ~95% of the viewport.
- Editing tools (brush, replace, undo, redo), view toggles (circle/square, SKU labels), and color picking stay accessible inside focus mode.
- Full i18n coverage — no hardcoded user-visible English anywhere.
- iPad-first responsive behavior; works well in portrait and landscape and gracefully on phone and desktop widths.

## Non-goals

- True device Fullscreen API (`element.requestFullscreen()`). Skipped because Safari/iPad support is inconsistent on non-`<video>` elements, and the in-page approach gives the same practical benefit without permission prompts.
- Regeneration controls (size, palette, advanced settings, dithering) inside focus mode. Users exit focus mode to regenerate — matches the mental model that focus is for *editing* an already-generated pattern.
- Moving / resizing / pinning the toolbar. The toolbar has one fixed position (bottom center).
- Split-screen / side-by-side with the original. Comparison remains a separate modal, unchanged.

## User flow

1. User generates a pattern → sees it in the card view (today's UI).
2. User taps the **Focus** button in the pattern card header.
3. The focus overlay animates in from the center (`animate-reveal`), filling the viewport on top of everything. Paint-tray drawer auto-closes if it was open.
4. User works: reads SKUs, taps cells (brush/replace), undoes, redoes, picks a new color via the bottom sheet, toggles circle/square or labels.
5. User taps **X** (top-right), presses **Esc**, or activates the color picker and presses Esc — the sheet closes, another Esc closes focus mode.
6. Returning to the card view, editMode, activeColor, shape, and labels state all persist.

## Architecture

### New components

| Component | Responsibility |
|---|---|
| `PatternCanvas` | Presentational canvas renderer. Props: `pattern`, `shape`, `showLabels`, `editMode`, `activeColor`, `onCellClick`, `maxCellSize`, `viewportW`, `viewportH`. Handles `renderPatternToCanvas`, mouse/touch events, and hover tooltip. Used by both `BeadPattern` and `FocusModeOverlay`. |
| `FocusModeOverlay` | Viewport-fixed overlay. Mounts `PatternCanvas`, `FocusToolbar`, and (conditionally) `ColorPickerSheet`. Owns the `isColorPickerOpen` state. Handles Esc + body-scroll-lock. |
| `FocusToolbar` | Bottom-center pill. Brush/replace buttons, circle/square segmented, labels checkbox, undo/redo, active-color chip. Responsive: collapses labels to icons <640px. |
| `ColorPickerSheet` | Bottom sheet. Grid of color tiles sourced from the pattern's `colorCounts`. Tap-tile → setActiveColor + dismiss. Shared tile helper used by `BeadSidebar` color rows too (so we can revise both at once later). |

### State ownership

All focus-mode state lifts into `src/app/page.tsx`:
- `isFocus: boolean`
- `BeadPattern` receives `onEnterFocus: () => void`
- `FocusModeOverlay` receives `onExit: () => void`, plus the same props `BeadPattern` already gets (pattern, editMode, activeColor, onCellClick, canUndo, canRedo, onUndo, onRedo)
- Shape + labels toggles: lift from `BeadPattern` local state into `page.tsx` so they persist across entering/exiting focus mode
- Paint-tray drawer's `open` state stays inside `BeadSidebar`, but `page.tsx` closes it via a ref or by setting `isFocus && !sidebarOpen` pattern — the cleanest approach: `BeadSidebar` accepts an optional `forceClosed` prop; `page.tsx` passes `forceClosed={isFocus}`.

### File changes

| File | Change |
|---|---|
| `src/components/BeadPattern.tsx` | Extract canvas into `PatternCanvas`. Add Focus button to the header row. Accept `onEnterFocus`, `shape`, `showLabels`, `onShapeChange`, `onLabelsChange` as props (lifted from local state). |
| `src/components/PatternCanvas.tsx` | **New.** Extracted canvas rendering. |
| `src/components/FocusModeOverlay.tsx` | **New.** |
| `src/components/FocusToolbar.tsx` | **New.** |
| `src/components/ColorPickerSheet.tsx` | **New.** |
| `src/components/BeadSidebar.tsx` | Extract color-row tile into a shared helper `<ColorTile />` in a new file `src/components/ColorTile.tsx` (also used by `ColorPickerSheet`). Accept `forceClosed` prop. |
| `src/components/ImageUploader.tsx` | Replace hardcoded hero with `t("hero.headlineA")` + `t("hero.headlineB")`. |
| `src/components/ImagePreview.tsx` | Replace `alt="Source"` with `alt={t("preview.altSource")}`. |
| `src/app/page.tsx` | Add `isFocus`, `shape`, `showLabels` state. Render `FocusModeOverlay` when `isFocus`. Pass down new callbacks. Auto-close paint-tray on focus. |
| `src/i18n/dictionary.ts` | Add new keys (see below). |

### New i18n keys

| Key | zh-CN | zh-TW | en |
|---|---|---|---|
| `hero.headlineA` | 一张照片， | 一張照片， | A photo, |
| `hero.headlineB` | 变成豆豆。 | 變成豆豆。 | beaded. |
| `preview.altSource` | 原图预览 | 原圖預覽 | Source preview |
| `focus.enter` | 专注模式 | 專注模式 | Focus |
| `focus.exit` | 退出专注 | 退出專注 | Exit focus |
| `focus.title` | 专注模式 | 專注模式 | Focus mode |
| `focus.colorPickerTitle` | 选择颜色 | 選擇顏色 | Pick a color |
| `focus.toolbarShape` | 豆型 | 豆型 | Shape |
| `focus.toolbarLabels` | 显示色号 | 顯示色號 | Labels |

**Italic hero span in Chinese:** the JSX wraps `hero.headlineB` in `<span className="display-italic text-coral">` today. Fraunces's italic axis only applies to Latin glyphs, so Chinese text falls through to `Noto Serif SC` and renders upright — which is correct Chinese typographic convention. The coral color remains, so the visual emphasis still reads. The implementer must keep the italic span wrapper; do not remove it to "fix" the non-italic Chinese appearance.

## Visual / interaction details

### Focus trigger button
- Placed last in `BeadPattern`'s header row, after the shape toggle and labels checkbox.
- Uses `.btn .btn-ink` — solid ink-black pill with paper text. It's the only solid-filled control in that row, so it reads as the primary action.
- Icon: two corner-arrows glyph, stroke 2, `aria-hidden`. Label: `t("focus.enter")`. Collapses to icon-only under 640px viewport.
- `aria-label={t("focus.enter")}` and matching `title` attribute.

### Focus overlay surface
- `position: fixed; inset: 0; z-index: 70; background: var(--paper-2)`.
- `overflow: hidden` on `<body>` while mounted (restored on unmount).
- Entrance: existing `animate-reveal` (0.45s cubic fade + translate).

### Canvas sizing inside focus mode
- Available width: `window.innerWidth - 48` (24 px each side).
- Available height: `window.innerHeight - 160` (reserve top-right corner and bottom toolbar).
- Cell size = `Math.floor(min(availW / pattern.width, availH / pattern.height, 48))`. Max cap bumped to 48 (from 32 in card view) so labels stay legible in focus mode.
- If `showLabels=true`, min cell size clamp is 18 (up from 14).
- If even the clamped cell doesn't fit, the canvas container scrolls (toolbar + X stay fixed).

### Focus toolbar
- Single pill, `position: fixed; bottom: 20px; left: 50%; translate-x(-50%)`.
- Paper background, ink border (1 px), soft shadow.
- Segments (left→right, separated by `|` dividers):
  1. Brush icon button + Replace icon button.
  2. Circle/square segmented toggle (reuses existing `SegmentToggle` from `BeadPattern`).
  3. Labels checkbox (reuses existing `.riso` checkbox class).
  4. Undo + Redo icon buttons (disabled states respected).
  5. Active color chip (24 px swatch + SKU mono text). Tapping opens `ColorPickerSheet`.
- Height: 56 px. Each tappable target: ≥44 px.
- Responsive: <640 px drops text labels (icons only), active-color chip shrinks to 20 px + SKU hidden.

### X close button
- 48 px circle, `.btn .btn-ghost`.
- `position: fixed; top: 16px; right: 16px; z-index: 71;`.
- `aria-label={t("focus.exit")}`.

### Color picker sheet
- Appears from bottom via CSS transform. `z-index: 80` (above toolbar).
- Scrim: `bg-ink/25 backdrop-blur-[2px]` full-viewport click-target behind the sheet.
- Sheet itself: `bg-paper`, top corners rounded 24 px, 60 vh on iPad, 85 vh on phone.
- Header (48 px): `t("focus.colorPickerTitle")` + 40 px X close.
- Body: scrollable CSS grid, `grid-template-columns: repeat(auto-fill, minmax(72px, 1fr))`, gap 8 px. Each tile: 56×72 with 48 px swatch + SKU (mono) below. Active color tile gets `ring-2 ring-ink`.
- Tile tap → `onPick(color)` → sheet dismisses.
- Esc closes the sheet first; a second Esc closes focus mode.
- Tap-outside (scrim) closes the sheet.

### Keyboard
- Esc: close sheet if open, else exit focus mode.
- Existing Cmd/Ctrl-Z (undo) and Cmd/Ctrl-Shift-Z / Cmd/Ctrl-Y (redo) continue working globally — no change needed.

## Edge cases

- **Pattern regenerates while focus is open:** the parent-owned `pattern` prop updates; canvas re-renders. Focus stays open.
- **Active color becomes invalid** (e.g., user regenerates with a different palette that doesn't include the previously-active color): treat like the existing card view — the chip falls back to "pick a color" placeholder. User can tap the chip to pick a new one from the sheet.
- **No pattern:** `FocusModeOverlay` only mounts when `pattern !== null`. Entering focus is only possible after generation.
- **Browser resize while open:** re-compute cell size (reuse existing resize listener in `PatternCanvas`).
- **Rotation on iPad:** same — resize listener catches `orientationchange`.
- **Screen reader:** overlay has `role="dialog"`, `aria-modal="true"`, `aria-label={t("focus.title")}`. Focus moves to the X button on open; returns to the Focus trigger on close (use `aria-labelledby` + ref-based focus management).
- **Drawer + focus mutual exclusion:** entering focus mode calls `setSidebarOpen(false)` (or uses the `forceClosed` prop); attempting to open the drawer while focus is active is a no-op (the drawer button is not rendered behind the overlay anyway).

## Testing

- **`PatternCanvas.test.tsx`** (new) — renders canvas, click on cell fires `onCellClick` with the right row/col, hover tooltip shows/hides.
- **`FocusModeOverlay.test.tsx`** (new) — renders when `isOpen`, mounts `PatternCanvas`, X button calls `onExit`, Esc calls `onExit`, entering focus while drawer open calls `setSidebarOpen(false)`.
- **`FocusToolbar.test.tsx`** (new) — brush/replace/undo/redo callbacks, shape toggle fires `onShapeChange`, labels toggle fires `onLabelsChange`, active-color-chip click opens the picker.
- **`ColorPickerSheet.test.tsx`** (new) — grid renders a tile per color, tile click fires `onPick`, Esc closes, scrim click closes.
- **`BeadPattern.test.tsx`** (update) — Focus button present, click fires `onEnterFocus`. Test the lifted-up shape/labels props.
- **`dictionary.test.ts`** (update) — the existing parity test will automatically cover the new keys across all three locales.

## Out-of-scope follow-ups (captured for later)

- Fullscreen API integration (would be a follow-up, behind a feature flag, so iPad Safari's quirks can be handled properly).
- Split-screen compare inside focus mode.
- Customizable toolbar position.
