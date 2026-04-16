import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { I18nProvider } from "@/i18n/I18nProvider";

/**
 * Wrap a component under test with the I18nProvider so `useI18n` works.
 * All component tests should use this instead of RTL's `render` directly.
 */
export function renderWithI18n(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    ...options,
  });
}
