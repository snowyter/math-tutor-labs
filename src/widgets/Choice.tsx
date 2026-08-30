import { useState } from 'react';
import './Answer.css';
import { explainMistake } from '../engine/parse';
import type { Mistake } from '../engine/types';

export function Choice({
  prompt,
  options,
  correct,
  mistakes,
  onResult,
}: {
  prompt: string;
  options: string[];
  correct: number;
  mistakes?: Mistake[];
  onResult?: (ok: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);

  return (
    <div className="answer">
      <p className="answer-prompt">{prompt}</p>
      <div className="answer-choices">
        {options.map((opt, i) => {
          const state =
            picked === null ? '' : i === correct ? 'is-ok' : picked === i ? 'is-bad' : '';
          return (
            <button
              key={opt}
              className={state || undefined}
              onClick={() => {
                setPicked(i);
                setNote(
                  i === correct
                    ? null
                    : explainMistake(opt, { kind: 'choice', prompt, options, correct, mistakes }),
                );
                onResult?.(i === correct);
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && picked === correct && <p className="answer-ok">Correct</p>}
      {picked !== null && picked !== correct && (
        <p className="answer-bad">Not quite — try again.</p>
      )}
      {note && <p className="answer-mistake">{note}</p>}
    </div>
  );
}
