import { useState } from 'react';
import './ExamPage.css';
import { MOCK_EXAM, gradeExam } from '../engine/exam';
import type { ExamScore, ExamItem } from '../engine/exam';
import { useExamAttempts } from '../shell/useExamAttempts';

type Stage = 'intro' | 'taking' | 'result';

function correctText(item: ExamItem): string {
  return item.kind === 'choice' ? item.options[item.correct]! : item.correct;
}

export function ExamPage() {
  const { record } = useExamAttempts();
  const [stage, setStage] = useState<Stage>('intro');
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [score, setScore] = useState<ExamScore | null>(null);

  // Answer keys are namespaced by part: Part I and Part II both number from 1.
  const setAnswer = (partId: string, n: number, value: string) => {
    setAnswers((prev) => new Map(prev).set(`${partId}-${n}`, value));
  };

  const submit = () => {
    const s = gradeExam(answers);
    setScore(s);
    record(s.score, s.of, s.partI, s.partII);
    setStage('result');
    window.scrollTo(0, 0);
  };

  const restart = () => {
    setAnswers(new Map());
    setScore(null);
    setStage('intro');
    window.scrollTo(0, 0);
  };

  if (stage === 'intro') {
    return (
      <div className="exam-page">
        <header className="exam-head">
          <p className="exam-kicker">Practice</p>
          <h1 className="exam-title">Mock Examination</h1>
          <p className="soft">
            {MOCK_EXAM.title} — {MOCK_EXAM.minutes} minutes.
          </p>
        </header>

        <table className="exam-table">
          <thead>
            <tr><th>Part</th><th>Type</th><th>Items</th><th>Points</th></tr>
          </thead>
          <tbody>
            {MOCK_EXAM.parts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.id === 'part-i' ? 'Multiple choice' : 'Problem solving'}</td>
                <td>{p.items.length}</td>
                <td>{p.items.length * p.pointsEach}</td>
              </tr>
            ))}
            <tr>
              <td>Part III</td><td>Essay (self-check)</td><td>{MOCK_EXAM.essays.length}</td>
              <td>not auto-scored</td>
            </tr>
          </tbody>
        </table>

        <button className="primary" onClick={() => setStage('taking')}>
          Start
        </button>
      </div>
    );
  }

  if (stage === 'taking') {
    return (
      <div className="exam-page">
        <p className="exam-progress soft">Answer everything, then submit once.</p>

        {MOCK_EXAM.parts.map((part) => (
          <section key={part.id} className="exam-part">
            <h2 className="exam-part-title">{part.title}</h2>
            {part.items.map((item) => {
              const key = `${part.id}-${item.n}`;
              return (
                <div className="exam-item" key={key}>
                  <p className="exam-n">
                    <strong>{item.n}.</strong> {item.stem}
                  </p>
                  {item.table && <ExamTable table={item.table} />}
                  {item.kind === 'choice' ? (
                    <div className="exam-choices">
                      {item.options.map((opt, i) => (
                        <button
                          key={i}
                          className={answers.get(key) === opt ? 'is-picked' : undefined}
                          onClick={() => setAnswer(part.id, item.n, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="exam-numeric">
                      {item.hint && <p className="exam-hint soft">{item.hint}</p>}
                      <input
                        type="text"
                        inputMode="text"
                        value={answers.get(key) ?? ''}
                        placeholder="Your answer, e.g. 3/2 or -3"
                        onChange={(e) => setAnswer(part.id, item.n, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ))}

        <button className="primary" onClick={submit}>Submit</button>
      </div>
    );
  }

  // result
  return (
    <div className="exam-page">
      <header className="exam-head">
        <p className="exam-kicker">Your score</p>
        <h1 className="exam-title">{`${score!.score}/${score!.of}`}</h1>
        <p className="soft">
          {`Part I: ${score!.partI}/20. Part II: ${score!.partII}/40.`}
        </p>
      </header>

      <h2 className="exam-part-title">Solutions</h2>
      {score!.results.map((r) => (
        <div className={`exam-item ${r.ok ? 'is-ok' : 'is-bad'}`} key={`${r.partId}-${r.item.n}`}>
          <p className="exam-n">
            <strong>{r.item.n}.</strong> {r.item.stem}
          </p>
          <p className="exam-verdict">
            {r.ok ? 'Correct' : r.student === null ? 'Unanswered' : 'Not quite'}
            {!r.ok && ` — the answer is ${correctText(r.item)}`}
          </p>
          <p className="exam-explain soft">{r.explain}</p>
        </div>
      ))}

      <h2 className="exam-part-title">Part III. Essays — check yourself</h2>
      {MOCK_EXAM.essays.map((e) => (
        <div className="exam-item" key={e.n}>
          <p className="exam-n"><strong>{e.n}.</strong> {e.prompt}</p>
          <details className="exam-guide">
            <summary>Show the marking guide</summary>
            <p className="exam-explain soft">{e.guide}</p>
          </details>
        </div>
      ))}

      <button className="primary" onClick={restart}>Take it again</button>
    </div>
  );
}

function ExamTable({ table }: { table: string[][] }) {
  return (
    <table className="exam-mini">
      <tbody>
        {table.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
