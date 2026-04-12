# PDD — Perler Bead Diagram Generator

## Date: 2026-04-12

## Product Idea

A paid-by-usage web tool that converts user-uploaded photos/images into perler bead diagrams. Key differentiators:

- **Color inventory filtering**: Users can specify which bead colors they own, and the tool designs patterns using only those colors. This fundamentally changes the output — it's not just filtering, it reshapes the whole design.
- **Feedback-driven regeneration**: If the user isn't satisfied with the result, they can provide feedback and regenerate the diagram at no additional cost. This reduces friction and builds trust in the paid model.
- **Pay per use**: Users pay per conversion, not via subscription.

---

## Market Research (2026-04-12)

### Open Source Libraries

#### FusebeadBlueprint (Python) — Most Technically Rigorous
- **URL**: https://github.com/recynie/FusebeadBlueprint
- **License**: MIT
- **Language**: Python 3.7+
- **Stars**: 0
- **Dependencies**: OpenCV, NumPy, SciPy, Pillow, colormath
- **Key Features**:
  - 9 bead palettes: MARD, HAMA, Perler, Nabbi, Artkal S/R/C/A
  - 5 color matching algorithms with speed/accuracy tradeoffs:
    - Fast (4-bit quantized) — ~90,000 px/sec
    - Balanced (vectorized RGB) — ~25,000 px/sec
    - RGB Euclidean — ~15,000 px/sec
    - CIELAB Euclidean — ~2,000 px/sec
    - CIEDE2000 — ~39 px/sec (highest perceptual accuracy)
  - CLI for batch processing
  - Output formats: PNG, JSON, text
  - Dynamic cell sizing and adaptive text contrast
  - Comprehensive unit test suite
- **Limitations**: No community, no GUI, no dithering

#### perler-pattern-generator (TypeScript/Vite) — Best Web-Based
- **URL**: https://github.com/zreecespieces/perler-pattern-generator
- **License**: MIT
- **Language**: TypeScript (94.1%)
- **Stars**: 3
- **Key Features**:
  - Web-based frontend app (Vite)
  - Image upload and direct pattern editing/drawing
  - Color replacement and automatic color normalization
  - Customizable grid dimensions matching pegboards
  - Full undo/redo support
  - Bead count tracking per color
  - PNG and JSON export
  - Original image preview alongside pattern
- **Limitations**: No dithering, no perceptual color matching (likely simple RGB)

#### BeadMaker (Java) — Most Popular
- **URL**: https://github.com/stone-j/BeadMaker
- **Language**: Java (98.1%)
- **Stars**: 16 (most popular in category)
- **Forks**: 7
- **Key Features**:
  - Desktop GUI application (Windows installer)
  - Supports Perler and Artkal bead brands
  - Extensible palette system via XML files
  - Paint-by-numbers style output
  - Color maps and LUTs
- **Limitations**: Windows-only, no recent releases, no dithering

#### beadmania (Clojure)
- **URL**: https://github.com/kenranunderscore/beadmania
- **Language**: Clojure (99.9%)
- **Stars**: 0, but 207 commits
- **Key Features**:
  - Perceptually accurate color space algorithms (not simple RGB)
  - ClojureScript frontend via shadow-cljs
  - Targets Perler, Nabbi, Hama
- **Limitations**: Niche language, incomplete features

#### Perler-Bead-Template-Maker (Java)
- **URL**: https://github.com/grimshaw-a/Perler-Bead-Template-Maker
- **Language**: Java
- **Key Features**: 29x29 pixel PNG to printable templates, 52-color Perler palette
- **Limitations**: Fixed 29x29 input size, naive color matching, academic project

#### Melty-Beads-Converter (Python)
- **URL**: https://github.com/miguelbeltrancastro/Melty-Beads-Converter
- **License**: MIT
- **Stars**: 9
- **Key Features**: Configurable bead pad dimensions, user-selectable colors, bead count output
- **Limitations**: Basic algorithm, minimal documentation

