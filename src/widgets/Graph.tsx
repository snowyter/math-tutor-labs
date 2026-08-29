import './Graph.css';
import { toNumber, isZero, format, sub } from '../engine/rational';
import { zeroFromEquation, yAt } from '../engine/math';
import type { Rational } from '../engine/types';

const LO = -10;
const HI = 10;

export function sx(x: number): number {
  return 10 + (x + 10) * 20;
}

export function sy(y: number): number {
  return 410 - (y + 10) * 20;
}

export function lineSegment(
  m: Rational,
  b: Rational,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const mf = toNumber(m);
  const bf = toNumber(b);
  const pts: { x: number; y: number }[] = [];

  for (const x of [LO, HI]) {
    const y = mf * x + bf;
    if (y >= LO && y <= HI) pts.push({ x, y });
  }
  if (mf !== 0) {
    for (const y of [LO, HI]) {
      const x = (y - bf) / mf;
      if (x >= LO && x <= HI) pts.push({ x, y });
    }
  }

  const uniq = pts.filter((p, i) => pts.findIndex((q) => q.x === p.x && q.y === p.y) === i);
  if (uniq.length < 2) return null;
  return { x1: uniq[0]!.x, y1: uniq[0]!.y, x2: uniq[1]!.x, y2: uniq[1]!.y };
}

export type GraphProps = {
  m: Rational;
  b: Rational;
  showTriangle: boolean;
  showZero: boolean;
  onChange?: (m: Rational, b: Rational) => void;
  vertical?: Rational;
};

export function Graph(props: GraphProps) {
  const seg = props.vertical ? null : lineSegment(props.m, props.b);
  const zero = props.vertical ? null : zeroFromEquation(props.m, props.b);

  const showTriangle = props.showTriangle && !props.vertical && !isZero(props.m);
  const triangle = showTriangle ? buildTriangle(props.m, props.b) : null;

  return (
    <div className="graph">
      <svg viewBox="0 0 420 420" className="graph-svg" role="img" aria-label="Coordinate plane">
        <defs>
          <pattern id="graph-grid" width="20" height="20" patternUnits="userSpaceOnUse" x="10" y="10">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="10" y="10" width="400" height="400" fill="url(#graph-grid)" />

        <line x1="10" y1={sy(0)} x2="410" y2={sy(0)} stroke="var(--axis)" strokeWidth="1.5" />
        <line x1={sx(0)} y1="10" x2={sx(0)} y2="410" stroke="var(--axis)" strokeWidth="1.5" />

        {props.vertical && (
          <line
            x1={sx(toNumber(props.vertical))}
            y1="10"
            x2={sx(toNumber(props.vertical))}
            y2="410"
            stroke="var(--c-line)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {seg && (
          <line
            x1={sx(seg.x1)}
            y1={sy(seg.y1)}
            x2={sx(seg.x2)}
            y2={sy(seg.y2)}
            stroke="var(--c-line)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {triangle && (
          <g className="graph-triangle">
            <line
              x1={triangle.runX1}
              y1={triangle.baseY}
              x2={triangle.runX2}
              y2={triangle.baseY}
              stroke="var(--c-run)"
              strokeWidth="2"
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={triangle.runX2}
              y1={triangle.baseY}
              x2={triangle.runX2}
              y2={triangle.topY}
              stroke="var(--c-rise)"
              strokeWidth="2"
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
            <text
              className="graph-run-label"
              x={(triangle.runX1 + triangle.runX2) / 2}
              y={triangle.baseY + 16}
              textAnchor="middle"
            >
              {`run ${triangle.run}`}
            </text>
            <text
              className="graph-rise-label"
              x={triangle.runX2 + 8}
              y={(triangle.baseY + triangle.topY) / 2}
            >
              {`rise ${triangle.rise}`}
            </text>
          </g>
        )}

        {props.showZero && !props.vertical && zero !== null && (
          <g>
            <circle
              cx={sx(toNumber(zero))}
              cy={sy(0)}
              r="7"
              fill="none"
              stroke="var(--c-zero)"
              strokeWidth="2.5"
            />
            <text className="graph-zero-label" x={sx(toNumber(zero)) + 12} y={sy(0) + 20}>
              {`zero = ${format(zero)}`}
            </text>
          </g>
        )}

        {props.showZero && !props.vertical && zero === null && (
          <text className="graph-zero-label" x="20" y="400">
            {isZero(props.b)
              ? 'every x is a zero — this line is the x-axis'
              : 'no zero — this line never crosses the x-axis'}
          </text>
        )}
      </svg>
    </div>
  );
}

function buildTriangle(m: Rational, b: Rational) {
  const runX = m.d;
  const yBase = toNumber(b);
  const yTop = toNumber(yAt(m, b, runX));
  const rise = sub(yAt(m, b, runX), b);

  return {
    runX1: sx(0),
    runX2: sx(runX),
    baseY: sy(yBase),
    topY: sy(yTop),
    run: runX,
    rise: format(rise),
  };
}
