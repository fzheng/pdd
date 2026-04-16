"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Site-wide header. The title is a link back to the home page so users on
 * content pages (Terms, Privacy, explainer articles) can always return to
 * the tool.
 */
export default function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b-2 border-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="group">
          {/* Deliberately not an <h1>: content pages (Terms, Privacy, articles)
              each render their own article-level h1 below. The site title
              functions more like a logo than a page heading. */}
          <div className="text-xl sm:text-2xl font-extrabold text-pink-600 leading-tight group-hover:text-pink-700 transition-colors">
            {t("app.title")}
          </div>
          <p className="text-xs sm:text-sm text-purple-400 -mt-0.5">
            {t("app.tagline")}
          </p>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
