import { Locale } from "@/types";

export type TranslationKey =
  | "app.title"
  | "app.tagline"
  | "upload.drop"
  | "upload.replace"
  | "upload.swap"
  | "upload.formats"
  | "controls.gridSize"
  | "controls.advanced"
  | "controls.palette"
  | "controls.algorithm"
  | "controls.algorithm.rgb"
  | "controls.algorithm.cielab"
  | "controls.algorithm.ciede2000"
  | "controls.dithering"
  | "controls.dithering.none"
  | "controls.dithering.fs"
  | "controls.dithering.atkinson"
  | "controls.dithering.stucki"
  | "controls.dithering.burkes"
  | "controls.dithering.sierra"
  | "controls.maxColors"
  | "controls.maxColors.all"
  | "controls.maxColors.n"
  | "controls.mirror"
  | "controls.saturation"
  | "controls.despeckle"
  | "controls.generate"
  | "controls.generating"
  | "controls.staleHint"
  | "preview.original"
  | "preview.pattern"
  | "preview.uploadPrompt"
  | "preview.patternPrompt"
  | "preview.comparison"
  | "preview.openCompare"
  | "preview.shape.circle"
  | "preview.shape.square"
  | "preview.labels"
  | "editor.undo"
  | "editor.redo"
  | "editor.brush"
  | "editor.replace"
  | "editor.pickColor"
  | "editor.replacePrompt"
  | "editor.reset"
  | "inventory.title"
  | "inventory.colors"
  | "inventory.beadsTotal"
  | "inventory.color"
  | "inventory.name"
  | "inventory.sku"
  | "inventory.count"
  | "sidebar.collapse"
  | "sidebar.expand"
  | "sidebar.openColors"
  | "crop.title"
  | "crop.hint"
  | "crop.confirm"
  | "compare.hint"
  | "common.close"
  | "common.cancel"
  | "common.working"
  | "export.png"
  | "export.pdf"
  | "export.title"
  | "export.generating"
  | "export.cellSize"
  | "export.splitByPegboard"
  | "export.showCodes"
  | "pdf.size"
  | "pdf.totalBeads"
  | "pdf.colorsCount"
  | "pdf.pegboards"
  | "pdf.shoppingList"
  | "pdf.col.swatch"
  | "pdf.col.name"
  | "pdf.col.sku"
  | "pdf.col.brand"
  | "pdf.col.count"
  | "pdf.board"
  | "pdf.boardOf"
  | "pdf.beadRange"
  | "footer.madeWith"
  | "footer.terms"
  | "footer.privacy"
  | "footer.whatIsPerler"
  | "footer.rights"
  | "lang.en"
  | "lang.zhCN"
  | "lang.zhTW"
  | "hero.headlineA"
  | "hero.headlineB"
  | "preview.altSource"
  | "focus.enter"
  | "focus.exit"
  | "focus.title"
  | "focus.colorPickerTitle"
  | "focus.toolbarShape"
  | "focus.toolbarLabels";

type Dict = Record<TranslationKey, string>;

