import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";
import { renderWithI18n } from "../helpers";

function TitleUnderLocale() {
  const { t } = useI18n();
  return <div data-testid="title">{t("app.title")}</div>;
}

describe("LanguageSwitcher", () => {
  it("renders three language pills", () => {
    renderWithI18n(<LanguageSwitcher />);
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.getByText("中")).toBeInTheDocument();
    expect(screen.getByText("繁")).toBeInTheDocument();
  });

  it("switching locale updates context-consuming children", () => {
    renderWithI18n(
      <>
        <LanguageSwitcher />
        <TitleUnderLocale />
      </>,
    );
    expect(screen.getByTestId("title").textContent).toMatch(/豆P/);
    fireEvent.click(screen.getByText("EN"));
    expect(screen.getByTestId("title").textContent).toMatch(/BeadSnap/);
    fireEvent.click(screen.getByText("繁"));
    expect(screen.getByTestId("title").textContent).toMatch(/豆P/);
  });
});
