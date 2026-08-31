import { useCallback, useState } from 'react';

export type ExamAttempt = {
  score: number; // out of `of`
  of: number; // auto-scored total, 60
  partI: number; // out of 20
  partII: number; // out of 40
  updatedAt: number; // Date.now()
};

const KEY = 'math-tutor-labs:exam-attempts:v1';
const MAX = 10;

export function capAttempts(list: ExamAttempt[]): ExamAttempt[] {
  return list.slice(0, MAX);
}

export function pushAttempt(list: ExamAttempt[], attempt: ExamAttempt): ExamAttempt[] {
  return capAttempts([attempt, ...list]);
}

function read(): ExamAttempt[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return capAttempts(parsed as ExamAttempt[]);
    return [];
  } catch {
    // localStorage can be unavailable or hold corrupt data; start fresh.
    return [];
  }
}

export function useExamAttempts() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>(read);

  const record = useCallback((score: number, of: number, partI: number, partII: number) => {
    setAttempts((prev) => {
      const next = pushAttempt(prev, { score, of, partI, partII, updatedAt: Date.now() });
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Storage full or blocked; keep the in-memory history for this session.
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing to do; the in-memory reset below still applies.
    }
    setAttempts([]);
  }, []);

  return { attempts, record, clear };
}
