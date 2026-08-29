import type { Rational } from './types';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function rat(n: number, d = 1): Rational {
  if (d === 0) throw new Error('rational: zero denominator');
  if (n === 0) return { n: 0, d: 1 };
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export const ZERO: Rational = { n: 0, d: 1 };

export function isZero(r: Rational): boolean {
  return r.n === 0;
}

export function add(a: Rational, b: Rational): Rational {
  return rat(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function sub(a: Rational, b: Rational): Rational {
  return rat(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function mul(a: Rational, b: Rational): Rational {
  return rat(a.n * b.n, a.d * b.d);
}

export function div(a: Rational, b: Rational): Rational {
  if (b.n === 0) throw new Error('rational: division by zero');
  return rat(a.n * b.d, a.d * b.n);
}

export function neg(a: Rational): Rational {
  return rat(-a.n, a.d);
}

export function equals(a: Rational, b: Rational): boolean {
  return a.n === b.n && a.d === b.d;
}

export function toNumber(r: Rational): number {
  return r.n / r.d;
}

export function isInteger(r: Rational): boolean {
  return r.d === 1;
}

export function format(r: Rational): string {
  if (r.d === 1) return String(r.n);
  return `${r.n}/${r.d}`;
}
