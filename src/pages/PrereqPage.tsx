import './PrereqPage.css';
import { StepReveal } from '../widgets/StepReveal';
import { DragPlane } from '../widgets/DragPlane';
import { DragNumberLine } from '../widgets/DragNumberLine';
import { FractionBars, FractionCompare } from '../widgets/FractionBars';
import { BalanceScale } from '../widgets/BalanceScale';
import { Substitution } from '../widgets/Substitution';
import { LABS } from '../engine/registry';
import { goToLab } from '../shell/useHashRoute';
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
  return (
    <div className="prereq-page">
      <header className="prereq-page-head">
        <div>
          <p className="prereq-page-kicker">Prerequisite</p>
          <h1 className="prereq-page-title">{lesson.title}</h1>
        </div>
        <button className="primary" onClick={() => goToLab(LABS[0]!.id)}>
          Back to lab
        </button>
      </header>

      <Interactive widget={lesson.widget} />

      <StepReveal key={lesson.id} steps={lesson.steps} />
    </div>
  );
}
