import { useState } from 'react';
import './Answer.css';

export function Choice({
  prompt,
  options,
  correct,
  onResult,
}: {
  prompt: string;
  options: string[];
  correct: number;
  onResult?: (ok: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);

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
                onResult?.(i === correct);
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && picked === correct && <p className="answer-ok">Correct</p>}
      {picked !== null && picked !== correct && <p className="answer-bad">Not quite — try again.</p>}
    </div>
  );
}
