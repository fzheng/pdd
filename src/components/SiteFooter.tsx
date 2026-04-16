"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Site-wide footer. Minimal on purpose — legal links, a pointer to the
 * "What is Perler / 拼豆?" explainer for newcomers, and the company
 * copyright line. No decorative emoji; this should recede visually so
 * the primary workflow (pattern generation) stays the focal point.
 */
export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-pink-100 bg-white/70 backdrop-blur mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/learn/what-is-perler" className="hover:text-pink-500 transition-colors">
            {t("footer.whatIsPerler")}
          </Link>
          <Link href="/terms" className="hover:text-pink-500 transition-colors">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-pink-500 transition-colors">
            {t("footer.privacy")}
          </Link>
        </nav>
        <div className="text-gray-400">
          © {year} SigmaPilot, LLC. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
