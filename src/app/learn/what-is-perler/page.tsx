"use client";

import ArticleShell from "@/components/ArticleShell";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Introductory article: "What is Perler / 拼豆?"
 *
 * Targeted at newcomers who've seen bead crafts on social media but
 * aren't sure what the physical craft involves, which brands exist, or
 * how a bead pattern (图纸) is actually used.
 */
export default function WhatIsPerlerPage() {
  const { locale } = useI18n();
  return (
    <ArticleShell title={TITLE[locale] ?? TITLE.en}>
      {(BODY[locale] ?? BODY.en).map((block, i) =>
        block.type === "h2" ? (
          <h2
            key={i}
            className="text-lg font-bold text-pink-600 mt-6 mb-2"
          >
            {block.text}
          </h2>
        ) : (
          <p key={i}>{block.text}</p>
        ),
      )}
    </ArticleShell>
  );
}

type Block = { type: "p" | "h2"; text: string };

const TITLE = {
  "zh-CN": "什么是拼豆？",
  "zh-TW": "什麼是拼豆？",
  en: "What is Perler / bead art?",
} as const;

const BODY: Record<"zh-CN" | "zh-TW" | "en", Block[]> = {
  "zh-CN": [
    {
      type: "p",
      text: "拼豆是一种把彩色塑料豆按色号排列在带凸点的洞板上，然后用熨斗加热使其熔合成平面图案的手工艺。成品像「像素画」，常用于钥匙扣、杯垫、装饰画和饰品。",
    },
    { type: "h2", text: "常见品牌" },
    {
      type: "p",
      text: "市面上常见的品牌有 Perler（美国）、Hama（丹麦）、Artkal（中国）、Nabbi（北欧）、MARD（日本）等。它们的豆子直径通常为 5mm（mini）或 2.6mm（midi），不同品牌的色号并不互通，配色时需要对照对应的色板。",
    },
    { type: "h2", text: "拼豆板（pegboard）" },
    {
      type: "p",
      text: "标准的方形拼豆板大多为 29×29 个凸点。大图纸通常由多个拼豆板拼接完成，熨烫后再用胶带或再熨烫把几块板的成品粘在一起。本工具导出 PDF 时可选择按 29×29 分页，便于对照拼装。",
    },
    { type: "h2", text: "图纸（pattern）" },
    {
      type: "p",
      text: "图纸是一张标注了每个位置应放哪种色号豆子的网格。大多数新手会先根据图纸把豆子摆到板上，再熨烫定型。本工具能根据照片自动生成对应品牌色号的图纸，并附带采购清单——一眼看出哪种颜色要买多少颗。",
    },
    { type: "h2", text: "色彩匹配" },
    {
      type: "p",
      text: "照片是连续色，而拼豆只能使用品牌调色板里固定的几十到一百多种色号，因此必须做「颜色量化」。本工具默认使用 CIEDE2000 感知色差算法，在色差、皮肤和过渡色上比简单 RGB 距离好得多；也可以开启抖动（dithering）以更丰富地表现渐变。",
    },
  ],
  "zh-TW": [
    {
      type: "p",
      text: "拼豆是一種把彩色塑膠豆按色號排列在帶凸點的洞板上，然後用熨斗加熱使其熔合成平面圖案的手工藝。成品像「像素畫」，常用於鑰匙圈、杯墊、裝飾畫和飾品。",
    },
    { type: "h2", text: "常見品牌" },
    {
      type: "p",
      text: "市面上常見的品牌有 Perler（美國）、Hama（丹麥）、Artkal（中國）、Nabbi（北歐）、MARD（日本）等。它們的豆子直徑通常為 5mm（mini）或 2.6mm（midi），不同品牌的色號並不互通，配色時需要對照對應的色板。",
    },
    { type: "h2", text: "拼豆板（pegboard）" },
    {
      type: "p",
      text: "標準的方形拼豆板大多為 29×29 個凸點。大圖紙通常由多個拼豆板拼接完成，燙完再用膠帶或再燙一次把幾塊板的成品黏在一起。本工具匯出 PDF 時可選擇按 29×29 分頁，方便對照拼裝。",
    },
    { type: "h2", text: "圖紙（pattern）" },
    {
      type: "p",
      text: "圖紙是一張標注了每個位置該放哪種色號豆子的網格。多數新手會先根據圖紙把豆子擺到板上，再燙製定型。本工具能根據照片自動產生對應品牌色號的圖紙，並附上採購清單——一眼看出哪種顏色要買多少顆。",
    },
    { type: "h2", text: "顏色匹配" },
    {
      type: "p",
      text: "照片是連續色，而拼豆只能使用品牌調色盤內固定的數十到一百多種色號，因此必須做「顏色量化」。本工具預設使用 CIEDE2000 感知色差演算法，在膚色、漸層等區域比簡單 RGB 距離好得多；也可以開啟抖動（dithering）以更豐富地表現漸層。",
    },
  ],
  en: [
    {
      type: "p",
      text: "Perler-style bead art (拼豆 / ironing beads / Hama beads) is a craft where you arrange small plastic beads on a peg-studded board, then fuse them together with an iron into a flat pixel-art image. Finished pieces are commonly used as keyrings, coasters, wall art, and jewelry.",
    },
    { type: "h2", text: "Common brands" },
    {
      type: "p",
      text: "The best-known brands are Perler (US), Hama (Denmark), Artkal (China), Nabbi (Nordic), and MARD (Japan). Beads typically come in 5 mm 'mini' or 2.6 mm 'midi' sizes, and each brand has its own SKU catalog — colors are not numerically compatible across brands.",
    },
    { type: "h2", text: "Pegboards" },
    {
      type: "p",
      text: "A standard square pegboard is 29×29 pegs. Larger designs are assembled from multiple boards, each ironed separately and then joined with tape or a second iron pass. This tool can export PDFs split into one-page-per-pegboard sections for easy physical assembly.",
    },
    { type: "h2", text: "Patterns" },
    {
      type: "p",
      text: "A pattern is a grid telling you which bead SKU goes in each cell. Most beginners lay the beads out following the pattern, then iron. The tool on this site generates a pattern from a photo in the SKUs of your chosen brand, and includes a shopping list so you know exactly how many of each color to buy.",
    },
    { type: "h2", text: "Color matching" },
    {
      type: "p",
      text: "Photos contain continuous color, but beads come from a fixed palette of 50–200 colors per brand. Quantization is therefore essential. By default this tool uses the perceptual CIEDE2000 color-difference metric — far better on skin tones and gradients than a naive RGB distance — with optional Floyd–Steinberg / Atkinson / Stucki / Burkes / Sierra dithering for smoother transitions.",
    },
  ],
};
