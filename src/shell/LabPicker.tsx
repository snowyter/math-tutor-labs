import type { Lab } from '../engine/types';

export function LabPicker({
  labs,
  current,
  onPick,
}: {
  labs: Lab[];
  current: string;
  onPick: (id: string) => void;
}) {
  return (
    <label className="toolbar-item">
      <span className="toolbar-label">Lab</span>
      <select value={current} onChange={(e) => onPick(e.target.value)}>
        {labs.map((lab) => (
          <option key={lab.id} value={lab.id}>
            {lab.title}
          </option>
        ))}
      </select>
    </label>
  );
}
