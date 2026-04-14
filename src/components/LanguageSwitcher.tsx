"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { Locale } from "@/types";
import { LOCALES } from "@/i18n/dictionary";

const labels: Record<Locale, string> = {
  "zh-CN": "中",
  "zh-TW": "繁",
  en: "EN",
};

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="inline-flex rounded-full bg-white/80 backdrop-blur p-1 border-2 border-pink-200 shadow-sm">
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            title={t(l === "en" ? "lang.en" : l === "zh-CN" ? "lang.zhCN" : "lang.zhTW")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              active
                ? "bg-pink-400 text-white shadow"
                : "text-pink-500 hover:bg-pink-100"
            }`}
          >
            {labels[l]}
          </button>
        );
      })}
    </div>
  );
}
