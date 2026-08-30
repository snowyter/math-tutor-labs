// Pure coordinate-plane helpers shared by Graph and DragPlane.
// No CSS or React imports so this module is testable in a node environment.

export const TICK_MIN = -10;
export const TICK_MAX = 10;

/** Map a logical x (-10..10) to SVG x (10..410) in the 420-wide viewBox. */
export function sx(x: number): number {
  return 10 + (x + 10) * 20;
}

/** Map a logical y (-10..10) to SVG y (410..10), reversing the screen axis. */
export function sy(y: number): number {
  return 410 - (y + 10) * 20;
}

export type TickSet = {
  /** Every integer value from TICK_MIN to TICK_MAX — for tick marks. */
  ticks: number[];
  /** Even values only — for numeric labels, kept sparse to avoid crowding. */
  labels: number[];
};

/**
 * Returns the tick-mark values and label values for the coordinate plane.
 * Ticks are drawn at every integer; labels appear every two units so they
 * stay readable on both desktop and the narrower mobile graph.
 */
export function coordinateTickSet(): TickSet {
  const ticks: number[] = [];
  for (let v = TICK_MIN; v <= TICK_MAX; v += 1) ticks.push(v);
  const labels = ticks.filter((v) => v % 2 === 0);
  return { ticks, labels };
}
