import Link from "next/link";
import { AGE_BANDS } from "@/data/clubs";
import { DEFAULT_SEARCH_RADIUS, SEARCH_RADII } from "@/lib/search";

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
      <label className="search-field" style={{ flex: 0.55 }}>
        <span className="field-label">Within</span>
        <select name="radius" defaultValue={DEFAULT_SEARCH_RADIUS}>
          {SEARCH_RADII.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="search-field" style={{ flex: 0.65 }}>
        <span className="field-label">Who for</span>
        <select name="age" defaultValue="any">
          <option value="any">Anyone</option>
          {AGE_BANDS.map((band) => (
            <option key={band.id} value={band.id}>
              {band.label}
            </option>
          ))}
        </select>
      </label>
      <label className="search-field" style={{ flex: 0.7, borderRight: 0 }}>
        <span className="field-label">Disability</span>
        <select name="accessible" defaultValue="">
          <option value="">Any</option>
          <option value="yes">Accessible</option>
        </select>
      </label>
      <button className="btn-gradient" type="submit">
        Show me
      </button>
    </form>
  );
}

const popular = [
  { q: "Walking football", label: "Walking football" },
  { q: "Wheelchair basketball", label: "Wheelchair basketball" },
  { q: "parkrun", label: "parkrun" },
  { q: "Swim", label: "Swim" },
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
