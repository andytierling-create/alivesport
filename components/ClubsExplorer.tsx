"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AGE_BANDS, GENDERS, clubs, listingTags, type Club } from "@/data/clubs";
import {
  FILTERS,
  offerColor,
  parseSearch,
  postcodeDistrict,
  searchListings,
  sessionCount,
  type FilterId,
  type SortId,
} from "@/lib/search";
import { AccessTag, PhotoSlot, Tag } from "./Media";

const ClubsMap = dynamic(() => import("./ClubsMap"), {
  ssr: false,
  loading: () => <div className="leaflet-host" aria-hidden="true" />,
});

function toggleFilter(current: FilterId[], id: FilterId) {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
}

export function ClubsExplorer({
  listings = clubs,
  heading = "Find your sport near",
  noun = "club",
  detailBasePath = "/clubs",
  suggestNoun = "club",
}: {
  listings?: Club[];
  heading?: string;
  noun?: string;
  detailBasePath?: string;
  suggestNoun?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mapOpen, setMapOpen] = useState(true);
  const [saved, setSaved] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const state = useMemo(
    () => parseSearch(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const results = useMemo(() => searchListings(state, listings), [state, listings]);

  function update(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function selectListing(slug: string) {
    setSelectedSlug(slug);
    document.getElementById(`listing-${slug}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  const district = postcodeDistrict(state.postcode);
  const nounPlural = noun === "club" ? "clubs" : `${noun}s`;

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
            {heading}{" "}
            <span className="gradient-text">{district}</span>
          </h1>
          <div style={{ fontSize: 14, color: "rgba(247,245,255,.6)" }}>
            Free to search. No account. Contact details shown in full.
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
              age: String(form.get("age") || "any"),
            });
          }}
        >
          <label className="search-field" style={{ flex: 1.2 }}>
            <span className="field-label">Sport or activity</span>
            <input name="q" defaultValue={state.q} placeholder="Netball" key={state.q} />
          </label>
          <label className="search-field" style={{ flex: 0.8 }}>
            <span className="field-label">Postcode</span>
            <input name="postcode" defaultValue={state.postcode} key={state.postcode} />
          </label>
          <label className="search-field" style={{ flex: 0.6 }}>
            <span className="field-label">Within</span>
            <select name="radius" defaultValue={state.radius} key={state.radius}>
              <option value="2">2 miles</option>
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
            </select>
          </label>
          <label className="search-field" style={{ flex: 0.6 }}>
            <span className="field-label">Day</span>
            <select name="day" defaultValue={state.day} key={state.day}>
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
          <label className="search-field" style={{ flex: 0.7, borderRight: 0 }}>
            <span className="field-label">Age</span>
            <select name="age" defaultValue={state.age || "any"} key={state.age}>
              <option value="any">Anyone</option>
              {AGE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-gradient" type="submit">
            Search
          </button>
        </form>
        <div className="chip-row">
          <span className="chip-legend">Gender</span>
          {GENDERS.map((option) => {
            const active = state.gender === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className={active ? "chip active" : "chip"}
                aria-pressed={active}
                onClick={() => update({ gender: active ? undefined : option.id })}
              >
                {option.label}
                {active ? " ✕" : ""}
              </button>
            );
          })}
          <span className="chip-legend">Access</span>
          <button
            type="button"
            className={state.accessible === "yes" ? "chip active-blue" : "chip"}
            aria-pressed={state.accessible === "yes"}
            onClick={() =>
              update({ accessible: state.accessible === "yes" ? undefined : "yes" })
            }
          >
            Accessible
            {state.accessible === "yes" ? " ✕" : ""}
          </button>
          <span className="chip-legend">More</span>
          {FILTERS.map((filter) => {
            const active = state.filters.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                className={active ? "chip active" : "chip"}
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
                {results.length} {results.length === 1 ? noun : nounPlural}
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
            {results.map((club) => (
              <Link
                key={club.slug}
                id={`listing-${club.slug}`}
                href={`${detailBasePath}/${club.slug}`}
                className={`result-card${selectedSlug === club.slug ? " selected" : ""}`}
                style={{
                  borderLeftColor: offerColor(club.offer),
                  transform: `rotate(${club.tilt}deg)`,
                  ["--tilt" as string]: `${club.tilt}deg`,
                }}
                onMouseEnter={() => setSelectedSlug(club.slug)}
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
                      <div className="display" style={{ fontSize: 22, lineHeight: 1.1 }}>
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
                          color: club.offer === "free-taster" ? "#FFC94D" : undefined,
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
                    {listingTags(club).map((tag) => (
                      <Tag key={tag.label} {...tag} />
                    ))}
                    <AccessTag verified={club.accessVerified} />
                  </div>
                </div>
              </Link>
            ))}

            <div className={`honesty-card${results.length === 0 ? " honesty-card-empty" : ""}`}>
              <div>
                <div
                  className="display"
                  style={{ fontSize: 18, color: "#FFC94D", marginBottom: 5 }}
                >
                  Know a {suggestNoun} that should be on here?
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(247,245,255,.72)",
                    maxWidth: "56ch",
                  }}
                >
                  {results.length === 0
                    ? "Nothing matched that search. Send us a name and we'll chase it."
                    : `We're still adding ${nounPlural} across Hampshire. If yours isn't listed, tell us.`}
                </div>
              </div>
              <Link href="/suggest" className="btn-sun">
                Suggest a {suggestNoun}
              </Link>
            </div>
          </div>
        </div>

        <aside className={`map-rail${mapOpen ? "" : " collapsed"}`}>
          <div className="map-sticky">
            <div className="map-panel">
              {mapOpen ? (
                <ClubsMap
                  listings={results}
                  selectedSlug={selectedSlug}
                  detailBasePath={detailBasePath}
                  onSelect={selectListing}
                />
              ) : null}
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
