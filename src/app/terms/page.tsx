"use client";

import ArticleShell from "@/components/ArticleShell";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Terms of Service.
 *
 * This is a generic baseline appropriate for a free, client-side creative
 * tool. It should be replaced with counsel-reviewed copy before launch.
 */
export default function TermsPage() {
  const { locale } = useI18n();
  return (
    <ArticleShell
      title={TITLE[locale] ?? TITLE.en}
      updated={UPDATED[locale] ?? UPDATED.en}
    >
      {(BODY[locale] ?? BODY.en).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </ArticleShell>
  );
}

const TITLE = {
  "zh-CN": "服务条款",
  "zh-TW": "服務條款",
  en: "Terms of Service",
} as const;

const UPDATED = {
  "zh-CN": "更新日期：2026 年 4 月",
  "zh-TW": "更新日期：2026 年 4 月",
  en: "Last updated: April 2026",
} as const;

const BODY = {
  "zh-CN": [
    "欢迎使用 SigmaPilot, LLC 提供的豆P（BeadSnap，以下简称「本服务」）。使用本服务即表示您同意本《服务条款》。",
    "本服务为免费的在线工具，所有图片处理均在您的浏览器中本地完成，我们不会上传、储存或转售您提供的任何图像。",
    "您对上传至本服务的图片及其使用方式负全部责任。请勿使用您不拥有版权或合法授权的图片。",
    "本服务按「现状」提供。SigmaPilot, LLC 不对输出图纸的商业可用性、色彩精确度或与特定拼豆品牌的兼容性做出任何明示或暗示的保证。",
    "我们可能会不定期更新本条款。继续使用本服务即表示您接受更新后的版本。",
    "如有疑问，请通过本网站底部的联系方式与我们联系。",
  ],
  "zh-TW": [
    "歡迎使用 SigmaPilot, LLC 提供的豆P（BeadSnap，以下簡稱「本服務」）。使用本服務即表示您同意本《服務條款》。",
    "本服務為免費的線上工具，所有圖片處理均在您的瀏覽器中本機完成，我們不會上傳、儲存或轉售您提供的任何圖像。",
    "您對上傳至本服務的圖片及其使用方式負全部責任。請勿使用您不擁有版權或合法授權的圖片。",
    "本服務按「現狀」提供。SigmaPilot, LLC 不對輸出圖紙的商業可用性、色彩精確度或與特定拼豆品牌的相容性做出任何明示或暗示的保證。",
    "我們可能會不定期更新本條款。繼續使用本服務即表示您接受更新後的版本。",
    "如有疑問，請透過本網站底部的聯絡方式與我們聯絡。",
  ],
  en: [
    "Welcome to BeadSnap ('the Service'), provided by SigmaPilot, LLC. By using the Service you agree to these Terms of Service.",
    "The Service is a free in-browser tool. All image processing happens locally in your browser; we do not upload, store, or resell any images you provide.",
    "You are solely responsible for the images you upload and how you use the patterns the Service produces. Do not upload images you do not own or have the rights to use.",
    "The Service is provided 'as is'. SigmaPilot, LLC makes no express or implied warranty regarding commercial usability, color accuracy, or compatibility with any specific bead brand.",
    "We may update these Terms from time to time. Continued use of the Service constitutes acceptance of the updated Terms.",
    "For questions, use the contact details listed at the bottom of this site.",
  ],
} as const;
