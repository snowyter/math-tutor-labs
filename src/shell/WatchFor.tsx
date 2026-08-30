import './WatchFor.css';

export function WatchFor({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="watchfor">
      <p className="watchfor-kicker">Watch for</p>
      <ul className="watchfor-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
