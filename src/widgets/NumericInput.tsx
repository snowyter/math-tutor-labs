import { useState } from 'react';
import './Answer.css';
import { isCorrect, explainMistake } from '../engine/parse';
import { format } from '../engine/rational';
import type { Mistake, Rational } from '../engine/types';

export function NumericInput({
  prompt,
  correct,
  mistakes,
  exact,
  onResult,
}: {
  prompt: string;
  correct: Rational | 'none';
  mistakes?: Mistake[];
  exact?: boolean;
  onResult?: (ok: boolean) => void;
}) {
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const [note, setNote] = useState<string | null>(null);

  function check() {
    const ok = isCorrect(value, correct, exact);
    setResult(ok);
    setAttempts((a) => a + 1);
    setNote(ok ? null : explainMistake(value, { kind: 'numeric', prompt, correct, mistakes }));
    onResult?.(ok);
  }

  return (
    <div className="answer">
      <div className="answer-row">
        <span className="answer-prompt">{prompt}</span>
        <input
          type="text"
          value={value}
          placeholder={correct === 'none' ? 'none' : ''}
          onChange={(e) => {
            setValue(e.target.value);
            setResult(null);
            setNote(null);
          }}
        />
        <button onClick={check}>Check</button>
      </div>

      {result === true && <p className="answer-ok">Correct</p>}
      {result === false && <p className="answer-bad">Not quite — try again.</p>}
      {note && <p className="answer-mistake">{note}</p>}
      {result === false && attempts >= 2 && (
        <p className="answer-hint">
          {`The answer is ${correct === 'none' ? 'none' : format(correct)}.`}
        </p>
      )}
    </div>
  );
}
