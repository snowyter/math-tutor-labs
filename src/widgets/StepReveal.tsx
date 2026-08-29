import { useState } from 'react';
import './StepReveal.css';
import { NumericInput } from './NumericInput';
import { Choice } from './Choice';
import type { Step } from '../engine/types';

export function StepReveal({ steps }: { steps: Step[] }) {
  const [revealed, setRevealed] = useState(1);
  const [shownWhy, setShownWhy] = useState<Record<number, boolean>>({});

  return (
    <div className="steps">
      <p className="steps-count faint">
        {`Step ${Math.min(revealed, steps.length)} of ${steps.length}`}
      </p>

      {steps.slice(0, revealed).map((step, i) => {
        const answer = step.answer;
        return (
          <div key={i} className="step">
            <p className="student-text step-text">{step.text}</p>

            {step.why && (
              <div className="step-why">
                <button
                  className="step-why-toggle"
                  onClick={() => setShownWhy((s) => ({ ...s, [i]: !s[i] }))}
                >
                  {shownWhy[i] ? 'Hide why' : 'Why?'}
                </button>
                {shownWhy[i] && <span className="step-why-text">{step.why}</span>}
              </div>
            )}

            {answer && answer.kind === 'numeric' && (
              <NumericInput prompt={answer.prompt} correct={answer.correct} />
            )}
            {answer && answer.kind === 'choice' && (
              <Choice prompt={answer.prompt} options={answer.options} correct={answer.correct} />
            )}
          </div>
        );
      })}

      {revealed < steps.length && (
        <button className="primary" onClick={() => setRevealed((r) => r + 1)}>
          Next step
        </button>
      )}
    </div>
  );
}
