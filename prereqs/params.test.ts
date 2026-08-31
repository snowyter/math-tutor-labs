import { describe, it, expect } from 'vitest';
import { buildPrereq } from './index';
import { rat } from '../src/engine/rational';

describe('buildPrereq: solving-two-step-equations', () => {
  it('defaults to 0 = 3x + 6', () => {
    const l = buildPrereq('solving-two-step-equations');
    expect(l!.widget).toEqual({ kind: 'balanceScale', coefficient: 3, constant: 6 });
    expect(l!.steps[0]!.text).toContain('0 = 3x + 6');
    expect(l!.steps[3]!.text).toContain('So x = -2.');
  });

  it('uses the lab numbers when they are whole with a whole zero', () => {
    const l = buildPrereq('solving-two-step-equations', { m: 4, b: -12 });
    expect(l!.widget).toEqual({ kind: 'balanceScale', coefficient: 4, constant: -12 });
    expect(l!.steps[0]!.text).toContain('0 = 4x - 12');
    expect(l!.steps[1]!.text).toContain('add 12 to both sides. That leaves 12 = 4x.');
    expect(l!.steps[2]!.text).toContain('That leaves 3 = x.');
    expect(l!.steps[3]!.text).toContain('So x = 3.');
  });

  it('practices on a different equation than the lesson', () => {
    const l = buildPrereq('solving-two-step-equations', { m: 4, b: -12 });
    expect(l!.steps[4]!.text).toContain('0 = 5x + 15');
    expect(l!.steps[4]!.answer).toEqual({ kind: 'numeric', prompt: 'x =', correct: rat(-3) });
  });

  it('falls back to defaults for a fractional zero', () => {
    const l = buildPrereq('solving-two-step-equations', { m: 2, b: 3 });
    expect(l!.widget).toEqual({ kind: 'balanceScale', coefficient: 3, constant: 6 });
  });

  it('falls back to defaults for a fractional coefficient', () => {
    const l = buildPrereq('solving-two-step-equations', { m: 0.5, b: 4 });
    expect(l!.widget).toEqual({ kind: 'balanceScale', coefficient: 3, constant: 6 });
  });

  it('falls back to defaults for a negative coefficient', () => {
    const l = buildPrereq('solving-two-step-equations', { m: -2, b: 8 });
    expect(l!.widget).toEqual({ kind: 'balanceScale', coefficient: 3, constant: 6 });
  });

  it('falls back to defaults when m is zero', () => {
    const l = buildPrereq('solving-two-step-equations', { m: 0, b: 6 });
    expect(l!.widget).toEqual({ kind: 'balanceScale', coefficient: 3, constant: 6 });
  });
});

describe('buildPrereq: substituting-to-check', () => {
  it('defaults to y = 2x - 8 checked at x = 4', () => {
    const l = buildPrereq('substituting-to-check');
    expect(l!.widget).toEqual({ kind: 'substitution', m: 2, b: -8 });
    expect(l!.steps[0]!.text).toContain('x = 4');
    expect(l!.steps[0]!.text).toContain('y = 2x - 8');
    expect(l!.steps[2]!.text).toContain('That is 8 - 8, which is 0.');
  });

  it('uses the lab numbers when they are whole with a whole zero', () => {
    const l = buildPrereq('substituting-to-check', { m: 3, b: 6 });
    expect(l!.widget).toEqual({ kind: 'substitution', m: 3, b: 6 });
    expect(l!.steps[0]!.text).toContain('x = -2');
    expect(l!.steps[0]!.text).toContain('y = 3x + 6');
    expect(l!.steps[2]!.text).toContain('That is -6 plus 6, which is 0.');
  });

  it('practices on a different equation than the lesson', () => {
    const l = buildPrereq('substituting-to-check', { m: 3, b: 6 });
    expect(l!.steps[4]!.text).toContain('Check x = -3 in y = 4x + 12');
    expect(l!.steps[4]!.answer).toEqual({ kind: 'numeric', prompt: 'y =', correct: rat(0) });
  });

  it('falls back to defaults for a fractional zero', () => {
    const l = buildPrereq('substituting-to-check', { m: 2, b: 3 });
    expect(l!.widget).toEqual({ kind: 'substitution', m: 2, b: -8 });
  });

  it('falls back to defaults for a negative slope', () => {
    const l = buildPrereq('substituting-to-check', { m: -2, b: 8 });
    expect(l!.widget).toEqual({ kind: 'substitution', m: 2, b: -8 });
  });
});

describe('buildPrereq: other lessons', () => {
  it('returns static lessons untouched, ignoring params', () => {
    const l = buildPrereq('coordinate-plane', { m: 3, b: 6 });
    expect(l!.widget).toEqual({ kind: 'dragPlane', mode: 'free' });
    expect(l!.title).toBe('The coordinate plane');
  });

  it('returns undefined for an unknown id', () => {
    expect(buildPrereq('no-such-lesson')).toBeUndefined();
  });

  it('keeps every built lesson attached to its drill', () => {
    for (const id of [
      'coordinate-plane',
      'reading-a-point',
      'rise-and-run-counting',
      'subtracting-negatives',
      'fractions-as-division',
      'simplifying-fractions',
      'y-equals-zero',
      'solving-two-step-equations',
      'substituting-to-check',
      'division-by-zero-undefined',
    ]) {
      expect(buildPrereq(id)!.drill).toBeDefined();
      expect(buildPrereq(id, { m: 3, b: 6 })!.drill).toBeDefined();
    }
  });
});
