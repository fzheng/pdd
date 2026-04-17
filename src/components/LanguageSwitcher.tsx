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
    <div className="inline-flex items-center gap-1 rounded-full bg-paper-2 p-1">
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            title={t(l === "en" ? "lang.en" : l === "zh-CN" ? "lang.zhCN" : "lang.zhTW")}
            className={`px-3 min-w-[40px] h-8 rounded-full text-[0.8rem] font-medium transition-colors ${
              active
                ? "bg-ink text-paper"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {labels[l]}
          </button>
        );
      })}
    </div>
  );
}
