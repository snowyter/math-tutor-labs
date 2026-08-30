import { useState } from 'react';
import './FractionBars.css';
import { Fraction } from './Fraction';
import { rat } from '../engine/rational';
import type { Parts } from '../engine/types';

function Bar({ parts, shaded }: Parts) {
  const cells = Array.from({ length: parts }, (_, i) => i);
  return (
    <div className="fbar">
      {cells.map((i) => (
        <div key={i} className={`fbar-cell ${i < shaded ? 'is-shaded' : ''}`} />
      ))}
    </div>
  );
}

export function FractionBars({ parts: initialParts, shaded: initialShaded }: Parts) {
  const [parts, setParts] = useState(initialParts);
  const [shaded, setShaded] = useState(initialShaded);

  function changeParts(next: number) {
    const p = Math.max(2, Math.min(8, next));
    setParts(p);
    setShaded((s) => Math.min(s, p));
  }

  return (
    <div className="fbars">
      <Bar parts={parts} shaded={shaded} />

      <div className="fbars-controls">
        <span className="fbars-value student-text">
          <Fraction value={rat(shaded, parts)} />
        </span>

        <label className="fbars-control">
          <span className="fbars-label">pieces</span>
          <button onClick={() => changeParts(parts - 1)}>−</button>
          <span className="fbars-count">{parts}</span>
          <button onClick={() => changeParts(parts + 1)}>+</button>
        </label>

        <label className="fbars-control">
          <span className="fbars-label">shaded</span>
          <button onClick={() => setShaded((s) => Math.max(0, s - 1))}>−</button>
          <span className="fbars-count">{shaded}</span>
          <button onClick={() => setShaded((s) => Math.min(parts, s + 1))}>+</button>
        </label>
      </div>
    </div>
  );
}

export function FractionCompare({ left, right }: { left: Parts; right: Parts }) {
  return (
    <div className="fbars fbars-compare">
      <div className="fbars-row">
        <span className="fbars-tag student-text">
          <Fraction value={rat(left.shaded, left.parts)} />
        </span>
        <Bar parts={left.parts} shaded={left.shaded} />
      </div>

      <div className="fbars-row">
        <span className="fbars-tag student-text">
          <Fraction value={rat(right.shaded, right.parts)} />
        </span>
        <Bar parts={right.parts} shaded={right.shaded} />
      </div>

      <p className="fbars-note soft">
        Both bars cover the same amount — only the size of the pieces changed.
      </p>
    </div>
  );
}
