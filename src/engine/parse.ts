import { rat, equals } from './rational';
import type { Rational } from './types';

export type ParsedAnswer = Rational | 'none' | null;

function fromDecimal(x: number): Rational {
  const s = String(x);
  const dot = s.indexOf('.');
  if (dot === -1) return rat(x);
  const denom = 10 ** (s.length - dot - 1);
  return rat(Math.round(x * denom), denom);
}

export function parseAnswer(raw: string): ParsedAnswer {
  const s = raw.trim().toLowerCase();
  if (s === '') return null;
  if (s === 'none' || s === 'no zero') return 'none';

  const frac = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(s);
  if (frac) {
    const d = Number(frac[2]);
    if (d === 0) return null;
    return rat(Number(frac[1]), d);
  }

  if (/^-?\d+(\.\d+)?$/.test(s)) return fromDecimal(Number(s));
  return null;
}

export function isCorrect(input: string, correct: Rational | 'none'): boolean {
  const parsed = parseAnswer(input);
  if (parsed === null) return false;
  if (parsed === 'none' || correct === 'none') return parsed === correct;
  return equals(parsed, correct);
}
