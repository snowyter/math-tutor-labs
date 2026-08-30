import { rat, equals, format } from './rational';
import type { Answer, Rational } from './types';

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

export function isCorrect(
  input: string,
  correct: Rational | 'none',
  exact = false,
): boolean {
  const parsed = parseAnswer(input);
  if (parsed === null) return false;
  if (parsed === 'none' || correct === 'none') return parsed === correct;
  if (exact) {
    return input.replace(/\s+/g, '').toLowerCase() === format(correct);
  }
  return equals(parsed, correct);
}

// Names the likely mistake behind a wrong answer, or null if none matches.
// For choice answers `raw` is the text of the option the student picked;
// for numeric answers it is what they typed.
export function explainMistake(raw: string, answer: Answer): string | null {
  if (!answer.mistakes) return null;

  if (answer.kind === 'choice') {
    const picked = raw.trim().toLowerCase();
    const hit = answer.mistakes.find((m) => m.match.trim().toLowerCase() === picked);
    return hit ? hit.say : null;
  }

  const parsed = parseAnswer(raw);
  if (parsed === null) return null;

  for (const m of answer.mistakes) {
    const target = parseAnswer(m.match);
    if (target === null) continue;
    if (parsed === 'none' || target === 'none') {
      if (parsed === target) return m.say;
    } else if (equals(parsed, target)) {
      return m.say;
    }
  }
  return null;
}
