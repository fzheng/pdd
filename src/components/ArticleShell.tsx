"use client";

import { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Shared page shell for content pages (Terms, Privacy, explainers).
 * Keeps the header / footer identical to the home page without each
 * content file having to re-implement the chrome.
 */
export default function ArticleShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-10">
        <article className="card p-6 sm:p-10 prose prose-sm sm:prose-base max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:text-ink prose-headings:tracking-[-0.02em] prose-a:text-coral prose-a:no-underline hover:prose-a:underline prose-strong:text-ink">
          <h1 className="display text-[2.25rem] sm:text-[2.75rem] text-ink leading-[1] m-0 not-prose">
            {title}
          </h1>
          {updated && (
            <p className="text-[0.85rem] text-ink-soft mt-3 mb-8 not-prose">
              {updated}
            </p>
          )}
          <div className="space-y-4 text-ink-2 leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
