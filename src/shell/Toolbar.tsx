import { LabPicker } from './LabPicker';
import { prereqById } from '../engine/registry';
import { goToExam, goToPrereq, goToProgress } from './useHashRoute';
import type { Lab, LabNumbers, Level, TableKind } from '../engine/types';

export function Toolbar({
  labs,
  currentLab,
  onPickLab,
  level,
  onLevel,
  tableKind,
  onTableKind,
  showTableKind,
  onNewExample,
  prereqIds,
  exampleNumbers,
  tutorMode,
  onTutorMode,
}: {
  labs: Lab[];
  currentLab: string;
  onPickLab: (id: string) => void;
  level: Level;
  onLevel: (level: Level) => void;
  tableKind: TableKind;
  onTableKind: (kind: TableKind) => void;
  showTableKind: boolean;
  onNewExample: () => void;
  prereqIds: string[];
  exampleNumbers?: LabNumbers;
  tutorMode: boolean;
  onTutorMode: (on: boolean) => void;
}) {
  return (
    <div className="toolbar">
      <LabPicker labs={labs} current={currentLab} onPick={onPickLab} />

      <label className="toolbar-item">
        <span className="toolbar-label">Difficulty</span>
        <select value={level} onChange={(e) => onLevel(e.target.value as Level)}>
          <option value="gentle">Gentle</option>
          <option value="standard">Standard</option>
          <option value="challenging">Challenging</option>
        </select>
      </label>

      {showTableKind && (
        <label className="toolbar-item">
          <span className="toolbar-label">Table case</span>
          <select value={tableKind} onChange={(e) => onTableKind(e.target.value as TableKind)}>
            <option value="includes-zero">includes y = 0</option>
            <option value="excludes-zero">no y = 0</option>
          </select>
        </label>
      )}

      <button onClick={onNewExample}>New example</button>

      <button onClick={goToProgress}>Progress</button>

      <button onClick={goToExam}>Mock exam</button>

      <label className="toolbar-item">
        <span className="toolbar-label">Prereq</span>
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) goToPrereq(e.target.value, exampleNumbers);
          }}
        >
          <option value="">Jump to…</option>
          {prereqIds.map((id) => (
            <option key={id} value={id}>
              {prereqById(id)?.title ?? id}
            </option>
          ))}
        </select>
      </label>

      <button className={tutorMode ? 'is-on' : undefined} onClick={() => onTutorMode(!tutorMode)}>
        {tutorMode ? 'Tutor ON' : 'Tutor OFF'}
      </button>
    </div>
  );
}
