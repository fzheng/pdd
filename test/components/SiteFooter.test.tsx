import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { renderWithI18n } from "../helpers";

describe("SiteFooter", () => {
  it("renders the company copyright with the current year and SigmaPilot", () => {
    renderWithI18n(<SiteFooter />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${year}.*SigmaPilot`, "i")),
    ).toBeInTheDocument();
  });

  it("links to Terms, Privacy, and the 'What is Perler' explainer", () => {
    renderWithI18n(<SiteFooter />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/terms");
    expect(hrefs).toContain("/privacy");
    expect(hrefs).toContain("/learn/what-is-perler");
  });

  it("contains no decorative kawaii text ('made with heart' / emoji strip)", () => {
    const { container } = renderWithI18n(<SiteFooter />);
    // The old "用 ❤️ 做出来" tagline must not survive into the footer.
    expect(container.textContent).not.toMatch(/做出来|做出來|Made with/i);
    // And the bouncing emoji strip used to live in the header — verify it
    // didn't sneak into the footer either.
    expect(container.textContent).not.toMatch(/🧸|🌈|🍬|🐻/);
  });
});

describe("SiteHeader", () => {
  it("renders the title as a link back to home", () => {
    renderWithI18n(<SiteHeader />);
    const title = screen.getByRole("link", { name: /beadsnap|豆P/i });
    expect(title.getAttribute("href")).toBe("/");
  });

  it("no longer renders the bouncing kawaii emoji strip", () => {
    // The 🐻 / 🍬 emojis only ever lived inside the removed strip — they
    // don't appear in any translated title or tagline. If they're gone,
    // the strip is gone.
    const { container } = renderWithI18n(<SiteHeader />);
    expect(container.textContent).not.toMatch(/🐻|🍬/);
  });
});
