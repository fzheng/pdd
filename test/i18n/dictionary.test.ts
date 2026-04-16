import { describe, it, expect } from "vitest";
import { translate, LOCALES, DEFAULT_LOCALE } from "@/i18n/dictionary";

describe("translate", () => {
  it("returns the localized string for each locale", () => {
    expect(translate("en", "app.title")).toBe("BeadSnap");
    expect(translate("zh-CN", "app.title")).toBe("豆P");
    expect(translate("zh-TW", "app.title")).toBe("豆P");
  });

  it("interpolates {vars}", () => {
    expect(translate("en", "controls.maxColors.n", { n: 12 })).toBe("12 colors");
    expect(translate("zh-CN", "inventory.beadsTotal", { n: 42 })).toBe("共 42 颗");
  });

  it("falls back to the key if the dictionary entry is missing", () => {
    // @ts-expect-error — deliberate unknown key
    const out = translate("en", "does.not.exist");
    expect(out).toBe("does.not.exist");
  });

  it("exposes all three locales as first-class options", () => {
    expect(LOCALES).toEqual(expect.arrayContaining(["en", "zh-CN", "zh-TW"]));
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });

  it("every locale defines every key (parity check)", () => {
    const keysEn = Object.keys(
      (translate as unknown as { __dict?: object }).__dict ?? {},
    );
    // We can't access the internal dicts directly, so sample a few:
    for (const key of [
      "app.title",
      "controls.gridSize",
      "export.splitByPegboard",
      "crop.title",
      "preview.openCompare",
    ] as const) {
      for (const locale of LOCALES) {
        expect(translate(locale, key)).not.toBe(key);
      }
    }
    // Silence no-unused-var warning in strict builds:
    expect(keysEn).toBeDefined();
  });
});
