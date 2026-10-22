/** Public UI only: compact navigation is a visual/keyboard control, not an action broker. */
export const COMPACT_NAVIGATION_QUERY = "(max-width: 900px)";

export type DrawerFocusTarget = "first" | "last" | null;

/** Keep keyboard Tab focus inside an open compact drawer without trapping other pages. */
export function drawerFocusWrap(
  shiftKey: boolean,
  activeIndex: number,
  itemCount: number,
  focusedInsideDrawer: boolean,
): DrawerFocusTarget {
  if (itemCount < 1) return null;
  if (!focusedInsideDrawer) return shiftKey ? "last" : "first";
  if (shiftKey && activeIndex === 0) return "last";
  if (!shiftKey && activeIndex === itemCount - 1) return "first";
  return null;
}
