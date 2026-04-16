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
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <article className="bg-white rounded-3xl border-4 border-pink-100 p-6 sm:p-8 shadow-sm prose prose-sm sm:prose-base max-w-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-pink-600 mb-1">
            {title}
          </h1>
          {updated && (
            <p className="text-xs text-gray-400 mb-6">{updated}</p>
          )}
          <div className="space-y-4 text-gray-700 leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
