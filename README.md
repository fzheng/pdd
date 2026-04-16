# 豆P · BeadSnap

Snap a photo, get a printable, shoppable Perler / Hama / Artkal / MARD /
Nabbi bead pattern. Built with Next.js 16 + React 19 + Tailwind.

> **豆P** (pronounced *dou-pee*, as in *P 图 + 拼豆*) is the Chinese
> brand; **BeadSnap** is the international name. Same product.

![Made with ❤️ in TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/tests-129%20passing-green)
![Coverage](https://img.shields.io/badge/coverage-≥85%25-green)

## What it does

1. **Upload** a JPG/PNG.
2. **Crop** it to a square via an interactive drag + zoom modal.
3. **Tune** the pattern — size slider (default 58 × 58), brand palette
   (Perler, Hama, Artkal, MARD, Nabbi), color-match algorithm (RGB /
   CIELAB / CIEDE2000), optional dithering, saturation, despeckle,
   horizontal mirror for ironing.
4. **Edit** pixel-by-pixel: brush in a new color, or replace every
   instance of one color with another. Undo/redo (Ctrl/Cmd-Z).
5. **Compare** the bead pattern against the original via a click-through
   left/right slider modal.
6. **Export** to PNG or PDF. By default the PDF fits the whole diagram
   onto one A4 page; toggle "split into 29×29 pegboard pages" for
   physical assembly on standard Perler pegboards.

The UI is localized into 简体中文 / 繁體中文 / English.

## Project layout

```
src/
  app/              Next.js App Router entry
  components/       React components (all "use client")
  data/             Bead-brand palettes (hex + SKU + brand)
  i18n/             Provider + dictionary (zh-CN / zh-TW / en)
  lib/              Pipeline stages (pure TS, unit-tested)
    colorConvert    sRGB / linear / CIELAB + CIEDE2000
    colorMatch      Nearest-bead lookup across 3 algorithms
    dithering       Floyd-Steinberg / Atkinson / Stucki / Burkes / Sierra
    paletteReduce   k-means++ palette subset selection
    imageUtils      Gamma-correct downsample + square crop
    pipeline        Wires the stages together
    despeckle       Exterior-region noise cleanup
    history         Undo/redo stack for edits
    exportPng       PNG export
    exportPdf       A4 PDF export (single-page OR per-pegboard)
    renderPattern   Canvas renderer (shared by UI + PDF thumbnail)
  types/            Cross-cutting TS types
test/
  lib/              Unit tests for the pipeline modules
  components/       React Testing Library component tests
  i18n/             Dictionary tests
  fixtures.ts       Shared test data (palettes, colors)
  helpers.tsx       renderWithI18n wrapper
```

## Local development

```bash
make install       # npm install (or `npm ci` when lockfile is fresh)
make dev           # next dev — open http://localhost:3000
```

Any target is available via `make <target>`; run `make` on its own for
the list.

### Tests & coverage

```bash
make test          # vitest run (single pass)
make test-watch    # vitest in watch mode
make coverage      # v8 coverage — fails under 85%
make check         # lint + typecheck + test — the pre-push gate
```

Thresholds live in `vitest.config.ts`:

- Statements / functions / lines: **≥ 85 %**
- Branches: **≥ 80 %**

Render-only files (Next `app/`, static palette data tables, jsPDF
exporter which needs real canvas text metrics) are excluded from
coverage because they aren't unit-testable in jsdom — their behavior is
validated manually before release.

### Type-checking & linting

```bash
make typecheck     # tsc --noEmit
make lint          # eslint
```

## Deployment — Railway (native / Railpack)

This repo ships with a `railway.toml` for Railway's **Railpack** native
builder (no Docker, no Nixpacks config). When you link the repo Railway
auto-detects Next.js, installs deps, runs `make build`, and starts the
server via `make start` on the injected `$PORT`.

```toml
[build]
builder      = "RAILPACK"
buildCommand = "make build"

[deploy]
startCommand           = "make start"
healthcheckPath        = "/"
healthcheckTimeout     = 30
restartPolicyType      = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

Locally the same flow works:

```bash
PORT=8080 make build && make start
```

Node version is pinned via `.nvmrc` (currently 20).

## Architectural notes

- **Square-only output.** After upload the user explicitly crops to a
  square. This makes sizing a single slider instead of two, and avoids
  cropping surprises at export time.
- **29 × 29 pegboards.** That's the standard physical Perler/Hama mini
  pegboard size for 5 mm beads. The PDF exporter can optionally split
  the diagram into one-page-per-pegboard for assembly.
- **Gamma-correct downsampling.** Pixel averaging happens in linear
  RGB (not sRGB), so bright / dark gradients come through faithfully.
- **Transparent PNGs.** Mostly-transparent blocks snap straight to the
  background color — no faint halo of pink/grey beads around your cut-out.
- **Despeckle with exterior flood-fill.** Only stray beads that are
  completely surrounded by the wraparound background are cleaned up;
  small features adjacent to the subject (eyes, highlights) are preserved.

## Breaking changes from the Next.js template

This is Next.js 16, which ships with a bunch of behavioral changes vs.
the older 13/14 era most training data covers. When writing new code:

- Read the shipped docs at `node_modules/next/dist/docs/` first.
- App Router components default to server components — use
  `"use client"` when you need hooks or event handlers.

## License

Private / internal.
