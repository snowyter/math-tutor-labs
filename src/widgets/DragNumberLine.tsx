import { useRef, useState } from 'react';
import './DragNumberLine.css';

function vx(v: number, from: number, to: number): number {
  return 10 + ((v - from) / (to - from)) * 400;
}

export function DragNumberLine({
  from,
  to,
  start,
}: {
  from: number;
  to: number;
  start: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [value, setValue] = useState(start);
  const [dragging, setDragging] = useState(false);

  function valueFromClient(clientX: number): number {
    if (!svgRef.current) return value;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * 420;
    const raw = from + ((px - 10) / 400) * (to - from);
    return Math.max(from, Math.min(to, Math.round(raw)));
  }

  const jump = value - start;
  const leftward = jump < 0;
  const startX = vx(start, from, to);
  const endX = vx(value, from, to);

  const ticks: number[] = [];
  for (let v = from; v <= to; v++) ticks.push(v);

  return (
    <div className="dnumberline">
      <svg
        ref={svgRef}
        viewBox="0 0 420 110"
        className="dnumberline-svg"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          setValue(valueFromClient(e.clientX));
        }}
        onPointerMove={(e) => {
          if (dragging) setValue(valueFromClient(e.clientX));
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setDragging(false);
        }}
      >
        <line x1="10" y1="45" x2="410" y2="45" stroke="var(--axis)" strokeWidth="2" />

        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={vx(v, from, to)}
              y1="45"
              x2={vx(v, from, to)}
              y2={v === 0 ? 58 : 53}
              stroke="var(--axis)"
              strokeWidth={v === 0 ? 2.5 : 1.5}
            />
            <text
              className="dnumberline-tick-label"
              x={vx(v, from, to)}
              y="74"
              textAnchor="middle"
            >
              {v}
            </text>
          </g>
        ))}

        {jump !== 0 && (
          <g>
            <defs>
              <marker
                id="dnumberline-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--c-zero)" />
              </marker>
            </defs>
            <line
              x1={startX}
              y1="30"
              x2={leftward ? endX + 8 : endX - 8}
              y2="30"
              stroke="var(--c-zero)"
              strokeWidth="3"
              markerEnd="url(#dnumberline-arrow)"
            />
          </g>
        )}

        <circle cx={startX} cy="45" r="5" fill="var(--ink-faint)" />
        <circle
          className="dnumberline-marker"
          cx={endX}
          cy="45"
          r={dragging ? 11 : 9}
          fill="var(--c-zero)"
          stroke="#fff"
          strokeWidth="2"
        />
      </svg>

      <div className="dnumberline-readout">
        <span className="student-text">
          {`start ${start}, then ${jump === 0 ? 'no move' : `${leftward ? 'left' : 'right'} ${Math.abs(jump)}`}`}
        </span>
        <span className="dnumberline-value student-text">{`= ${value}`}</span>
      </div>

      <p className="dnumberline-hint faint">Drag the marker.</p>
    </div>
  );
}
