import { useState } from 'react';
import type { ReactNode } from 'react';
import './WalkToZero.css';
import { walkToZero } from '../engine/math';
import { format, isZero, toNumber } from '../engine/rational';
import { Fraction } from './Fraction';
import type { Rational } from '../engine/types';

// A flat line has no single zero to walk to, and the two flat cases are not
// the same: sitting on the x-axis, every x is a zero; off it, none are. The
// wording mirrors the example's zeroNote, which this widget is not passed —
// it only gets the row, and on a flat line the row's y IS b.
export function flatLineNote(y0: Rational): string {
  return isZero(y0)
    ? 'Every x is a zero — this line is the x-axis.'
    : 'This line has no zero — it never crosses the x-axis.';
}

export function WalkToZero({
  x0,
  y0,
  m,
  zero,
}: {
  x0: number;
  y0: Rational;
  m: Rational;
  zero: Rational | null;
}) {
  const [walked, setWalked] = useState(false);
  const walk = walkToZero(y0, m);

  if (!zero || !walk) {
    return (
      <div className="walktozero">
        <p className="walktozero-note soft">{flatLineNote(y0)}</p>
      </div>
    );
  }

  const z = toNumber(zero);
  const lo = Math.min(x0, z) - 1;
  const hi = Math.max(x0, z) + 1;
  const vx = (v: number) => 10 + ((v - lo) / (hi - lo)) * 400;

  const ticks: number[] = [];
  for (let v = Math.ceil(lo); v <= Math.floor(hi); v++) ticks.push(v);

  const riseWord = walk.run.n < 0 ? 'left' : 'right';
  const absRise: Rational = { n: Math.abs(walk.rise.n), d: walk.rise.d };
  const absHop: Rational = { n: Math.abs(walk.hopSize.n), d: walk.hopSize.d };
  const absRun: Rational = { n: Math.abs(walk.run.n), d: walk.run.d };
  const alreadyThere = isZero(y0);

  let riseLine: ReactNode;
  let runLine: ReactNode;
  if (alreadyThere) {
    riseLine = 'This row is already at y = 0.';
    runLine = 'No walk needed — the zero is right here.';
  } else if (walk.hops !== null) {
    const down = walk.rise.n < 0;
    riseLine = (
      <>
        {'Rise needed: '}
        {down ? 'down ' : 'up '}
        <Fraction value={absRise} />
      </>
    );
    runLine = (
      <>
        {`Each 1 ${down ? 'down' : 'up'} is `}
        <Fraction value={absHop} />
        {` across: ${walk.hops} ${walk.hops === 1 ? 'hop' : 'hops'} of `}
        <Fraction value={absHop} />
        {`, `}
        <Fraction value={absRun} />
        {` ${riseWord} in total.`}
      </>
    );
  } else {
    riseLine = 'The y-values here are not whole, so the walk is one jump:';
    runLine = (
      <>
        {'Rise '}
        <Fraction value={walk.rise} />
        {' over slope '}
        <Fraction value={m} />
        {' gives run '}
        <Fraction value={walk.run} />
        {'.'}
      </>
    );
  }

  const hopEdges: number[] = [];
  if (walked && walk.hops !== null && walk.hops > 0) {
    for (let i = 0; i <= walk.hops; i++) {
      hopEdges.push(x0 + (i * toNumber(walk.run)) / walk.hops);
    }
  }

  return (
    <div className="walktozero">
      <svg viewBox="0 0 420 100" className="walktozero-svg">
        <defs>
          <marker
            id="walktozero-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--c-run)" />
          </marker>
        </defs>

        <line x1="10" y1="45" x2="410" y2="45" stroke="var(--axis)" strokeWidth="2" />

        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={vx(v)}
              y1="45"
              x2={vx(v)}
              y2={v === 0 ? 58 : 53}
              stroke="var(--axis)"
              strokeWidth={v === 0 ? 2.5 : 1.5}
            />
            <text className="walktozero-tick-label" x={vx(v)} y="74" textAnchor="middle">
              {v}
            </text>
          </g>
        ))}

        {walked && !alreadyThere && hopEdges.length >= 2 && (
          <g>
            {hopEdges.slice(0, -1).map((e, i) => (
              <line
                key={i}
                x1={vx(e) + 2}
                y1="30"
                x2={vx(hopEdges[i + 1]!) - 8}
                y2="30"
                stroke="var(--c-run)"
                strokeWidth="3"
                markerEnd="url(#walktozero-arrow)"
              />
            ))}
          </g>
        )}
        {walked && !alreadyThere && hopEdges.length < 2 && walk.run.n !== 0 && (
          <line
            x1={vx(x0) + (walk.run.n < 0 ? 0 : 8)}
            y1="30"
            x2={vx(z) - (walk.run.n < 0 ? 8 : 0)}
            y2="30"
            stroke="var(--c-run)"
            strokeWidth="3"
            markerEnd="url(#walktozero-arrow)"
          />
        )}

        <circle cx={vx(x0)} cy="45" r="6" fill="var(--ink-faint)" stroke="#fff" strokeWidth="2" />
        {walked && <circle cx={vx(z)} cy="45" r="9" fill="var(--c-zero)" stroke="#fff" strokeWidth="2" />}
      </svg>

      <div className="walktozero-readout">
        <p className="walktozero-rise student-text">{riseLine}</p>
        <p className="walktozero-run student-text">{runLine}</p>
        {walked && (
          <p className="walktozero-zero student-text">{`So the zero is x = ${format(zero)}.`}</p>
        )}
      </div>

      <div className="walktozero-actions">
        {walked ? (
          <button onClick={() => setWalked(false)}>Start again</button>
        ) : (
          <button className="primary" onClick={() => setWalked(true)}>
            Walk to the axis
          </button>
        )}
      </div>
    </div>
  );
}
