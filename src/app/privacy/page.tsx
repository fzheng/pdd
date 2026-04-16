"use client";

import ArticleShell from "@/components/ArticleShell";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Privacy Policy.
 *
 * The privacy story here is simple on purpose: everything is processed
 * client-side, we store nothing, and the only persistent state is the
 * user's locale choice in localStorage.
 */
export default function PrivacyPage() {
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
  "zh-CN": "隐私政策",
  "zh-TW": "隱私政策",
  en: "Privacy Policy",
} as const;

const UPDATED = {
  "zh-CN": "更新日期：2026 年 4 月",
  "zh-TW": "更新日期：2026 年 4 月",
  en: "Last updated: April 2026",
} as const;

const BODY = {
  "zh-CN": [
    "SigmaPilot, LLC 尊重您的隐私。本政策说明我们在运营本服务时如何收集、使用和保护您的数据。",
    "图片数据：您上传的图片仅在您的浏览器本地处理，不会发送到任何服务器，亦不会被我们保存。关闭浏览器标签即会清除所有图片痕迹。",
    "本地储存：我们仅在浏览器的 localStorage 中保存您选择的界面语言（例如「简体中文」），以便下次访问时自动恢复。此数据不离开您的设备。",
    "Cookies 与分析工具：目前本服务不使用第三方分析脚本，也不投放 Cookies。若未来引入相关工具，本政策将同步更新并清楚告知。",
    "儿童隐私：本服务不针对 13 岁以下儿童，且不会主动收集其个人信息。",
    "如对本政策有任何疑问或希望联系我们，请通过页面底部的链接留言。",
  ],
  "zh-TW": [
    "SigmaPilot, LLC 尊重您的隱私。本政策說明我們在營運本服務時如何收集、使用和保護您的資料。",
    "圖片資料：您上傳的圖片僅在您的瀏覽器本機處理，不會傳送至任何伺服器，亦不會被我們儲存。關閉瀏覽器分頁即會清除所有圖片痕跡。",
    "本機儲存：我們僅在瀏覽器的 localStorage 中儲存您選擇的介面語言（例如「繁體中文」），以便下次造訪時自動還原。此資料不會離開您的裝置。",
    "Cookies 與分析工具：目前本服務未使用第三方分析腳本，也不投放 Cookies。若未來引入相關工具，本政策將同步更新並清楚告知。",
    "兒童隱私：本服務不針對 13 歲以下兒童，且不會主動收集其個人資訊。",
    "如對本政策有任何疑問或希望聯絡我們，請透過頁面底部的連結留言。",
  ],
  en: [
    "SigmaPilot, LLC respects your privacy. This policy explains what data we collect, how we use it, and how we protect it when you use the Service.",
    "Image data: images you upload are processed entirely in your browser. They are never sent to a server and never stored by us. Closing the browser tab removes all trace of them.",
    "Local storage: we store only your chosen interface language (e.g. 'English') in your browser's localStorage so your selection is remembered on your next visit. That data never leaves your device.",
    "Cookies and analytics: we do not currently use any third-party analytics or cookies. If we introduce such tools in the future, this policy will be updated accordingly.",
    "Children's privacy: the Service is not directed at children under 13 and we do not knowingly collect their personal information.",
    "If you have questions about this policy or need to contact us, use the links in the footer.",
  ],
} as const;
