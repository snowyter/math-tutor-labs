import { describe, it, expect } from 'vitest';
import { coordinateTickSet, sx, sy, TICK_MIN, TICK_MAX } from './coordinates';

describe('coordinateTickSet', () => {
  it('places a tick at every integer from -10 to 10', () => {
    const { ticks } = coordinateTickSet();
    expect(ticks).toHaveLength(21);
    expect(ticks[0]).toBe(-10);
    expect(ticks.at(-1)).toBe(10);
    // every value is an integer
    expect(ticks.every((v) => Number.isInteger(v))).toBe(true);
  });

  it('labels only even values so labels stay sparse', () => {
    const { labels } = coordinateTickSet();
    expect(labels.every((v) => v % 2 === 0)).toBe(true);
    // origin is included as a label
    expect(labels).toContain(0);
    // both endpoints are labelled
    expect(labels).toContain(-10);
    expect(labels).toContain(10);
  });
});

describe('coordinate mapping', () => {
  it('maps the logical range to the 420-wide SVG viewBox', () => {
    expect(sx(TICK_MIN)).toBe(10);
    expect(sx(TICK_MAX)).toBe(410);
    expect(sx(0)).toBe(210);
    expect(sy(TICK_MAX)).toBe(10);
    expect(sy(TICK_MIN)).toBe(410);
    expect(sy(0)).toBe(210);
  });
});
