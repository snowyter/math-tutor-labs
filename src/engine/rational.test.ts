import { describe, it, expect } from 'vitest';
import { rat, add, sub, mul, div, neg, equals, isZero, isInteger, format, toNumber } from './rational';

describe('rat', () => {
  it('reduces', () => expect(rat(4, 6)).toEqual({ n: 2, d: 3 }));
  it('normalises sign to the denominator', () => expect(rat(1, -2)).toEqual({ n: -1, d: 2 }));
  it('normalises -0', () => expect(rat(0, -5)).toEqual({ n: 0, d: 1 }));
  it('rejects a zero denominator', () => expect(() => rat(1, 0)).toThrow());
});

describe('arithmetic', () => {
  it('adds', () => expect(add(rat(1, 2), rat(1, 3))).toEqual({ n: 5, d: 6 }));
  it('subtracts through zero', () => expect(sub(rat(1, 3), rat(1, 2))).toEqual({ n: -1, d: 6 }));
  it('multiplies', () => expect(mul(rat(2, 3), rat(3, 4))).toEqual({ n: 1, d: 2 }));
  it('divides', () => expect(div(rat(2, 3), rat(4, 5))).toEqual({ n: 5, d: 6 }));
  it('refuses to divide by zero', () => expect(() => div(rat(1), rat(0))).toThrow());
  it('negates', () => expect(neg(rat(2, 3))).toEqual({ n: -2, d: 3 }));
});

describe('comparison', () => {
  it('treats 4/6 and 2/3 as equal', () => expect(equals(rat(4, 6), rat(2, 3))).toBe(true));
  it('treats 2 and 2/1 as equal', () => expect(equals(rat(2), rat(2, 1))).toBe(true));
  it('distinguishes 1/2 from 2/3', () => expect(equals(rat(1, 2), rat(2, 3))).toBe(false));
});

describe('predicates and formatting', () => {
  it('detects zero', () => expect(isZero(rat(0, 7))).toBe(true));
  it('detects integers', () => expect(isInteger(rat(6, 2))).toBe(true));
  it('rejects non-integers', () => expect(isInteger(rat(3, 2))).toBe(false));
  it('formats whole numbers bare', () => expect(format(rat(4, 2))).toBe('2'));
  it('formats fractions', () => expect(format(rat(-3, 2))).toBe('-3/2'));
  it('converts to number', () => expect(toNumber(rat(3, 2))).toBe(1.5));
});