const zhCN: Dict = {
  "app.title": "豆P",
  "app.tagline": "P一张照片，变成拼豆图纸 ✨",
  "upload.drop": "把图片拖到这里，或者点一下选择图片",
  "upload.replace": "点这里换一张",
  "upload.swap": "换一张",
  "upload.formats": "支持 JPEG 和 PNG 格式",
  "controls.gridSize": "图纸尺寸（方形）",
  "controls.advanced": "高级设置",
  "controls.palette": "豆豆品牌",
  "controls.algorithm": "颜色匹配",
  "controls.algorithm.rgb": "RGB（快速）",
  "controls.algorithm.cielab": "CIELAB（准确）",
  "controls.algorithm.ciede2000": "CIEDE2000（最准）",
  "controls.dithering": "抖动算法",
  "controls.dithering.none": "不使用",
  "controls.dithering.fs": "Floyd–Steinberg",
  "controls.dithering.atkinson": "Atkinson",
  "controls.dithering.stucki": "Stucki",
  "controls.dithering.burkes": "Burkes",
  "controls.dithering.sierra": "Sierra",
  "controls.maxColors": "使用颜色数",
  "controls.maxColors.all": "全部",
  "controls.maxColors.n": "{n} 色",
  "controls.mirror": "镜像（方便烫图）",
  "controls.saturation": "饱和度",
  "controls.despeckle": "背景清理",
  "controls.generate": "✨ 生成图纸",
  "controls.generating": "生成中…",
  "controls.staleHint": "设置已改变，点击 ✨ 生成图纸 应用新设置",
  "preview.original": "原图",
  "preview.pattern": "拼豆图纸",
  "preview.uploadPrompt": "上传一张图片开始吧～",
  "preview.patternPrompt": "图纸会显示在这里 🎨",
  "preview.comparison": "对比滑块",
  "preview.openCompare": "点击对比",
  "preview.shape.circle": "圆豆",
  "preview.shape.square": "方格",
  "preview.labels": "图纸上显示色号",
  "editor.undo": "撤销",
  "editor.redo": "重做",
  "editor.brush": "画笔",
  "editor.replace": "颜色替换",
  "editor.pickColor": "选择颜色",
  "editor.replacePrompt": "点击要替换的颜色",
  "editor.reset": "重置",
  "inventory.title": "豆豆清单",
  "inventory.colors": "{n} 种颜色",
  "inventory.beadsTotal": "共 {n} 颗",
  "inventory.color": "颜色",
  "inventory.name": "名称",
  "inventory.sku": "编号",
  "inventory.count": "数量",
  "sidebar.collapse": "折叠侧边栏",
  "sidebar.expand": "展开侧边栏",
  "sidebar.openColors": "色号清单",
  "crop.title": "裁剪为正方形",
  "crop.hint": "拖动移动位置，使用滑块缩放，选择你要的方形区域",
  "crop.confirm": "确认裁剪",
  "compare.hint": "左右拖动来对比原图与拼豆图",
  "common.close": "关闭",
  "common.cancel": "取消",
  "common.working": "处理中…",
  "export.png": "📷 导出 PNG",
  "export.pdf": "📄 导出 PDF",
  "export.title": "导出",
  "export.generating": "导出中…",
  "export.cellSize": "每格毫米数",
  "export.splitByPegboard": "按 29×29 拼豆板分页（方便实际拼装）",
  "export.showCodes": "在每颗豆豆上显示色号",
  "pdf.size": "尺寸：{w} × {h} 颗豆豆",
  "pdf.totalBeads": "总豆数：{n}",
  "pdf.colorsCount": "颜色数：{n}",
  "pdf.pegboards": "拼豆板（{size}×{size}）：{cols} × {rows}",
  "pdf.shoppingList": "🛒 豆豆采购清单",
  "pdf.col.swatch": "颜色",
  "pdf.col.name": "名称",
  "pdf.col.sku": "编号",
  "pdf.col.brand": "品牌",
  "pdf.col.count": "数量",
  "pdf.board": "板",
  "pdf.boardOf": "第 {r}-{c} 块 / 共 {rows}×{cols}",
  "pdf.beadRange": "豆豆范围：列 {x0}–{x1}，行 {y0}–{y1}",
  "footer.madeWith": "用 ❤️ 做出来",
  "footer.terms": "服务条款",
  "footer.privacy": "隐私政策",
  "footer.whatIsPerler": "什么是拼豆？",
  "footer.rights": "保留所有权利。",
  "lang.en": "English",
  "lang.zhCN": "简体中文",
  "lang.zhTW": "繁體中文",
  "hero.headlineA": "一张照片，",
  "hero.headlineB": "变成豆豆。",
  "preview.altSource": "原图预览",
  "focus.enter": "专注模式",
  "focus.exit": "退出专注",
  "focus.title": "专注模式",
  "focus.colorPickerTitle": "选择颜色",
  "focus.toolbarShape": "豆型",
  "focus.toolbarLabels": "显示色号",
};

