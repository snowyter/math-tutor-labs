import './Table.css';
import { isZero } from '../engine/rational';
import { Fraction } from './Fraction';
import type { Point } from '../engine/types';

export function Table({ rows, highlightRows = [] }: { rows: Point[]; highlightRows?: number[] }) {
  return (
    <table className="table">
      <tbody>
        <tr>
          <th scope="row">x</th>
          {rows.map((r, i) => (
            <td key={`x-${i}`} className={highlightRows.includes(i) ? 'is-highlight' : undefined}>
              {r.x}
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row">y</th>
          {rows.map((r, i) => {
            const classes = [isZero(r.y) ? 'is-zero' : '', highlightRows.includes(i) ? 'is-highlight' : ''];
            return (
              <td key={`y-${i}`} className={classes.filter(Boolean).join(' ') || undefined}>
                <Fraction value={r.y} />
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}
