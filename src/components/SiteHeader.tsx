"use client";

import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Minimal site header — a quiet bead-dot mark on the left, language pills on
 * the right. No taglines, no marquees. The workspace is the star; the
 * chrome stays out of the way.
 */
export default function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 bg-[color:var(--paper)]/85 backdrop-blur border-b border-[color:var(--hairline)]">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-3">
          <span
            aria-hidden
            className="relative w-9 h-9 shrink-0 rounded-full grid grid-cols-2 grid-rows-2 gap-[3px] p-[4px] bg-paper-2 transition-transform group-hover:rotate-[10deg]"
          >
            <span className="rounded-full bg-coral" />
            <span className="rounded-full bg-blue" />
            <span className="rounded-full bg-butter" />
            <span className="rounded-full bg-lime" />
          </span>
          <span className="display text-[1.5rem] text-ink leading-none tracking-[-0.03em]">
            {t("app.title")}
          </span>
        </Link>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
