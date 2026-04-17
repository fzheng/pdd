"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Minimal footer — fades back so the workspace is the star.
 */
export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[color:var(--hairline)]">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[0.82rem] text-ink-soft">
        <div>
          © {year} SigmaPilot, LLC
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/learn/what-is-perler" className="hover:text-ink transition-colors">
            {t("footer.whatIsPerler")}
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors">
            {t("footer.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            {t("footer.privacy")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
