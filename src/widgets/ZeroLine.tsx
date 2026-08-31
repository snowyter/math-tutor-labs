import { useState } from 'react';
import './ZeroLine.css';
import { format, isInteger, isZero, neg, toNumber } from '../engine/rational';
import type { Rational } from '../engine/types';

export function ZeroLine({ m, b, zero }: { m: Rational; b: Rational; zero: Rational | null }) {
  const [revealed, setRevealed] = useState(false);

  if (isZero(m)) {
    return (
      <div className="zeroline">
        <p className="zeroline-note soft">
          {isZero(b) ? 'Every x is a zero — this line is the x-axis.' : 'This line has no zero.'}
        </p>
      </div>
    );
  }

  const negB = neg(b);
  const z = toNumber(zero!);
  const nb = toNumber(negB);
  const lo = Math.min(0, nb, z) - 1;
  const hi = Math.max(0, nb, z) + 1;
  const vx = (v: number) => 10 + ((v - lo) / (hi - lo)) * 400;

  const ticks: number[] = [];
  for (let v = Math.ceil(lo); v <= Math.floor(hi); v++) ticks.push(v);

  const wholeM = isInteger(m) && m.n !== 0;
  const parts: number[] = [];
  if (revealed && wholeM) {
    for (let i = 1; i < Math.abs(m.n); i++) parts.push((i * nb) / m.n);
  }

  return (
    <div className="zeroline">
      <svg viewBox="0 0 420 120" className="zeroline-svg">
        <line x1="10" y1="60" x2="410" y2="60" stroke="var(--axis)" strokeWidth="2" />

        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={vx(v)}
              y1="60"
              x2={vx(v)}
              y2={v === 0 ? 74 : 68}
              stroke="var(--axis)"
              strokeWidth={v === 0 ? 2.5 : 1.5}
            />
            <text className="zeroline-tick-label" x={vx(v)} y="94" textAnchor="middle">
              {v}
            </text>
          </g>
        ))}

        <g>
          <line x1={vx(nb)} y1="60" x2={vx(nb)} y2="46" stroke="var(--ink-soft)" strokeWidth="2" />
          <text className="zeroline-negb" x={vx(nb)} y="38" textAnchor="middle">
            −b
          </text>
        </g>

        {revealed &&
          parts.map((p, i) => (
            <line
              key={i}
              x1={vx(p)}
              y1="60"
              x2={vx(p)}
              y2="50"
              stroke="var(--c-run)"
              strokeWidth="2.5"
            />
          ))}

        {revealed && (
          <g>
            <circle cx={vx(z)} cy="60" r="8" fill="var(--c-zero)" stroke="#fff" strokeWidth="2" />
            <text className="zeroline-zero" x={vx(z)} y="24" textAnchor="middle">
              {`zero: x = ${format(zero!)}`}
            </text>
          </g>
        )}
      </svg>

      <p className="zeroline-caption student-text">
        {revealed ? (
          <>
            {wholeM ? `Split the way from 0 to −b into ${format(m)} equal parts. ` : ''}
            {`The zero sits at x = −b/m = `}
            <strong>{format(zero!)}</strong>
            {'.'}
          </>
        ) : (
          'The zero is −b divided by m. Start at −b and share it out.'
        )}
      </p>

      <div className="zeroline-actions">
        {revealed ? (
          <button onClick={() => setRevealed(false)}>Start again</button>
        ) : (
          <button className="primary" onClick={() => setRevealed(true)}>
            {wholeM ? `Divide by ${format(m)}` : 'Show the zero'}
          </button>
        )}
      </div>
    </div>
  );
}
