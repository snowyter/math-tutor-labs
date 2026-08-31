import { useState } from 'react';
import './BalanceScale.css';

type Stage = 0 | 1 | 2;

export function BalanceScale({
  coefficient,
  constant,
}: {
  coefficient: number;
  constant: number;
}) {
  const [stage, setStage] = useState<Stage>(0);

  const value = -constant / coefficient;
  const constPositive = constant > 0;
  const absK = Math.abs(constant);

  const equation =
    stage === 0
      ? `0 = ${coefficient}x ${constPositive ? '+' : '-'} ${absK}`
      : stage === 1
        ? `${coefficient}x = ${-constant}`
        : `x = ${value}`;

  const leftBlocks =
    stage === 0
      ? { xs: coefficient, units: absK, unitClass: constPositive ? 'is-unit' : 'is-negative' }
      : stage === 1
        ? { xs: coefficient, units: 0, unitClass: 'is-unit' }
        : { xs: 1, units: 0, unitClass: 'is-unit' };

  const rightUnits = stage === 0 ? 0 : stage === 1 ? absK : Math.abs(value);
  const rightClass =
    stage === 1 ? (constPositive ? 'is-negative' : 'is-unit') : value < 0 ? 'is-negative' : 'is-unit';

  return (
    <div className="balance">
      <p className="balance-equation student-text">{equation}</p>

      <div className="balance-scale">
        <div className="balance-beam">
          <div className="balance-pan balance-pan-left">
            <div className="balance-blocks">
              {Array.from({ length: leftBlocks.xs }, (_, i) => (
                <span key={`x-${i}`} className="balance-block is-x">
                  x
                </span>
              ))}
              {Array.from({ length: leftBlocks.units }, (_, i) => (
                <span key={`u-${i}`} className={`balance-block ${leftBlocks.unitClass}`} />
              ))}
            </div>
          </div>

          <div className="balance-pan balance-pan-right">
            <div className="balance-blocks">
              {rightUnits > 0 &&
                Array.from({ length: rightUnits }, (_, i) => (
                  <span key={`r-${i}`} className={`balance-block ${rightClass}`} />
                ))}
              {rightUnits === 0 && <span className="balance-zero">0</span>}
            </div>
          </div>
        </div>
        <div className="balance-fulcrum" />
        <p className="balance-status">still balanced</p>
      </div>

      <div className="balance-actions">
        {stage === 0 && (
          <button className="primary" onClick={() => setStage(1)}>
            {constPositive ? `Take ${constant} off both sides` : `Add ${absK} to both sides`}
          </button>
        )}
        {stage === 1 && (
          <button className="primary" onClick={() => setStage(2)}>
            {`Split both sides into ${coefficient} groups`}
          </button>
        )}
        {stage === 2 && <button onClick={() => setStage(0)}>Start again</button>}
      </div>
    </div>
  );
}