#### perler-beads-ai (TypeScript/React/Next.js)
- **URL**: https://github.com/Vihaan-Bansal/perler-beads-ai
- **License**: Apache 2.0
- **Stars**: 1
- **Key Features**: AI-powered image optimization, one-click pattern creation, inventory lists
- **Limitations**: Windows 10+ only, very new

#### Perler by Snild Dolkow (Java)
- **URL**: https://dolkow.se/perler/
- **License**: Open source (free to modify and redistribute)
- **Platforms**: Linux, Windows, Mac OS X
- **Key Features**:
  - Filter-chain approach: rotate, crop, resize, color reduce, edge detect, grayscale, brightness/contrast
  - Built-in palettes for Hama, Nabbi, Perler
  - Customizable palette selection (select only colors you own)
  - Real-time preview
  - Multi-language support (7 languages)
- **Limitations**: Last updated 2015, JNLP-based (deprecated)

#### SD-piXL (Python/PyTorch) — Academic/Research
- **URL**: https://github.com/AlexandreBinninger/SD-piXL
- **License**: MIT
- **Stars**: 47
- **Origin**: SIGGRAPH Asia 2024 paper (ETH Zurich)
- **Key Features**:
  - Generates low-resolution quantized imagery via score distillation
  - Text-to-pixel-art and image-to-pixel-art generation
  - Gumbel-Softmax reparameterization for crisp color quantization
  - ControlNet conditioning (canny edge, depth)
  - Explicitly demonstrated for fuse bead fabrication
- **Limitations**: Requires significant GPU resources, research-grade code

---

### Competitors — Commercial / Freemium Apps

| Tool | URL | Type | Key Features | Pricing |
|------|-----|------|--------------|---------|
| **Perlypop** | https://perlypop.com/ | iOS/iPad/Mac | Photo conversion wizard, board-by-board progress tracking, shopping list, multi-brand | One-time purchase |
| **Beads Creator** | https://onetap.jp/beadscreator/en/ | iOS/Android | 1.6M+ downloads, 7 pegboard types, pixel art editor | Free w/ ads |
| **Beadographer** | https://beadographer.com/ | Web app | Photo conversion, bead libraries, fill/mirror tools | Free tier + $16.99/yr |
| **BeadPattern.net** | https://beadpattern.net/ | Web app | AI-powered text/photo to pattern, community gallery | Free |
| **Fotor** | https://www.fotor.com/design/perler-bead-pattern-maker/ | Web app | AI-powered image-to-pattern | Free (part of Fotor) |
| **Bylo.ai** | https://bylo.ai/features/perler-bead-pattern-maker | Web app | One-click image-to-bead conversion | Free |

### Competitors — Free Web Tools

| Tool | URL | Key Features |
|------|-----|--------------|
| **MakeBead** | https://makebead.com/ | Weighted RGB matching, 106 Perler Midi colors, 1/2/3-board sizes, PNG/PDF export, BOM, client-side processing |
| **Pixel-Beads.net** | https://www.pixel-beads.net/ | Deep-learning dithering, proprietary color mapping, supports Hama/Artkal/Nabbi/Perler |
| **PixelBeads.org** | https://pixelbeads.org/ | Printable PDF/PNG templates, shopping list mapped to official SKUs, bag quantity calculator |
| **Pixelbeads.pics** | https://pixelbeads.pics/ | Auto color matching, bead counts, multi-brand palettes |
| **PerlerBeads.net** | https://perlerbeads.net/ | 29x29 grid editor, 64 colors, Delta E matching, adjustable grid (10x10 to 100x100) |
| **BeadsCanvas** | https://www.beadscanvas.com/ | Pixel editor, dithering support, flood fill, color replace, real-time tally, PDF w/ symbol keys |
| **Bead-Pattern.com** | https://bead-pattern.com/ | Real-time preview, side-by-side comparison, dithering, multi-brand palettes |
| **KandiPad** | https://kandipad.com/ | Pattern editor, multiple color mapping algorithms, community gallery |

