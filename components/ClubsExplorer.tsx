"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatMiles, withDistances, type GeoLocate } from "@/lib/platform/geo";
import { withSchedule } from "@/lib/schedule";
import { AGE_BANDS, GENDERS, clubs, listingTags, type Club } from "@/data/clubs";
import { listingsFromPublishedEvents } from "@/lib/catalog";
import { isPlatformClientEnabled } from "@/lib/demo-flag";
import {
  DEFAULT_SEARCH_RADIUS,
  FILTERS,
  offerColor,
  parseRadius,
  parseSearch,
  postcodeDistrict,
  SEARCH_RADII,
  searchListings,
  searchRadiusLabel,
  sessionCount,
  type FilterId,
  type SortId,
} from "@/lib/search";
import { useDemo } from "./DemoProvider";
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
  const [saved, setSaved] = useState("");
  const [saveError, setSaveError] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [origin, setOrigin] = useState<GeoLocate | null>(null);
  const [geoStatus, setGeoStatus] = useState<"loading" | "ready" | "error">("loading");
  const [geoError, setGeoError] = useState("");
  const { publishedEvents, publicOrgs, adult } = useDemo();

  const state = useMemo(
    () => parseSearch(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const source = useMemo(
    () =>
      detailBasePath === "/clubs" && isPlatformClientEnabled()
        ? listingsFromPublishedEvents(listings, publishedEvents, publicOrgs)
        : listings,
    [detailBasePath, listings, publishedEvents, publicOrgs],
  );

  useEffect(() => {
    let cancelled = false;
    setGeoStatus("loading");
    setGeoError("");
    void fetch(`/api/geo?postcode=${encodeURIComponent(state.postcode)}`)
      .then(async (response) => {
        const data = (await response.json()) as GeoLocate & { error?: string };
        if (!response.ok) {
          throw new Error(data.error || "We couldn't place that postcode.");
        }
        return data;
      })
      .then((located) => {
        if (cancelled) return;
        setOrigin(located);
        setGeoStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setOrigin(null);
        setGeoStatus("error");
        setGeoError(
          error instanceof Error ? error.message : "We couldn't place that postcode.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [state.postcode]);

  const placed = useMemo(
    () => (origin ? withDistances(withSchedule(source), origin) : []),
    [origin, source],
  );
  const results = useMemo(
    () => (origin ? searchListings(state, placed) : []),
    [origin, placed, state],
  );
  const nearestMiles = placed[0]
    ? Math.min(...placed.map((club) => club.distanceMiles))
    : null;
  const farAway =
    geoStatus === "ready" &&
    nearestMiles !== null &&
    nearestMiles > Number(state.radius);

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

  const district = origin?.district || postcodeDistrict(state.postcode) || "you";
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
            Free to search. No account. Contact details are the club or venue&apos;s published ones.
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
              radius: parseRadius(String(form.get("radius") || DEFAULT_SEARCH_RADIUS)),
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
              {SEARCH_RADII.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
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
              · {sessionCount(results)} sessions within{" "}
              {searchRadiusLabel(state.radius)} of {district}
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
                href={`${detailBasePath}/${club.slug}?postcode=${encodeURIComponent(state.postcode)}`}
                className={`result-card${selectedSlug === club.slug ? " selected" : ""}`}
                style={{
                  borderLeftColor: offerColor(club.offer),
                  transform: `rotate(${club.tilt}deg)`,
                  ["--tilt" as string]: `${club.tilt}deg`,
                }}
                onMouseEnter={() => setSelectedSlug(club.slug)}
              >
                <PhotoSlot label="1:1" className="result-thumb" src={club.photo} />
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
                        {club.venue} · {formatMiles(club.distanceMiles)} · {club.days}
                      </div>
                      {club.sessions.some((session) => session.demo) ? (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#FFC94D",
                            marginTop: 6,
                            fontWeight: 600,
                          }}
                        >
                          Posted:{" "}
                          {club.sessions
                            .filter((session) => session.demo)
                            .map(
                              (session) =>
                                `${session.title ?? session.day} · ${session.day.slice(0, 3)} ${session.time}`,
                            )
                            .join(" · ")}
                        </div>
                      ) : null}
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

            <div
              className={`honesty-card${
                results.length === 0 || geoStatus !== "ready" ? " honesty-card-empty" : ""
              }`}
            >
              <div>
                <div
                  className="display"
                  style={{ fontSize: 18, color: "#FFC94D", marginBottom: 5 }}
                >
                  {geoStatus === "error"
                    ? "We need a real UK postcode"
                    : farAway
                      ? `Nothing near ${district} yet`
                      : `Know a ${suggestNoun} that should be on here?`}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(247,245,255,.72)",
                    maxWidth: "56ch",
                  }}
                >
                  {geoStatus === "loading"
                    ? "Placing that postcode on the map…"
                    : geoStatus === "error"
                      ? geoError
                      : farAway
                      ? `Nothing is within ${searchRadiusLabel(state.radius)} of ${district}. These listings are in Southampton and Hampshire.`
                      : results.length === 0
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
                  origin={origin}
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
                Club-reported access
              </span>
            </div>
            {isPlatformClientEnabled() ? (
            <form
              className="save-card"
              onSubmit={(event) => {
                event.preventDefault();
                setSaveError("");
                const form = new FormData(event.currentTarget);
                void fetch("/api/searches", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: String(form.get("email")),
                    q: state.q,
                    postcode: state.postcode,
                    radius: state.radius,
                    day: state.day,
                    age: state.age,
                    gender: state.gender,
                    accessible: state.accessible,
                    filters: state.filters,
                  }),
                })
                  .then(async (response) => {
                    const data = (await response.json()) as { error?: string; message?: string };
                    if (!response.ok) {
                      throw new Error(data.error || `Could not save (${response.status})`);
                    }
                    setSaved(
                      data.message ||
                        "Saved. If this were live we would email when a matching session appears.",
                    );
                  })
                  .catch((error) => {
                    setSaveError(
                      error instanceof Error ? error.message : "Could not save that search.",
                    );
                  });
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
                We&apos;ll store this search against your email. If this were
                live we&apos;d write when a new {state.q || "session"} within{" "}
                {searchRadiusLabel(state.radius)} is added. Nothing is emailed
                from this demo.
              </div>
              {saved ? (
                <p style={{ margin: 0, color: "#FFC94D", fontWeight: 600 }}>
                  {saved}
                </p>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={adult?.email ?? ""}
                    placeholder="your@email.co.uk"
                    aria-label="Email address"
                  />
                  <button className="btn-gradient" type="submit" style={{ borderRadius: 10 }}>
                    Save
                  </button>
                </div>
              )}
              {saveError ? (
                <p className="form-error" style={{ marginTop: 10 }}>
                  {saveError}
                </p>
              ) : null}
            </form>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}
