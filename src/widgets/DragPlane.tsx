import { useRef, useState } from 'react';
import './DragPlane.css';
import { rat, format } from '../engine/rational';
import { slopeFromPoints } from '../engine/math';
import { Fraction } from './Fraction';
import { sx, sy } from './Graph';
import type { Point } from '../engine/types';

const LO = -10;
const HI = 10;

function clamp(v: number): number {
  return Math.max(LO, Math.min(HI, v));
}

function toGrid(svg: SVGSVGElement, clientX: number, clientY: number) {
  const rect = svg.getBoundingClientRect();
  const vx = ((clientX - rect.left) / rect.width) * 420;
  const vy = ((clientY - rect.top) / rect.height) * 420;
  return { x: clamp(Math.round((vx - 10) / 20 - 10)), y: clamp(Math.round((410 - vy) / 20 - 10)) };
}

export type DragPlaneProps = {
  mode: 'free' | 'target' | 'riseRun' | 'vertical';
  target?: { x: number; y: number };
};

export function DragPlane({ mode, target }: DragPlaneProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const twoPoints = mode === 'riseRun' || mode === 'vertical';
  const [p1, setP1] = useState({ x: twoPoints ? -3 : 0, y: twoPoints ? -2 : 0 });
  const [p2, setP2] = useState({ x: 2, y: 3 });

  const onTarget = target !== undefined && p1.x === target.x && p1.y === target.y;
  const onAxis = mode === 'free' && p1.y === 0;

  const asPoint = (p: { x: number; y: number }): Point => ({ x: p.x, y: rat(p.y) });
  const slope = twoPoints ? slopeFromPoints(asPoint(p1), asPoint(p2)) : null;

  function move(which: number, e: React.PointerEvent) {
    if (dragging !== which || !svgRef.current) return;
    const g = toGrid(svgRef.current, e.clientX, e.clientY);
    if (which === 1) setP1(g);
    else setP2(g);
  }

  function handleProps(which: number) {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(which);
      },
      onPointerMove: (e: React.PointerEvent) => move(which, e),
      onPointerUp: (e: React.PointerEvent) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setDragging(null);
      },
      style: { cursor: dragging === which ? 'grabbing' : 'grab' },
    };
  }

  return (
    <div className="dragplane">
      <svg ref={svgRef} viewBox="0 0 420 420" className="dragplane-svg">
        <defs>
          <pattern id="drag-grid" width="20" height="20" patternUnits="userSpaceOnUse" x="10" y="10">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="10" y="10" width="400" height="400" fill="url(#drag-grid)" />

        <line x1="10" y1={sy(0)} x2="410" y2={sy(0)} stroke="var(--axis)" strokeWidth="1.5" />
        <line x1={sx(0)} y1="10" x2={sx(0)} y2="410" stroke="var(--axis)" strokeWidth="1.5" />

        {target && (
          <g>
            <circle
              cx={sx(target.x)}
              cy={sy(target.y)}
              r="9"
              fill="none"
              stroke="var(--ok)"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text className="dragplane-target-label" x={sx(target.x) + 14} y={sy(target.y) - 10}>
              {`(${target.x}, ${target.y})`}
            </text>
          </g>
        )}

        {twoPoints && (
          <g>
            <line
              x1={sx(p1.x)}
              y1={sy(p1.y)}
              x2={sx(p2.x)}
              y2={sy(p2.y)}
              stroke="var(--c-line)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={sx(p1.x)}
              y1={sy(p1.y)}
              x2={sx(p2.x)}
              y2={sy(p1.y)}
              stroke="var(--c-run)"
              strokeWidth="2"
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={sx(p2.x)}
              y1={sy(p1.y)}
              x2={sx(p2.x)}
              y2={sy(p2.y)}
              stroke="var(--c-rise)"
              strokeWidth="2"
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
            <text
              className="dragplane-run-label"
              x={(sx(p1.x) + sx(p2.x)) / 2}
              y={sy(p1.y) + 16}
              textAnchor="middle"
            >
              {`run ${format(rat(p2.x - p1.x))}`}
            </text>
            <text
              className="dragplane-rise-label"
              x={sx(p2.x) + 8}
              y={(sy(p1.y) + sy(p2.y)) / 2}
            >
              {`rise ${format(rat(p2.y - p1.y))}`}
            </text>
          </g>
        )}

        {!twoPoints && (
          <g>
            <line
              x1={sx(0)}
              y1={sy(p1.y)}
              x2={sx(p1.x)}
              y2={sy(p1.y)}
              stroke="var(--c-run)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <line
              x1={sx(p1.x)}
              y1={sy(0)}
              x2={sx(p1.x)}
              y2={sy(p1.y)}
              stroke="var(--c-rise)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </g>
        )}

        <circle
          className="dragplane-handle"
          cx={sx(p1.x)}
          cy={sy(p1.y)}
          r={onTarget || onAxis ? 10 : 8}
          fill={onTarget || onAxis ? 'var(--ok)' : 'var(--c-line)'}
          stroke="#fff"
          strokeWidth="2"
          {...handleProps(1)}
        />

        {twoPoints && (
          <circle
            className="dragplane-handle"
            cx={sx(p2.x)}
            cy={sy(p2.y)}
            r="8"
            fill="var(--c-line)"
            stroke="#fff"
            strokeWidth="2"
            {...handleProps(2)}
          />
        )}
      </svg>

      <div className="dragplane-readout">
        {twoPoints ? (
          <>
            <span className="student-text">
              {`slope = `}
              {slope === null ? (
                <span className="dragplane-undefined">undefined</span>
              ) : (
                <Fraction value={slope} />
              )}
            </span>
            {slope === null && (
              <span className="dragplane-undefined">
                the run is 0 — you cannot divide by 0
              </span>
            )}
          </>
        ) : (
          <span className={`student-text ${onTarget || onAxis ? 'dragplane-ok' : ''}`}>
            {`(${p1.x}, ${p1.y})`}
            {target && onTarget && ' — got it'}
          </span>
        )}
        {mode === 'free' && p1.y === 0 && (
          <span className="dragplane-ok">y = 0 — you are on the x-axis</span>
        )}
      </div>

      <p className="dragplane-hint faint">
        {twoPoints ? 'Drag either point.' : 'Drag the point.'}
      </p>
    </div>
  );
}
