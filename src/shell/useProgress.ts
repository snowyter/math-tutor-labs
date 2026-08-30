import { useCallback, useState } from 'react';
import type { Progress } from '../engine/types';

const KEY = 'math-tutor-labs:progress:v1';

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { lessons: {} };
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'lessons' in parsed) {
      return parsed as Progress;
    }
    return { lessons: {} };
  } catch {
    // localStorage can be unavailable or hold corrupt data; start fresh.
    return { lessons: {} };
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(read);

  const record = useCallback((lessonId: string, score: number, of: number) => {
    setProgress((prev) => {
      const existing = prev.lessons[lessonId];
      const next: Progress = {
        lessons: {
          ...prev.lessons,
          [lessonId]: {
            attempts: (existing?.attempts ?? 0) + 1,
            best: Math.max(existing?.best ?? 0, score),
            last: score,
            of,
            updatedAt: Date.now(),
          },
        },
      };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Storage full or blocked; keep the in-memory progress for this session.
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    const empty: Progress = { lessons: {} };
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing to do; the in-memory reset below still applies.
    }
    setProgress(empty);
  }, []);

  return { progress, record, clear };
}
