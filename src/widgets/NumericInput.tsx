import { useState } from 'react';
import './Answer.css';
import { isCorrect } from '../engine/parse';
import { format } from '../engine/rational';
import type { Rational } from '../engine/types';

export function NumericInput({
  prompt,
  correct,
  onResult,
}: {
  prompt: string;
  correct: Rational | 'none';
  onResult?: (ok: boolean) => void;
}) {
  const [value, setValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);

  function check() {
    const ok = isCorrect(value, correct);
    setResult(ok);
    setAttempts((a) => a + 1);
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
          }}
        />
        <button onClick={check}>Check</button>
      </div>

      {result === true && <p className="answer-ok">Correct</p>}
      {result === false && <p className="answer-bad">Not quite — try again.</p>}
      {result === false && attempts >= 2 && (
        <p className="answer-hint">
          {`The answer is ${correct === 'none' ? 'none' : format(correct)}.`}
        </p>
      )}
    </div>
  );
}
