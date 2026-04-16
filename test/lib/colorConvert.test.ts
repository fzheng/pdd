import { describe, it, expect } from "vitest";
import {
  srgbToLinear,
  linearToSrgb,
  rgbToLab,
  ciede2000,
} from "@/lib/colorConvert";

describe("srgbToLinear / linearToSrgb", () => {
  it("handles the extremes as pure 0 and 1", () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(255)).toBeCloseTo(1, 6);
  });

  it("is a near-identity across a roundtrip", () => {
    for (const v of [0, 8, 32, 64, 128, 200, 255]) {
      expect(linearToSrgb(srgbToLinear(v))).toBe(v);
    }
  });

  it("uses the linear segment below the cutoff", () => {
    // Values in the linear segment should be c/255/12.92 exactly.
    const v = 5;
    expect(srgbToLinear(v)).toBeCloseTo(v / 255 / 12.92, 10);
  });

  it("clamps output of linearToSrgb to 0..255", () => {
    expect(linearToSrgb(2)).toBe(255);
    expect(linearToSrgb(-1)).toBe(0);
  });
});

describe("rgbToLab", () => {
  it("maps pure white to L≈100 with near-zero a,b", () => {
    const { L, a, b } = rgbToLab(255, 255, 255);
    expect(L).toBeGreaterThan(99);
    expect(Math.abs(a)).toBeLessThan(1);
    expect(Math.abs(b)).toBeLessThan(1);
  });

  it("maps pure black to L≈0", () => {
    const { L } = rgbToLab(0, 0, 0);
    expect(L).toBeLessThan(1);
  });

  it("pure red has positive a*", () => {
    const { a } = rgbToLab(255, 0, 0);
    expect(a).toBeGreaterThan(50);
  });

  it("pure blue has very negative b*", () => {
    const { b } = rgbToLab(0, 0, 255);
    expect(b).toBeLessThan(-50);
  });
});

describe("ciede2000", () => {
  it("returns 0 for identical colors", () => {
    const lab = rgbToLab(120, 80, 40);
    expect(ciede2000(lab, lab)).toBe(0);
  });

  it("is symmetric (swapping args gives the same result)", () => {
    const a = rgbToLab(200, 10, 30);
    const b = rgbToLab(10, 180, 40);
    expect(ciede2000(a, b)).toBeCloseTo(ciede2000(b, a), 6);
  });

  it("treats very different colors as larger distance than similar ones", () => {
    const red = rgbToLab(255, 0, 0);
    const pink = rgbToLab(240, 30, 20);
    const green = rgbToLab(0, 255, 0);
    expect(ciede2000(red, green)).toBeGreaterThan(ciede2000(red, pink));
  });

  it("handles the grey-axis case (C1*C2 == 0) without NaN", () => {
    const greyA = rgbToLab(127, 127, 127);
    const greyB = rgbToLab(200, 200, 200);
    const d = ciede2000(greyA, greyB);
    expect(Number.isFinite(d)).toBe(true);
    expect(d).toBeGreaterThan(0);
  });
});