const zhTW: Dict = {
  "app.title": "豆P",
  "app.tagline": "P一張照片，變成拼豆圖紙 ✨",
  "upload.drop": "把圖片拖到這裡，或者點一下選擇圖片",
  "upload.replace": "點這裡換一張",
  "upload.swap": "換一張",
  "upload.formats": "支援 JPEG 和 PNG 格式",
  "controls.gridSize": "圖紙尺寸（方形）",
  "controls.advanced": "進階設定",
  "controls.palette": "豆豆品牌",
  "controls.algorithm": "顏色匹配",
  "controls.algorithm.rgb": "RGB（快速）",
  "controls.algorithm.cielab": "CIELAB（準確）",
  "controls.algorithm.ciede2000": "CIEDE2000（最準）",
  "controls.dithering": "抖動演算法",
  "controls.dithering.none": "不使用",
  "controls.dithering.fs": "Floyd–Steinberg",
  "controls.dithering.atkinson": "Atkinson",
  "controls.dithering.stucki": "Stucki",
  "controls.dithering.burkes": "Burkes",
  "controls.dithering.sierra": "Sierra",
  "controls.maxColors": "使用顏色數",
  "controls.maxColors.all": "全部",
  "controls.maxColors.n": "{n} 色",
  "controls.mirror": "鏡像（方便燙圖）",
  "controls.saturation": "飽和度",
  "controls.despeckle": "背景清理",
  "controls.generate": "✨ 產生圖紙",
  "controls.generating": "產生中…",
  "controls.staleHint": "設定已改變，點擊 ✨ 產生圖紙 套用新設定",
  "preview.original": "原圖",
  "preview.pattern": "拼豆圖紙",
  "preview.uploadPrompt": "上傳一張圖片開始吧～",
  "preview.patternPrompt": "圖紙會顯示在這裡 🎨",
  "preview.comparison": "對比滑桿",
  "preview.openCompare": "點擊對比",
  "preview.shape.circle": "圓豆",
  "preview.shape.square": "方格",
  "preview.labels": "圖紙上顯示色號",
  "editor.undo": "復原",
  "editor.redo": "重做",
  "editor.brush": "畫筆",
  "editor.replace": "顏色替換",
  "editor.pickColor": "選擇顏色",
  "editor.replacePrompt": "點擊要替換的顏色",
  "editor.reset": "重設",
  "inventory.title": "豆豆清單",
  "inventory.colors": "{n} 種顏色",
  "inventory.beadsTotal": "共 {n} 顆",
  "inventory.color": "顏色",
  "inventory.name": "名稱",
  "inventory.sku": "編號",
  "inventory.count": "數量",
  "sidebar.collapse": "收合側邊欄",
  "sidebar.expand": "展開側邊欄",
  "sidebar.openColors": "色號清單",
  "crop.title": "裁切為正方形",
  "crop.hint": "拖動移動位置，使用滑桿縮放，選擇你要的方形區域",
  "crop.confirm": "確認裁切",
  "compare.hint": "左右拖動來對比原圖與拼豆圖",
  "common.close": "關閉",
  "common.cancel": "取消",
  "common.working": "處理中…",
  "export.png": "📷 匯出 PNG",
  "export.pdf": "📄 匯出 PDF",
  "export.title": "匯出",
  "export.generating": "匯出中…",
  "export.cellSize": "每格毫米數",
  "export.splitByPegboard": "依 29×29 拼豆板分頁（方便實際拼裝）",
  "export.showCodes": "在每顆豆豆上顯示色號",
  "pdf.size": "尺寸：{w} × {h} 顆豆豆",
  "pdf.totalBeads": "總豆數：{n}",
  "pdf.colorsCount": "顏色數：{n}",
  "pdf.pegboards": "拼豆板（{size}×{size}）：{cols} × {rows}",
  "pdf.shoppingList": "🛒 豆豆採購清單",
  "pdf.col.swatch": "顏色",
  "pdf.col.name": "名稱",
  "pdf.col.sku": "編號",
  "pdf.col.brand": "品牌",
  "pdf.col.count": "數量",
  "pdf.board": "板",
  "pdf.boardOf": "第 {r}-{c} 塊 / 共 {rows}×{cols}",
  "pdf.beadRange": "豆豆範圍：列 {x0}–{x1}，行 {y0}–{y1}",
  "footer.madeWith": "用 ❤️ 做出來",
  "footer.terms": "服務條款",
  "footer.privacy": "隱私政策",
  "footer.whatIsPerler": "什麼是拼豆？",
  "footer.rights": "保留所有權利。",
  "lang.en": "English",
  "lang.zhCN": "简体中文",
  "lang.zhTW": "繁體中文",
  "hero.headlineA": "一張照片，",
  "hero.headlineB": "變成豆豆。",
  "preview.altSource": "原圖預覽",
  "focus.enter": "專注模式",
  "focus.exit": "退出專注",
  "focus.title": "專注模式",
  "focus.colorPickerTitle": "選擇顏色",
  "focus.toolbarShape": "豆型",
  "focus.toolbarLabels": "顯示色號",
};

