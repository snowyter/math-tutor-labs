import { rat, add, sub, div, neg, mul, isZero } from './rational';
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
