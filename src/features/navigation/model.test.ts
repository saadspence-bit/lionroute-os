import { describe, expect, it } from "vitest";
import { COMPACT_NAVIGATION_QUERY, drawerFocusWrap } from "./model";

describe("compact navigation keyboard focus", () => {
  it("uses the same viewport threshold as the responsive shell", () => {
    expect(COMPACT_NAVIGATION_QUERY).toBe("(max-width: 900px)");
  });
  it("wraps forward Tab after the last navigation button", () => {
    expect(drawerFocusWrap(false, 11, 12, true)).toBe("first");
  });
  it("wraps Shift+Tab before the first navigation button", () => {
    expect(drawerFocusWrap(true, 0, 12, true)).toBe("last");
  });
  it("does not intercept normal middle-button navigation", () => {
    expect(drawerFocusWrap(false, 5, 12, true)).toBeNull();
    expect(drawerFocusWrap(true, 5, 12, true)).toBeNull();
  });
  it("recovers focus that fell outside the active drawer", () => {
    expect(drawerFocusWrap(false, -1, 12, false)).toBe("first");
    expect(drawerFocusWrap(true, -1, 12, false)).toBe("last");
  });
  it("handles zero or one focusable button without invalid indices", () => {
    expect(drawerFocusWrap(false, -1, 0, false)).toBeNull();
    expect(drawerFocusWrap(false, 0, 1, true)).toBe("first");
    expect(drawerFocusWrap(true, 0, 1, true)).toBe("last");
  });
});
