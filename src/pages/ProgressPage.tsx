import './ProgressPage.css';
import { PREREQS } from '../../prereqs';
import { useProgress } from '../shell/useProgress';
import { goToLab, goToPrereq, goToExam } from '../shell/useHashRoute';
import { useExamAttempts } from '../shell/useExamAttempts';
import { LABS } from '../engine/registry';

export function ProgressPage() {
  const { progress, clear } = useProgress();
  const { attempts } = useExamAttempts();

  const attempted = PREREQS.filter((l) => progress.lessons[l.id]).length;

  return (
    <div className="progress-page">
      <header className="progress-head">
        <div>
          <p className="progress-kicker">Progress</p>
          <h1 className="progress-title">Prerequisites</h1>
          <p className="soft">
            {attempted === 0
              ? 'Nothing practised yet.'
              : `${attempted} of ${PREREQS.length} started.`}
          </p>
        </div>
        <button className="primary" onClick={() => goToLab(LABS[0]!.id)}>
          Back to lab
        </button>
        <button className="primary" onClick={goToExam}>
          Take the mock exam
        </button>
      </header>

      <ul className="progress-list">
        {PREREQS.map((lesson) => {
          const done = progress.lessons[lesson.id];
          const pct = done && done.of > 0 ? done.best / done.of : 0;
          const solid = pct === 1;

          return (
            <li key={lesson.id} className="progress-row">
              <button className="progress-open" onClick={() => goToPrereq(lesson.id)}>
                {lesson.title}
              </button>

              <div className="progress-bar" aria-hidden="true">
                <span className="progress-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
              </div>

              <span className={`progress-score ${solid ? 'is-solid' : ''}`}>
                {done ? `${done.best}/${done.of}` : '—'}
              </span>
            </li>
          );
        })}
      </ul>

      <section className="exam-history">
        <h2 className="exam-history-title">Mock exam</h2>
        {attempts.length === 0 ? (
          <p className="soft">No attempts yet.</p>
        ) : (
          <ul className="exam-history-list">
            {attempts.map((a, i) => (
              <li key={a.updatedAt}>
                {`${a.score}/${a.of}`}
                <span className="soft">
                  {` — Part I ${a.partI}/20, Part II ${a.partII}/40 — ${new Date(a.updatedAt).toLocaleDateString()}`}
                </span>
                {i === 0 && ' (latest)'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="progress-note faint">
        Scores are saved in this browser only. They are not shared between devices.
      </p>

      {attempted > 0 && (
        <button onClick={clear}>Clear progress</button>
      )}
    </div>
  );
}
