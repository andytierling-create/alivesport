"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FILTERS,
  offerColor,
  parseSearch,
  postcodeDistrict,
  searchClubs,
  sessionCount,
  type FilterId,
  type SortId,
} from "@/lib/search";
import { AccessTag, PhotoSlot, Tag } from "./Media";

function toggleFilter(current: FilterId[], id: FilterId) {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
}

export function ClubsExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mapOpen, setMapOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  const state = useMemo(
    () => parseSearch(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const results = useMemo(() => searchClubs(state), [state]);

  function update(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const district = postcodeDistrict(state.postcode);

  return (
    <>
      <div className="clubs-header">
        <div className="clubs-wash" />
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1 className="display h1-clubs">
            Find a club near{" "}
            <span className="gradient-text">{district}</span>
          </h1>
          <div style={{ fontSize: 14, color: "rgba(247,245,255,.6)" }}>
            Free to search. No account. Club contact details shown in full.
          </div>
        </div>
        <form
          className="search-bar navy"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            update({
              q: String(form.get("q") || ""),
              postcode: String(form.get("postcode") || "SO14 3ZE"),
              radius: String(form.get("radius") || "5"),
              day: String(form.get("day") || "any"),
            });
          }}
        >
          <label className="search-field" style={{ flex: 1.3 }}>
            <span className="field-label">Sport or activity</span>
            <input name="q" defaultValue={state.q} placeholder="Netball" key={state.q} />
          </label>
          <label className="search-field" style={{ flex: 0.9 }}>
            <span className="field-label">Postcode</span>
            <input name="postcode" defaultValue={state.postcode} />
          </label>
          <label className="search-field" style={{ flex: 0.7 }}>
            <span className="field-label">Within</span>
            <select name="radius" defaultValue={state.radius}>
              <option value="2">2 miles</option>
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
            </select>
          </label>
          <label className="search-field" style={{ flex: 0.7, borderRight: 0 }}>
            <span className="field-label">Day</span>
            <select name="day" defaultValue={state.day}>
              <option value="any">Any day</option>
              <option value="mon">Monday</option>
              <option value="tue">Tuesday</option>
              <option value="wed">Wednesday</option>
              <option value="thu">Thursday</option>
              <option value="fri">Friday</option>
              <option value="sat">Saturday</option>
              <option value="sun">Sunday</option>
            </select>
          </label>
          <button className="btn-gradient" type="submit">
            Search
          </button>
        </form>
        <div className="chip-row">
          <span
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(247,245,255,.45)",
              marginRight: 4,
            }}
          >
            Filters
          </span>
          {FILTERS.map((filter, index) => {
            const active = state.filters.includes(filter.id);
            const className = active
              ? index === 1
                ? "chip active-blue"
                : "chip active"
              : "chip";
            return (
              <button
                key={filter.id}
                type="button"
                className={className}
                aria-pressed={active}
                onClick={() =>
                  update({
                    filters: toggleFilter(state.filters, filter.id).join(",") || undefined,
                  })
                }
              >
                {filter.label}
                {active ? " ✕" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="clubs-layout">
        <div className="results-col">
          <button
            className="chip map-toggle"
            type="button"
            onClick={() => setMapOpen((value) => !value)}
          >
            {mapOpen ? "Hide map" : "Show map"}
          </button>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 18,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 14, color: "rgba(247,245,255,.7)" }}>
              <strong style={{ color: "#F7F5FF", fontSize: 16 }}>
                {results.length} club{results.length === 1 ? "" : "s"}
              </strong>{" "}
              · {sessionCount(results)} sessions within {state.radius} miles
            </div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#3B96DC" }}>
              Sort:{" "}
              <select
                value={state.sort}
                onChange={(event) =>
                  update({ sort: event.target.value as SortId })
                }
                style={{
                  background: "transparent",
                  color: "#3B96DC",
                  border: 0,
                  fontWeight: 600,
                }}
              >
                <option value="nearest">nearest first</option>
                <option value="soonest">soonest</option>
                <option value="price">price</option>
              </select>
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.length === 0 ? null : (
              results.map((club) => (
                <Link
                  key={club.slug}
                  href={`/clubs/${club.slug}`}
                  className="result-card"
                  style={{
                    borderLeftColor: offerColor(club.offer),
                    transform: `rotate(${club.tilt}deg)`,
                    ["--tilt" as string]: `${club.tilt}deg`,
                  }}
                >
                  <PhotoSlot label="1:1" className="result-thumb" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          className="display"
                          style={{ fontSize: 22, lineHeight: 1.1 }}
                        >
                          {club.name}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "rgba(247,245,255,.62)",
                            marginTop: 5,
                          }}
                        >
                          {club.venue} · {club.distanceMiles} miles · {club.days}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flex: "none" }}>
                        <div
                          className="display"
                          style={{
                            fontSize: 18,
                            color:
                              club.offer === "free-taster" ? "#FFC94D" : undefined,
                          }}
                        >
                          {club.priceLabel}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(247,245,255,.55)",
                            marginTop: 3,
                          }}
                        >
                          {club.priceNote}
                        </div>
                      </div>
                    </div>
                    <div className="tags" style={{ marginTop: 12 }}>
                      {club.tags.map((tag) => (
                        <Tag key={tag.label} {...tag} />
                      ))}
                      <AccessTag verified={club.accessVerified} />
                    </div>
                  </div>
                </Link>
              ))
            )}

            <div className="honesty-card">
              <div>
                <div
                  className="display"
                  style={{ fontSize: 18, color: "#FFC94D", marginBottom: 5 }}
                >
                  {results.length === 0
                    ? "Nothing listed for that search yet"
                    : "Not seeing your local club?"}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(247,245,255,.72)",
                    maxWidth: "56ch",
                  }}
                >
                  We know of 60 more clubs in Hampshire we haven&apos;t listed
                  yet — mostly because nobody&apos;s answered the phone. Send us
                  a name and we&apos;ll keep trying.
                </div>
              </div>
              <Link href="/suggest" className="btn-sun">
                Suggest a club
              </Link>
            </div>
          </div>
        </div>

        <aside className={`map-rail${mapOpen ? "" : " collapsed"}`}>
          <div className="map-sticky">
            <div className="map-panel">
              <span
                style={{
                  position: "absolute",
                  left: 22,
                  top: 20,
                  font: "500 11px ui-monospace, Menlo, monospace",
                  color: "rgba(247,245,255,.5)",
                }}
              >
                map — Southampton, {state.radius} mile radius
              </span>
              {results.map((club) => (
                <span
                  key={club.slug}
                  className="pin"
                  style={{
                    left: club.pin.left,
                    top: club.pin.top,
                    background: offerColor(club.offer),
                    width: club.offer === "free-taster" ? 34 : 30,
                    height: club.offer === "free-taster" ? 34 : 30,
                  }}
                  title={club.name}
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                fontSize: 12,
                color: "rgba(247,245,255,.6)",
                flexWrap: "wrap",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF2FA7" }} />
                Free taster
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B96DC" }} />
                Pay as you go
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFC94D" }} />
                Access verified
              </span>
            </div>
            <form
              className="save-card"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
              }}
            >
              <div className="display" style={{ fontSize: 17, marginBottom: 8 }}>
                Save this search
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(247,245,255,.65)",
                  marginBottom: 14,
                }}
              >
                We&apos;ll email you when a new {state.q || "session"} within{" "}
                {state.radius} miles is added. Nothing else, ever.
              </div>
              {saved ? (
                <p style={{ margin: 0, color: "#FFC94D", fontWeight: 600 }}>
                  Saved. We&apos;ll only write if a matching session appears.
                </p>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email"
                    required
                    placeholder="your@email.co.uk"
                    aria-label="Email address"
                  />
                  <button className="btn-gradient" type="submit" style={{ borderRadius: 10 }}>
                    Save
                  </button>
                </div>
              )}
            </form>
          </div>
        </aside>
      </div>
    </>
  );
}
