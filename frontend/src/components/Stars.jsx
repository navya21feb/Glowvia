// Shows a 0-5 rating using a filled-star overlay
export default function Stars({ value = 0, count }) {
  return (
    <span className="stars" title={`${Number(value).toFixed(1)} out of 5`}>
      <span className="stars-track">
        <span className="stars-bg">★★★★★</span>
        <span className="stars-fg" style={{ width: `${(Number(value) / 5) * 100}%` }}>★★★★★</span>
      </span>
      {count !== undefined && <em>({count})</em>}
    </span>
  );
}
