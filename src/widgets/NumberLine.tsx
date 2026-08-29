import './NumberLine.css';

export function NumberLine({
  from,
  to,
  marks = [],
}: {
  from: number;
  to: number;
  marks?: number[];
}) {
  const ticks: number[] = [];
  for (let v = from; v <= to; v++) ticks.push(v);

  return (
    <div className="numberline">
      <div className="numberline-track">
        {ticks.map((v) => {
          const marked = marks.includes(v);
          return (
            <div key={v} className="numberline-cell">
              <span className={`numberline-dot ${marked ? 'is-mark' : ''}`} />
              <span className={`numberline-label ${marked ? 'is-mark' : ''}`}>{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