---

### Technical Approaches

#### Core Pipeline

All tools follow this general pipeline:

1. **Input**: Accept image file (JPEG, PNG, WebP, GIF)
2. **Resize/Downsample**: Reduce image to target grid dimensions (e.g., 29x29 for one pegboard)
3. **Color Quantization**: Reduce millions of digital colors to the limited bead palette
4. **Optional Dithering**: Distribute quantization error to neighboring pixels for better gradients
5. **Pattern Generation**: Create a grid where each cell = one bead with a specific color
6. **Output**: Render pattern with grid lines, color codes, bead counts, and export (PNG/PDF/printable)

#### Color Matching Algorithms (simplest to most advanced)

1. **RGB Euclidean Distance** — Fast, simple, but not perceptually accurate. `distance = sqrt((r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2)`
2. **Weighted RGB** — Weights R/G/B channels by human sensitivity (R*0.3, G*0.59, B*0.11). Slightly better.
3. **CIELAB (CIE76) Euclidean** — Converts to perceptually uniform CIELAB color space first. ~7.5x slower than RGB but much more accurate.
4. **CIE94** — Improved CIE76, accounts for varying human perception across color space.
5. **CIEDE2000** — State-of-the-art perceptual color difference. Accounts for luminance, chroma, and hue with correction terms. ~2300x slower than fast quantized RGB but best match to human perception.

#### Dithering Algorithms

- **Floyd-Steinberg** — Most popular. Distributes error to 4 neighboring pixels (7/16, 3/16, 5/16, 1/16).
- **Atkinson** — Distributes only 6/8 of error, creating higher contrast. Good for limited palettes.
- **Stucki, Burkes, Sierra** — Larger error diffusion kernels, smoother results.
- **Riemersma** — Space-filling curve based dithering.

#### Color Reduction / Quantization Methods

- **K-means Clustering** — Groups colors into K clusters, maps to nearest bead color. Sensitive to initial conditions.
- **Median Cut (MMCQ)** — Recursively splits color space along axis of greatest range. More deterministic.
- **RGBQuant** — Purpose-built quantization library.

#### AI Approaches

- **Deep Learning Dithering** (Pixel-Beads.net) — Treats each upload as unique dataset, calculates optimal dithering.
- **Score Distillation with Diffusion Models** (SD-piXL) — Uses SDXL + Gumbel-Softmax for crisp quantization. Can generate from text prompts. SIGGRAPH Asia 2024.
- **Generative AI Pattern Generation** (BeadPattern.net, Fotor) — Creates patterns from text descriptions.

#### Bead Palette Data

| Brand | Typical Color Count |
|-------|-------------------|
| IKEA Pyssla | 18 colors |
| Nabbi | 30 colors |
| Hama Midi | 53 colors |
| Perler | 92-106 colors |
| Artkal Midi | 150-156 colors |

Colors are stored as RGB triplets mapped to manufacturer SKU codes and color names.

#### Output and Rendering Considerations

- **Grid overlay**: Lines separating each bead cell for counting
- **Color codes/symbols**: Letters/numbers/symbols overlaid on cells for printed patterns
- **Section splitting**: Large patterns split across multiple pegboards with alignment guides
- **Bead inventory/BOM**: Count of each color needed, mapped to bag sizes for purchasing
- **Text contrast**: Smart black/white text based on background bead color brightness
- **PDF generation**: Multi-page with overview, sections, color legend, shopping list

---

### Market Gaps and Opportunities

1. **No single open-source tool** combines perceptual color matching + dithering + good web UI + multi-brand palettes + good export
2. **"Which colors do I own" filtering** is rare — most tools show all palette colors, not your inventory
3. **Shopping list / purchase integration** with actual SKUs and links is uncommon
4. **Mobile experience** is generally poor across existing tools
5. **Feedback-driven regeneration** does not exist — all tools are one-shot generate
6. **Pay-per-use model** is unique — most are free (ad-supported) or subscription
