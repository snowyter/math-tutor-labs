import { describe, expect, it } from 'vitest';
// The app intentionally omits @types/node; Vitest supplies this module at runtime.
// @ts-expect-error -- this test runs in Vitest's Node environment.
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LabShell.tsx', import.meta.url), 'utf8');

describe('lab shell: StepReveal restarts when the section is replaced', () => {
  // Both table variants carry the id 'from-table', so keying StepReveal on the
  // id alone left its revealed count in place across a toggle that swaps the
  // title, body, widget and every step. Keying on the table kind too forces a
  // remount, so the student starts the new sequence at step 1.
  const reveal = source.split('\n').find((line: string) => line.includes('<StepReveal'))!;

  it('keys StepReveal on the section id and the table kind', () => {
    expect(reveal).toContain('section.id');
    expect(reveal).toContain('tableKind');
  });
});
