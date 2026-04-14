import { jsPDF } from "jspdf";

/**
 * Text rendering for jsPDF with CJK support.
 *
 * jsPDF's built-in fonts are Latin-1 only. For Chinese/Japanese/Korean
 * strings, we render the text to an offscreen canvas using the browser's
 * system fonts (which include CJK) and embed that as an image in the PDF.
 *
 * Pure ASCII strings use jsPDF's native text API for speed and crispness.
 */

const CJK_REGEX = /[^\u0000-\u007F]/;

/** True if the string contains any non-ASCII character. */
export function hasNonLatin(s: string): boolean {
  return CJK_REGEX.test(s);
}

export interface DrawTextOptions {
  /** Text size in points (jsPDF uses mm here, but "fontSizePt" is convenient) */
  fontSizePt: number;
  /** "left" | "center" | "right" — horizontal alignment around x */
  align?: "left" | "center" | "right";
  /** "top" | "middle" | "baseline" — vertical anchor for y */
  baseline?: "top" | "middle" | "baseline";
  color?: [number, number, number];
  bold?: boolean;
  /** Font family stack for canvas rendering (CJK path) */
  canvasFontStack?: string;
  /** Render resolution multiplier for the canvas image (sharpness) */
  canvasScale?: number;
}

const PT_TO_MM = 0.352778;

const DEFAULT_CANVAS_FONT =
  '"PingFang SC","Microsoft YaHei","Heiti SC","Noto Sans SC","Hiragino Sans GB","Source Han Sans SC",sans-serif';

/**
 * Draw text into a jsPDF document at (x, y) measured in mm.
 * For non-ASCII text, renders via canvas+image for correct glyph coverage.
 */
export function drawText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options: DrawTextOptions,
): void {
  const {
    fontSizePt,
    align = "left",
    baseline = "baseline",
    color = [0, 0, 0],
    bold = false,
    canvasFontStack = DEFAULT_CANVAS_FONT,
    canvasScale = 3,
  } = options;

  if (!hasNonLatin(text)) {
    // Latin-1 only — use native text (crisp, small PDF)
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSizePt);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y, {
      align: align === "center" ? "center" : align === "right" ? "right" : "left",
      baseline: baseline === "middle" ? "middle" : baseline === "top" ? "top" : "alphabetic",
    });
    return;
  }

  // CJK / non-Latin — render to canvas, embed as image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontPx = fontSizePt * canvasScale;
  const fontDecl = `${bold ? "bold " : ""}${fontPx}px ${canvasFontStack}`;

  // Measure
  ctx.font = fontDecl;
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontPx * 0.85;
  const descent = metrics.actualBoundingBoxDescent || fontPx * 0.2;
  const paddingX = 2;
  const paddingY = 2;
  const textWidth = Math.max(1, Math.ceil(metrics.width));
  const textHeight = Math.max(1, Math.ceil(ascent + descent));

  canvas.width = textWidth + paddingX * 2;
  canvas.height = textHeight + paddingY * 2;

  // Re-set font after canvas resize (resize clears context state)
  ctx.font = fontDecl;
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(text, paddingX, paddingY + ascent);

  // Convert canvas px -> mm using scale
  // fontSizePt in pt = fontSizePt * PT_TO_MM mm
  // canvas pixel maps to (1 mm / (canvasScale * some factor)). Keep it simple:
  // we want the glyph height to be ~fontSizePt in mm, so scale factor is:
  //   pdfMmPerPx = (fontSizePt * PT_TO_MM) / fontPx = PT_TO_MM / canvasScale
  const pdfMmPerPx = PT_TO_MM / canvasScale;
  const widthMm = canvas.width * pdfMmPerPx;
  const heightMm = canvas.height * pdfMmPerPx;

  // Determine top-left based on alignment
  let drawX = x;
  if (align === "center") drawX = x - widthMm / 2;
  else if (align === "right") drawX = x - widthMm;

  let drawY: number;
  if (baseline === "top") drawY = y;
  else if (baseline === "middle") drawY = y - heightMm / 2;
  else {
    // baseline — align alphabetic baseline to y
    drawY = y - ((paddingY + ascent) * pdfMmPerPx);
  }

  const dataUrl = canvas.toDataURL("image/png");
  doc.addImage(dataUrl, "PNG", drawX, drawY, widthMm, heightMm, undefined, "FAST");
}

/** Measure the rendered width of a text string in mm at the given size. */
export function measureTextWidth(text: string, fontSizePt: number, bold = false): number {
  if (!hasNonLatin(text)) {
    // Rough Latin approximation — most UI cases don't need exact measurement
    return text.length * fontSizePt * 0.55 * PT_TO_MM;
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontDecl = `${bold ? "bold " : ""}${fontSizePt}pt ${DEFAULT_CANVAS_FONT}`;
  ctx.font = fontDecl;
  return ctx.measureText(text).width * PT_TO_MM;
}
