import { rat, isZero, isInteger, toNumber } from './rational';
import { zeroFromEquation, yAt } from './math';
import type { Level, TableKind, LinearExample, Point, Rational } from './types';

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SLOPES: Record<Level, Rational[]> = {
  gentle: [rat(1), rat(2), rat(3)],
  standard: [
    rat(1), rat(-1), rat(2), rat(-2), rat(3), rat(-3),
    rat(4), rat(-4), rat(5), rat(-5),
    rat(1, 2), rat(2, 3), rat(3, 2),
  ],
  challenging: [rat(3, 4), rat(-3, 4), rat(5, 2), rat(-5, 2), rat(7, 3), rat(-7, 3)],
};

function candidatesFor(level: Level, tableKind: TableKind): { m: Rational; b: Rational }[] {
  const out: { m: Rational; b: Rational }[] = [];
  const needIntegerZero = level === 'gentle' || tableKind === 'includes-zero';

  for (const m of SLOPES[level]) {
    for (let bInt = -6; bInt <= 6; bInt++) {
      const b = rat(bInt);
      const zero = zeroFromEquation(m, b);
      if (zero === null) continue;
      if (needIntegerZero && !isInteger(zero)) continue;
      if (isZero(zero)) continue;
      if (Math.abs(toNumber(zero)) > 9) continue;
      out.push({ m, b });
    }
  }
  return out;
}

function buildTable(
  m: Rational,
  b: Rational,
  zero: Rational | null,
  tableKind: TableKind,
): Point[] {
  const step = m.d;
  const row = (x: number): Point => ({ x, y: yAt(m, b, x) });

  if (tableKind === 'includes-zero' && zero !== null && isInteger(zero)) {
    const z = zero.n;
    return [z - 2 * step, z - step, z, z + step].map(row);
  }

  if (zero !== null && isInteger(zero)) {
    // straddle the zero without landing on it
    const z = zero.n;
    return [z - 2 * step, z - step, z + step, z + 2 * step].map(row);
  }

  return [-step, 0, step, 2 * step].map(row);
}

function twoPointsOn(m: Rational, b: Rational): [Point, Point] {
  const step = m.d;
  return [
    { x: 0, y: yAt(m, b, 0) },
    { x: step, y: yAt(m, b, step) },
  ];
}

export function exampleFrom(m: Rational, b: Rational, tableKind: TableKind): LinearExample {
  const zero = zeroFromEquation(m, b);
  let zeroNote: string | null = null;
  if (zero === null) {
    zeroNote = isZero(b)
      ? 'Every x is a zero — this line is the x-axis.'
      : 'This line has no zero — it never crosses the x-axis.';
  }
  return {
    m,
    b,
    zero,
    zeroNote,
    tableKind,
    table: buildTable(m, b, zero, tableKind),
    points: twoPointsOn(m, b),
  };
}

export function generate(seed: number, level: Level, tableKind: TableKind): LinearExample {
  const candidates = candidatesFor(level, tableKind);
  if (candidates.length === 0) {
    throw new Error(`generate: no candidates for ${level}/${tableKind}`);
  }
  const pick = candidates[Math.floor(mulberry32(seed)() * candidates.length)]!;
  return exampleFrom(pick.m, pick.b, tableKind);
}
