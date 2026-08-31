import { describe, it, expect } from 'vitest';
import { parseHash } from './useHashRoute';

function parsePrereq(hash: string) {
  const r = parseHash(hash, 'lab');
  if (r.view !== 'prereq') throw new Error(`expected a prereq route for ${hash}`);
  return r;
}

describe('parseHash prereq params', () => {
  it('reads m and b from a prereq query string', () => {
    expect(parsePrereq('#/prereq/solving-two-step-equations?m=3&b=6')).toEqual({
      view: 'prereq',
      lessonId: 'solving-two-step-equations',
      params: { m: 3, b: 6 },
    });
  });

  it('reads negative and fractional values', () => {
    expect(parsePrereq('#/prereq/substituting-to-check?m=-2&b=-8').params).toEqual({
      m: -2,
      b: -8,
    });
    expect(parsePrereq('#/prereq/substituting-to-check?m=1.5&b=0').params).toEqual({
      m: 1.5,
      b: 0,
    });
  });

  it('omits params when the query is absent', () => {
    expect(parsePrereq('#/prereq/coordinate-plane')).toEqual({
      view: 'prereq',
      lessonId: 'coordinate-plane',
      params: undefined,
    });
  });

  it('omits params unless both m and b are valid numbers', () => {
    expect(parsePrereq('#/prereq/foo?m=abc&b=6').params).toBeUndefined();
    expect(parsePrereq('#/prereq/foo?m=3').params).toBeUndefined();
    expect(parsePrereq('#/prereq/foo?m=3&b=').params).toBeUndefined();
  });

  it('ignores query strings on lab and progress routes', () => {
    expect(parseHash('#/lab/slope-and-zero?m=3&b=6', 'lab')).toEqual({
      view: 'lab',
      labId: 'slope-and-zero',
    });
    expect(parseHash('#/progress', 'lab')).toEqual({ view: 'progress' });
  });

  it('still decodes prereq ids without a query', () => {
    expect(parsePrereq('#/prereq/y-equals-zero').lessonId).toBe('y-equals-zero');
  });
});

describe('parseHash exam route', () => {
  it('parses #/exam to the exam view', () => {
    expect(parseHash('#/exam', 'lab')).toEqual({ view: 'exam' });
  });

  it('does not treat #/examfoo as the exam route', () => {
    expect(parseHash('#/examfoo', 'lab').view).toBe('lab');
  });
});
