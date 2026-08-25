import Link from "next/link";

export function HomeSearch() {
  return (
    <form className="search-bar" action="/clubs">
      <label className="search-field" style={{ flex: 1.2 }}>
        <span className="field-label">What do you fancy</span>
        <input name="q" placeholder="Any sport or activity" />
      </label>
      <label className="search-field" style={{ flex: 0.8 }}>
        <span className="field-label">Near</span>
        <input name="postcode" defaultValue="SO14 3ZE" />
      </label>
      <label className="search-field" style={{ flex: 0.7, borderRight: 0 }}>
        <span className="field-label">Who for</span>
        <select name="age" defaultValue="8-12">
          <option value="any">Anyone</option>
          <option value="8-12">Ages 8–12</option>
          <option value="14+">Ages 14+</option>
          <option value="over-60">Over 60s</option>
        </select>
      </label>
      <button className="btn-gradient" type="submit">
        Show me
      </button>
    </form>
  );
}

const popular = [
  { q: "Junior netball", label: "Junior netball" },
  { q: "Wheelchair basketball", label: "Wheelchair basketball" },
  { q: "Women's beginner running", label: "Women's beginner running" },
  { q: "Over-60s swim", label: "Over-60s swim" },
];

export function PopularChips() {
  return (
    <div className="chip-row">
      <span style={{ fontSize: 13, color: "rgba(247,245,255,.5)", marginRight: 4 }}>
        Popular:
      </span>
      {popular.map((item) => (
        <Link
          key={item.q}
          className="chip"
          href={`/clubs?q=${encodeURIComponent(item.q)}&postcode=${encodeURIComponent("SO14 3ZE")}`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
