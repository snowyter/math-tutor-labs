import './Fraction.css';
import { isInteger } from '../engine/rational';
import type { Rational } from '../engine/types';

export function Fraction({ value, className }: { value: Rational; className?: string }) {
  if (isInteger(value)) return <span className={className}>{value.n}</span>;
  return (
    <span className={`frac ${className ?? ''}`}>
      <span className="frac-n">{value.n}</span>
      <span className="frac-d">{value.d}</span>
    </span>
  );
}
