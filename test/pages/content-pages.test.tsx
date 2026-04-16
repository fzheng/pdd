import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import TermsPage from "@/app/terms/page";
import PrivacyPage from "@/app/privacy/page";
import WhatIsPerlerPage from "@/app/learn/what-is-perler/page";
import { renderWithI18n } from "../helpers";

/**
 * Smoke tests for the three content pages. We aren't copy-checking the
 * legal prose — we just want to know each page renders, shows its
 * locale-appropriate title, and includes the shared footer links so the
 * user can navigate away.
 */
describe("Content pages", () => {
  it("Terms page renders the title and footer nav", () => {
    renderWithI18n(<TermsPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /terms|条款|條款/i,
    );
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toContain("/privacy");
  });

  it("Privacy page renders the title", () => {
    renderWithI18n(<PrivacyPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /privacy|隐私|隱私/i,
    );
  });

  it("What-is-Perler page renders the title + headings", () => {
    renderWithI18n(<WhatIsPerlerPage />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toMatch(
      /perler|拼豆/i,
    );
    // Expect at least one sub-heading (h2) — the article has several.
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(0);
  });
});