const en: Dict = {
  "app.title": "BeadSnap",
  "app.tagline": "Snap a photo, get a bead pattern ✨",
  "upload.drop": "Drop an image here, or tap to pick one",
  "upload.replace": "Tap to swap for a different one",
  "upload.swap": "Swap image",
  "upload.formats": "JPEG or PNG",
  "controls.gridSize": "Pattern size (square)",
  "controls.advanced": "Advanced settings",
  "controls.palette": "Bead Brand",
  "controls.algorithm": "Color Match",
  "controls.algorithm.rgb": "RGB (fast)",
  "controls.algorithm.cielab": "CIELAB (accurate)",
  "controls.algorithm.ciede2000": "CIEDE2000 (best)",
  "controls.dithering": "Dithering",
  "controls.dithering.none": "None",
  "controls.dithering.fs": "Floyd–Steinberg",
  "controls.dithering.atkinson": "Atkinson",
  "controls.dithering.stucki": "Stucki",
  "controls.dithering.burkes": "Burkes",
  "controls.dithering.sierra": "Sierra",
  "controls.maxColors": "Colors to use",
  "controls.maxColors.all": "All",
  "controls.maxColors.n": "{n} colors",
  "controls.mirror": "Mirror (for ironing)",
  "controls.saturation": "Saturation",
  "controls.despeckle": "Background cleanup",
  "controls.generate": "✨ Make Pattern",
  "controls.generating": "Working magic…",
  "controls.staleHint": "Settings changed — hit ✨ Make Pattern to apply",
  "preview.original": "Photo",
  "preview.pattern": "Bead Pattern",
  "preview.uploadPrompt": "Upload a photo to start ~",
  "preview.patternPrompt": "Your pattern will appear here 🎨",
  "preview.comparison": "Slide to compare",
  "preview.openCompare": "Click to compare",
  "preview.shape.circle": "Beads",
  "preview.shape.square": "Grid",
  "preview.labels": "Show SKU on pattern",
  "editor.undo": "Undo",
  "editor.redo": "Redo",
  "editor.brush": "Brush",
  "editor.replace": "Replace Color",
  "editor.pickColor": "Pick a color",
  "editor.replacePrompt": "Tap a color to replace",
  "editor.reset": "Reset",
  "inventory.title": "Bead Shopping List",
  "inventory.colors": "{n} colors",
  "inventory.beadsTotal": "{n} beads total",
  "inventory.color": "Color",
  "inventory.name": "Name",
  "inventory.sku": "SKU",
  "inventory.count": "Count",
  "sidebar.collapse": "Collapse sidebar",
  "sidebar.expand": "Expand sidebar",
  "sidebar.openColors": "Colors",
  "crop.title": "Crop to square",
  "crop.hint": "Drag to pan, use the slider to zoom, and pick the square you want",
  "crop.confirm": "Crop",
  "compare.hint": "Drag left/right to compare the original photo with the bead pattern",
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.working": "Working…",
  "export.png": "📷 Save PNG",
  "export.pdf": "📄 Save PDF",
  "export.title": "Export",
  "export.generating": "Exporting…",
  "export.cellSize": "mm per bead",
  "export.splitByPegboard": "Split into 29×29 pegboard pages (for physical assembly)",
  "export.showCodes": "Print SKU on every bead",
  "pdf.size": "Size: {w} × {h} beads",
  "pdf.totalBeads": "Total beads: {n}",
  "pdf.colorsCount": "Colors: {n}",
  "pdf.pegboards": "Pegboards ({size}×{size}): {cols} × {rows}",
  "pdf.shoppingList": "🛒 Shopping List",
  "pdf.col.swatch": "Color",
  "pdf.col.name": "Name",
  "pdf.col.sku": "SKU",
  "pdf.col.brand": "Brand",
  "pdf.col.count": "Count",
  "pdf.board": "Board",
  "pdf.boardOf": "Board {r}-{c} of {rows}×{cols}",
  "pdf.beadRange": "Bead range: cols {x0}–{x1}, rows {y0}–{y1}",
  "footer.madeWith": "Made with ❤️",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.whatIsPerler": "What is Perler / 拼豆?",
  "footer.rights": "All rights reserved.",
  "lang.en": "English",
  "lang.zhCN": "简体中文",
  "lang.zhTW": "繁體中文",
  "hero.headlineA": "A photo, ",
  "hero.headlineB": "beaded.",
  "preview.altSource": "Source preview",
  "focus.enter": "Focus",
  "focus.exit": "Exit focus",
  "focus.title": "Focus mode",
  "focus.colorPickerTitle": "Pick a color",
  "focus.toolbarShape": "Shape",
  "focus.toolbarLabels": "Labels",
};

const dicts: Record<Locale, Dict> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  en,
};

/**
 * Translate a key with optional `{varName}` interpolation.
 * Falls back to the zh-CN entry, then to the key itself, for safety.
 */
export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  let s = dicts[locale][key] ?? dicts["zh-CN"][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export const LOCALES: Locale[] = ["zh-CN", "zh-TW", "en"];
export const DEFAULT_LOCALE: Locale = "zh-CN";
