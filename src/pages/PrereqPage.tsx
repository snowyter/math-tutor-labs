import './PrereqPage.css';
import { StepReveal } from '../widgets/StepReveal';
import { DragPlane } from '../widgets/DragPlane';
import { DragNumberLine } from '../widgets/DragNumberLine';
import { FractionBars, FractionCompare } from '../widgets/FractionBars';
import { BalanceScale } from '../widgets/BalanceScale';
import { Substitution } from '../widgets/Substitution';
import { PracticeSet } from '../widgets/PracticeSet';
import { LABS } from '../engine/registry';
import { goToLab, goToProgress } from '../shell/useHashRoute';
import { useProgress } from '../shell/useProgress';
import type { PrereqLesson, WidgetSpec } from '../engine/types';

function Interactive({ widget }: { widget?: WidgetSpec }) {
  if (!widget) return null;

  switch (widget.kind) {
    case 'dragPlane':
      return <DragPlane mode={widget.mode} target={widget.target} />;
    case 'dragRiseRun':
      return <DragPlane mode="riseRun" />;
    case 'dragVertical':
      return <DragPlane mode="vertical" />;
    case 'dragNumberLine':
      return <DragNumberLine from={widget.from} to={widget.to} start={widget.start} />;
    case 'fractionBars':
      return <FractionBars parts={widget.parts} shaded={widget.shaded} />;
    case 'fractionCompare':
      return <FractionCompare left={widget.left} right={widget.right} />;
    case 'balanceScale':
      return <BalanceScale coefficient={widget.coefficient} constant={widget.constant} />;
    case 'substitution':
      return <Substitution m={widget.m} b={widget.b} />;
    default:
      return null;
  }
}

export function PrereqPage({ lesson }: { lesson: PrereqLesson }) {
  const { progress, record } = useProgress();
  const done = progress.lessons[lesson.id];

  return (
    <div className="prereq-page">
      <header className="prereq-page-head">
        <div>
          <p className="prereq-page-kicker">Prerequisite</p>
          <h1 className="prereq-page-title">{lesson.title}</h1>
        </div>
        <div className="prereq-page-actions">
          <button onClick={goToProgress}>All prerequisites</button>
          <button className="primary" onClick={() => goToLab(LABS[0]!.id)}>
            Back to lab
          </button>
        </div>
      </header>

      <Interactive widget={lesson.widget} />

      <StepReveal key={lesson.id} steps={lesson.steps} />

      {lesson.drill && (
        <section className="prereq-practice">
          <h2 className="prereq-section-title">Practice</h2>
          {done ? (
            <p className="soft">
              {`Last time: ${done.last} of ${done.of}. Best so far: ${done.best} of ${done.of}.`}
            </p>
          ) : (
            <p className="soft">Eight questions. Get them wrong as often as you like.</p>
          )}
          <PracticeSet
            drill={lesson.drill}
            onComplete={(score, of) => record(lesson.id, score, of)}
          />
        </section>
      )}
    </div>
  );
}
