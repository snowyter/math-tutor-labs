import './PrereqOverlay.css';
import { StepReveal } from './StepReveal';
import { Graph } from './Graph';
import { NumberLine } from './NumberLine';
import { rat } from '../engine/rational';
import type { PrereqLesson } from '../engine/types';

export function PrereqOverlay({
  lesson,
  onClose,
}: {
  lesson: PrereqLesson;
  onClose: () => void;
}) {
  const w = lesson.widget;

  return (
    <div className="prereq-backdrop" role="dialog" aria-modal="true" aria-label={lesson.title}>
      <div className="prereq-panel">
        <div className="prereq-header">
          <div>
            <p className="prereq-kicker">Prerequisite</p>
            <h2 className="prereq-title">{lesson.title}</h2>
          </div>
          <button className="primary" onClick={onClose}>
            Back to lab
          </button>
        </div>

        {w && w.kind === 'graph' && (
          <Graph m={rat(2, 3)} b={rat(1)} showTriangle={w.showTriangle} showZero={w.showZero} />
        )}
        {w && w.kind === 'numberLine' && <NumberLine from={w.from} to={w.to} marks={[0]} />}

        <StepReveal steps={lesson.steps} />
      </div>
    </div>
  );
}
