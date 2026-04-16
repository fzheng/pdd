import { describe, it, expect } from "vitest";
import {
  emptyHistory,
  pushPattern,
  undo,
  redo,
  canUndo,
  canRedo,
} from "@/lib/history";
import { patternFrom, WHITE, BLACK, RED } from "../fixtures";

describe("PatternHistory", () => {
  it("empty has no present and forbids undo/redo", () => {
    const h = emptyHistory();
    expect(h.present).toBeNull();
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(false);
  });

  it("pushing the first pattern keeps past empty (nothing to undo to)", () => {
    const h = pushPattern(emptyHistory(), patternFrom([[WHITE]]));
    expect(h.present).not.toBeNull();
    expect(h.past).toHaveLength(0);
    expect(canUndo(h)).toBe(false);
  });

  it("undo/redo roundtrip", () => {
    const a = patternFrom([[WHITE]]);
    const b = patternFrom([[BLACK]]);
    const c = patternFrom([[RED]]);
    let h = pushPattern(emptyHistory(), a);
    h = pushPattern(h, b);
    h = pushPattern(h, c);
    expect(h.present?.cells[0][0].beadColor.id).toBe("r");
    expect(canUndo(h)).toBe(true);

    h = undo(h);
    expect(h.present?.cells[0][0].beadColor.id).toBe("bk");
    h = undo(h);
    expect(h.present?.cells[0][0].beadColor.id).toBe("w");
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(true);

    h = redo(h);
    expect(h.present?.cells[0][0].beadColor.id).toBe("bk");
    h = redo(h);
    expect(h.present?.cells[0][0].beadColor.id).toBe("r");
    expect(canRedo(h)).toBe(false);
  });

  it("push after undo discards redo stack", () => {
    let h = pushPattern(emptyHistory(), patternFrom([[WHITE]]));
    h = pushPattern(h, patternFrom([[BLACK]]));
    h = undo(h);
    expect(canRedo(h)).toBe(true);
    h = pushPattern(h, patternFrom([[RED]]));
    expect(h.future).toHaveLength(0);
    expect(canRedo(h)).toBe(false);
  });

  it("caps past at `limit`", () => {
    let h = emptyHistory();
    for (let i = 0; i < 50; i++) {
      h = pushPattern(h, patternFrom([[WHITE]]), 5);
    }
    expect(h.past.length).toBeLessThanOrEqual(5);
  });

  it("undo on empty history is a no-op", () => {
    const h = emptyHistory();
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });
});
