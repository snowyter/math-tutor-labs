import './TableCompare.css';
import { Table } from './Table';
import type { Point } from '../engine/types';

export type ComparedTable = { rows: Point[]; changes: string[] };

export function TableCompare({ tables }: { tables: ComparedTable[] }) {
  return (
    <div className="tcompare">
      {tables.map((t, i) => (
        <div className="tcompare-item" key={i}>
          <Table rows={t.rows} />
          <p className="tcompare-changes">{`Change in f(x): ${t.changes.join(', ')}`}</p>
        </div>
      ))}
    </div>
  );
}
