import './CoordinateTicks.css';
import { sx, sy, coordinateTickSet, TICK_MIN, TICK_MAX } from './coordinates';

/**
 * Shared axis tick marks and numeric labels for the -10..10 coordinate plane.
 * Used by both Graph and DragPlane so the two stay visually consistent.
 *
 * - Small tick marks at every integer.
 * - Sparse numeric labels every two units (avoids crowding on mobile).
 * - Origin "0" labeled once, on the x-axis only.
 * - Endpoint labels anchor inward so -10 and 10 do not clip at the edges.
 */
export function CoordinateTicks() {
  const { ticks, labels } = coordinateTickSet();
  const axisX = sx(0);
  const axisY = sy(0);

  return (
    <g className="coordinate-ticks" aria-hidden="true">
      {/* tick marks at every integer — x-axis */}
      {ticks.map((v) => (
        <line
          key={`xt-${v}`}
          x1={sx(v)}
          y1={axisY - 3}
          x2={sx(v)}
          y2={axisY + 3}
          stroke="var(--axis)"
          strokeWidth="1"
        />
      ))}
      {/* tick marks at every integer — y-axis */}
      {ticks.map((v) => (
        <line
          key={`yt-${v}`}
          x1={axisX - 3}
          y1={sy(v)}
          x2={axisX + 3}
          y2={sy(v)}
          stroke="var(--axis)"
          strokeWidth="1"
        />
      ))}

      {/* x-axis numeric labels, below the axis */}
      {labels.map((v) => {
        const anchor = v === TICK_MIN ? 'start' : v === TICK_MAX ? 'end' : 'middle';
        return (
          <text
            key={`xl-${v}`}
            className="coordinate-tick-label"
            x={sx(v)}
            y={axisY + 16}
            textAnchor={anchor}
            dominantBaseline="hanging"
          >
            {v}
          </text>
        );
      })}

      {/* y-axis numeric labels, left of the axis (skip 0 — origin is on x-axis) */}
      {labels
        .filter((v) => v !== 0)
        .map((v) => {
          const baseline =
            v === TICK_MAX ? 'hanging' : v === TICK_MIN ? 'auto' : 'middle';
          return (
            <text
              key={`yl-${v}`}
              className="coordinate-tick-label"
              x={axisX - 8}
              y={sy(v)}
              textAnchor="end"
              dominantBaseline={baseline}
            >
              {v}
            </text>
          );
        })}
    </g>
  );
}
