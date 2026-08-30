import { useMemo, useState } from 'react';
import './PracticeSet.css';
import { NumericInput } from './NumericInput';
import { Choice } from './Choice';
import { makeRand } from '../engine/generate';
import type { Drill } from '../engine/types';

export function PracticeSet({
  drill,
  onComplete,
}: {
  drill: Drill;
  onComplete?: (score: number, of: number) => void;
}) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));

  const questions = useMemo(() => {
    const rand = makeRand(seed);
    return Array.from({ length: drill.length }, () => drill.make(rand));
  }, [seed, drill]);

  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(() => new Array(drill.length).fill(false));
  const [finished, setFinished] = useState(false);

  const question = questions[index]!;
  const score = solved.filter(Boolean).length;

  function restart() {
    setSeed(Math.floor(Math.random() * 1e9));
    setIndex(0);
    setSolved(new Array(drill.length).fill(false));
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="practice">
        <p className="practice-score">
          {`You got ${score} of ${drill.length}.`}
        </p>
        <p className="practice-verdict soft">
          {score === drill.length
            ? 'All of them — this one is solid now.'
            : score >= drill.length - 2
              ? 'Close. One more go and it should stick.'
              : 'Worth going through the steps above again first.'}
        </p>
        <button className="primary" onClick={restart}>
          Try another set
        </button>
      </div>
    );
  }

  return (
    <div className="practice">
      <p className="practice-count faint">
        {`Question ${index + 1} of ${drill.length} · ${score} right so far`}
      </p>

      {question.kind === 'numeric' ? (
        <NumericInput
          key={`${seed}-${index}`}
          prompt={question.prompt}
          correct={question.correct}
          mistakes={question.mistakes}
          exact={question.exact}
          onResult={(ok) => {
            if (ok) {
              setSolved((s) => {
                const next = [...s];
                next[index] = true;
                return next;
              });
            }
          }}
        />
      ) : (
        <Choice
          key={`${seed}-${index}`}
          prompt={question.prompt}
          options={question.options}
          correct={question.correct}
          mistakes={question.mistakes}
          onResult={(ok) => {
            if (ok) {
              setSolved((s) => {
                const next = [...s];
                next[index] = true;
                return next;
              });
            }
          }}
        />
      )}

      <button
        onClick={() => {
          if (index + 1 >= questions.length) {
            setFinished(true);
            onComplete?.(solved.filter(Boolean).length, drill.length);
          } else {
            setIndex((i) => i + 1);
          }
        }}
      >
        {index + 1 >= questions.length ? 'Finish' : 'Next question'}
      </button>
    </div>
  );
}
