import { rat, add, sub, div, neg, mul, isZero, isInteger } from './rational';
import type { Point, Rational } from './types';

export function yAt(m: Rational, b: Rational, x: number): Rational {
  return add(mul(m, rat(x)), b);
}

export function slopeFromPoints(p1: Point, p2: Point): Rational | null {
  const run = rat(p2.x - p1.x);
  if (isZero(run)) return null;
  return div(sub(p2.y, p1.y), run);
}

export function zeroFromEquation(m: Rational, b: Rational): Rational | null {
  if (isZero(m)) return null;
  return div(neg(b), m);
}

export function zeroFromTable(table: Point[], m: Rational): Rational | null {
  if (table.length === 0) return null;
  if (isZero(m)) return null;

  const exact = table.find((row) => isZero(row.y));
  if (exact) return rat(exact.x);

  const row = table[0]!;
  return sub(rat(row.x), div(row.y, m));
}

// The walk from a table point (x0, y0) to the zero: come down (or up) to the
// x-axis, sliding across 1/m for every unit of y. hopSize is the signed
// x-change of one hop toward the axis; hops counts them and is null when y0
// is not a whole number, so the walk can only be shown as one jump.
export type Walk = {
  rise: Rational;
  hops: number | null;
  hopSize: Rational;
  run: Rational;
};

export function walkToZero(y0: Rational, m: Rational): Walk | null {
  if (isZero(m)) return null;
  const rise = neg(y0);
  return {
    rise,
    hops: isInteger(y0) ? Math.abs(y0.n) : null,
    hopSize: div(rat(-Math.sign(y0.n)), m),
    run: div(rise, m),
  };
}
