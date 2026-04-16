import { describe, it, expect } from "vitest";
import {
  localizedColorName,
  COLOR_NAME_TRANSLATIONS,
} from "@/i18n/colorNames";
import { allPalettes } from "@/data/palettes";

describe("localizedColorName", () => {
  it("returns the English name unchanged for the 'en' locale", () => {
    expect(localizedColorName("Robin Egg", "en")).toBe("Robin Egg");
  });

  it("translates common palette names to zh-CN", () => {
    expect(localizedColorName("White", "zh-CN")).toBe("白色");
    expect(localizedColorName("Black", "zh-CN")).toBe("黑色");
    expect(localizedColorName("Robin Egg", "zh-CN")).toBe("知更鸟蛋蓝");
    expect(localizedColorName("Olive", "zh-CN")).toBe("橄榄色");
  });

  it("translates to zh-TW using Traditional script", () => {
    expect(localizedColorName("Blue", "zh-TW")).toBe("藍色");
    expect(localizedColorName("Olive", "zh-TW")).toBe("橄欖色");
    expect(localizedColorName("Sky", "zh-TW")).toBe("天藍");
  });

  it("falls back to the original name for unknown keys", () => {
    expect(localizedColorName("NotARealName", "zh-CN")).toBe("NotARealName");
  });
});

describe("COLOR_NAME_TRANSLATIONS coverage", () => {
  // Every color name referenced in the shipped palettes must have a
  // translation entry — otherwise the inventory sidebar would render
  // mixed English/Chinese when the user has zh-CN selected.
  it("covers every color name in every shipped palette", () => {
    const missing: string[] = [];
    for (const palette of allPalettes) {
      for (const c of palette.colors) {
        if (!(c.name in COLOR_NAME_TRANSLATIONS)) {
          missing.push(`${palette.brand}: ${c.name}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("each entry has both zh-CN and zh-TW variants", () => {
    for (const [key, entry] of Object.entries(COLOR_NAME_TRANSLATIONS)) {
      expect(entry["zh-CN"], `${key} missing zh-CN`).toBeTruthy();
      expect(entry["zh-TW"], `${key} missing zh-TW`).toBeTruthy();
    }
  });
});
