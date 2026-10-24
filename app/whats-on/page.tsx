import type { Metadata } from "next";
import Link from "next/link";
import { PhotoSlot, Tag } from "@/components/Media";
import { clubs } from "@/data/clubs";
import { wellness } from "@/data/wellness";
import { upcomingFromEvents, upcomingSessions } from "@/lib/catalog";
import { isPlatformEnabled } from "@/lib/demo-flag";
import { formatMiles, locatePostcode, withDistances } from "@/lib/platform/geo";
import { publicEvents, publicOrg, readPlatform } from "@/lib/platform/store";
import { parseRadius, postcodeDistrict, searchRadiusLabel } from "@/lib/search";
import { withSchedule } from "@/lib/schedule";

export const metadata: Metadata = {
  title: "What's on",
};

export const dynamic = "force-dynamic";

export default async function WhatsOnPage({
  searchParams,
}: {
  searchParams: Promise<{ postcode?: string; radius?: string }>;
}) {
  const params = await searchParams;
  const postcode = params.postcode || "SO14 3ZE";
  const radius = parseRadius(params.radius);
  const origin = await locatePostcode(postcode);
  const district = origin?.district || postcodeDistrict(postcode) || "you";
  const state = isPlatformEnabled() ? await readPlatform() : null;
  const posted = state
    ? upcomingFromEvents(publicEvents(state), state.orgs.map(publicOrg)).filter(
        (row) => row.posted,
      )
    : [];
  const clubRows = upcomingSessions(
    withSchedule(clubs).map((listing) => ({ listing, kind: "club" as const })),
  );
  const wellnessRows = upcomingSessions(
    withSchedule(wellness).map((listing) => ({ listing, kind: "wellness" as const })),
  );
  const rows = [...posted, ...clubRows, ...wellnessRows];
  const listings = origin
    ? withDistances([...withSchedule(clubs), ...withSchedule(wellness)], origin)
    : [];
  const within = new Set(
    listings.filter((item) => item.distanceMiles <= Number(radius)).map((item) => item.slug),
  );
  const sessions = origin ? rows.filter((row) => within.has(row.href.split("/").pop() ?? "")) : [];

  return (
    <div className="page-shell">
      <section className="indent" style={{ paddingTop: 74, paddingBottom: 96 }}>
        <div className="eyebrow">This week</div>
        <h1 className="display h1-clubs">What&apos;s on near {district}</h1>
        <p className="hero-sub">
          {origin
            ? `${sessions.length} dated sessions within ${searchRadiusLabel(radius)} of ${district}. Times are this week's occurrence, from the club or venue.`
            : "We couldn't place that postcode."}
        </p>
        <div className="event-sheet" style={{ maxWidth: 840 }}>
          {sessions.map((session) => {
            const slug = session.href.split("/").pop();
            const miles = listings.find((item) => item.slug === slug)?.distanceMiles;
            return (
              <Link
                key={session.key}
                href={`${session.href}?postcode=${encodeURIComponent(postcode)}`}
                className="event-row whats-on-row"
              >
                <PhotoSlot
                  label="session photo"
                  className="result-thumb"
                  src={session.photo}
                />
                <div>
                  <div className="display" style={{ fontSize: 22 }}>
                    {session.title}
                  </div>
                  <p>
                    {session.listingName} · {session.venue}
                    {miles !== undefined ? ` · ${formatMiles(miles)}` : ""}
                    <br />
                    {session.day} · {session.price}
                    {session.posted ? " · posted" : ""}
                  </p>
                </div>
                <Tag label={session.day} tone={session.posted ? "pink" : "sun" } />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
