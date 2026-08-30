import { useState } from 'react';
import './Substitution.css';

export function Substitution({ m, b }: { m: number; b: number }) {
  const [x, setX] = useState(4);

  const product = m * x;
  const y = product + b;
  const sign = b < 0 ? '−' : '+';
  const absB = Math.abs(b);

  return (
    <div className="subst">
      <div className="subst-control">
        <span className="subst-label">x</span>
        <button onClick={() => setX((v) => v - 1)}>−</button>
        <span className="subst-value student-text">{x}</span>
        <button onClick={() => setX((v) => v + 1)}>+</button>
      </div>

      <div className="subst-lines">
        <p className="subst-line student-text">{`y = ${m}x ${sign} ${absB}`}</p>
        <p className="subst-line student-text">{`y = ${m} × ${x} ${sign} ${absB}`}</p>
        <p className="subst-line student-text">{`y = ${product} ${sign} ${absB}`}</p>
        <p className={`subst-line subst-result ${y === 0 ? 'is-zero' : ''}`}>{`y = ${y}`}</p>
      </div>

      {y === 0 && (
        <p className="subst-verdict">
          {`y came out as 0 — so x = ${x} really is the zero.`}
        </p>
      )}
    </div>
  );
}
