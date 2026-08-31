import { useState } from 'react';
import './LabShell.css';
import { LABS, firstExample } from '../engine/registry';
import { exampleFrom, generate } from '../engine/generate';
import { Graph } from '../widgets/Graph';
import { Table } from '../widgets/Table';
import { TableCompare } from '../widgets/TableCompare';
import { StepReveal } from '../widgets/StepReveal';
import { Fraction } from '../widgets/Fraction';
import { WalkToZero } from '../widgets/WalkToZero';
import { ZeroLine } from '../widgets/ZeroLine';
import { Toolbar } from './Toolbar';
import { WatchFor } from './WatchFor';
import { toNumber } from '../engine/rational';
import type { Level, TableKind, Rational, LinePreset } from '../engine/types';

export function LabShell() {
  const [labId, setLabId] = useState(LABS[0]!.id);
  const [level, setLevel] = useState<Level>('gentle');
  const [tableKind, setTableKind] = useState<TableKind>('includes-zero');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [m, setM] = useState(() => firstExample('gentle', 'includes-zero').m);
  const [b, setB] = useState(() => firstExample('gentle', 'includes-zero').b);
  const [presetIndex, setPresetIndex] = useState(0);
  const [tutorMode, setTutorMode] = useState(true);

  const lab = LABS.find((l) => l.id === labId)!;
  const example = exampleFrom(m, b, tableKind);
  const sections = lab.sections(example);
  const section = sections[sectionIndex] ?? sections[0]!;

  const preset: LinePreset | undefined =
    section.widget?.kind === 'graphPreset' ? section.widget.presets[presetIndex] : undefined;

  let graphM = m;
  let graphB = b;
  let graphVertical: Rational | undefined;
  if (preset) {
    if ('vertical' in preset) graphVertical = preset.vertical;
    else {
      graphM = preset.m;
      graphB = preset.b;
    }
  }

  const graphSpec = section.widget?.kind === 'graph' ? section.widget : null;
  const showTriangle = graphSpec ? graphSpec.showTriangle : false;
  const showZero = graphSpec ? graphSpec.showZero : preset !== undefined;

  function rollExample(l: Level, kind: TableKind) {
    const ex = generate(Math.floor(Math.random() * 1e9), l, kind);
    setM(ex.m);
    setB(ex.b);
  }

  return (
    <div className="shell">
      <Toolbar
        labs={LABS}
        currentLab={labId}
        onPickLab={setLabId}
        level={level}
        onLevel={(l) => {
          setLevel(l);
          rollExample(l, tableKind);
        }}
        tableKind={tableKind}
        onTableKind={setTableKind}
        showTableKind={section.id.startsWith('from-table')}
        onNewExample={() => rollExample(level, tableKind)}
        prereqIds={lab.prerequisites}
        exampleNumbers={{ m: toNumber(m), b: toNumber(b) }}
        tutorMode={tutorMode}
        onTutorMode={setTutorMode}
      />

      <div className="shell-sections">
        {sections.map((s, i) => (
          <button
            key={s.id}
            className={i === sectionIndex ? 'is-active' : undefined}
            onClick={() => setSectionIndex(i)}
          >
            {`${i + 1}. ${s.title}`}
          </button>
        ))}
      </div>

      <div className="shell-body">
        <div className="shell-graph">
          <Graph
            m={graphM}
            b={graphB}
            vertical={graphVertical}
            showTriangle={showTriangle}
            showZero={showZero}
            onChange={preset ? undefined : (nm, nb) => { setM(nm); setB(nb); }}
          />
        </div>

        <div className="shell-panel">
          <div className="shell-section-head">
            <h2 className="shell-section-title">{section.title}</h2>
            <p className="shell-section-body soft">{section.body}</p>
          </div>

          {section.widget?.kind === 'table' && (
            <Table
              rows={section.widget.rows ?? example.table}
              highlightRows={section.widget.highlightRows}
            />
          )}

          {section.widget?.kind === 'tableCompare' && (
            <TableCompare tables={section.widget.tables} />
          )}

          {section.widget?.kind === 'walkToZero' && (
            <>
              <Table rows={example.table} highlightRows={[section.widget.row]} />
              <WalkToZero
                x0={example.table[section.widget.row]!.x}
                y0={example.table[section.widget.row]!.y}
                m={example.m}
                zero={example.zero}
              />
            </>
          )}

          {section.widget?.kind === 'zeroLine' && (
            <>
              <p className="shell-expression student-text">
                y = <Fraction value={m} />x + <Fraction value={b} />
              </p>
              <ZeroLine m={m} b={b} zero={example.zero} />
            </>
          )}

          {section.widget?.kind === 'graphPreset' && (
            <div className="shell-presets">
              {section.widget.presets.map((p, i) => (
                <button
                  key={p.label}
                  className={i === presetIndex ? 'is-active' : undefined}
                  onClick={() => setPresetIndex(i)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {section.widget?.kind === 'expression' && (
            <p className="shell-expression student-text">
              y = <Fraction value={m} />x + <Fraction value={b} />
            </p>
          )}

          <StepReveal key={`${section.id}-${tableKind}`} steps={section.steps} />

          {tutorMode && section.watchFor && <WatchFor items={section.watchFor} />}
          {tutorMode && section.tutorNote && (
            <p className="shell-tutor-note soft">{section.tutorNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}
