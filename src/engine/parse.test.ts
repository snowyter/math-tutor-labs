import { describe, it, expect } from 'vitest';
import { parseAnswer, isCorrect } from './parse';
import { rat } from './rational';

describe('parseAnswer', () => {
  it('parses integers', () => expect(parseAnswer('4')).toEqual(rat(4)));
  it('parses negative integers', () => expect(parseAnswer('-3')).toEqual(rat(-3)));
  it('parses fractions', () => expect(parseAnswer('2/3')).toEqual(rat(2, 3)));
  it('parses negative fractions', () => expect(parseAnswer('-2/3')).toEqual(rat(-2, 3)));
  it('reduces as it parses', () => expect(parseAnswer('4/6')).toEqual(rat(2, 3)));
  it('parses decimals exactly', () => expect(parseAnswer('1.5')).toEqual(rat(3, 2)));
  it('parses negative decimals', () => expect(parseAnswer('-1.5')).toEqual(rat(-3, 2)));
  it('trims whitespace', () => expect(parseAnswer('  2/3 ')).toEqual(rat(2, 3)));
  it('accepts the literal none', () => expect(parseAnswer('none')).toBe('none'));
  it('rejects a zero denominator', () => expect(parseAnswer('1/0')).toBeNull());
  it('rejects garbage', () => expect(parseAnswer('abc')).toBeNull());
  it('rejects empty input', () => expect(parseAnswer('')).toBeNull());
  it('rejects a lone slash', () => expect(parseAnswer('2/')).toBeNull());
});

describe('isCorrect', () => {
  it('accepts an equivalent fraction', () => expect(isCorrect('4/6', rat(2, 3))).toBe(true));
  it('accepts the decimal form', () => expect(isCorrect('1.5', rat(3, 2))).toBe(true));
  it('accepts 2 for 2/1', () => expect(isCorrect('2', rat(2))).toBe(true));
  it('rejects a wrong value', () => expect(isCorrect('3/4', rat(2, 3))).toBe(false));
  it('rejects unparseable input', () => expect(isCorrect('abc', rat(1))).toBe(false));
  it('matches the literal none', () => expect(isCorrect('none', 'none')).toBe(true));
  it('rejects a number when none is correct', () => expect(isCorrect('0', 'none')).toBe(false));
});
