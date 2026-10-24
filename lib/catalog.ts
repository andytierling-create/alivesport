import { clubs, type Club } from "@/data/clubs";
import { wellness } from "@/data/wellness";
import { isPlatformEnabled } from "@/lib/demo-flag";
import {
  formatClock,
  formatEventWhen,
  isEveningIso,
  weekdayName,
} from "@/lib/platform/dates";
import { nextStartsAt } from "@/lib/schedule";
import type { PlatformEvent, PublicOrg } from "@/lib/platform/types";

/**
 * Public read path for listings.
 * Static clubs stay as the base. When the local demo is on, published events
 * from /api/events overlay those listings.
 */
export function listingsFromPublishedEvents(
  base: Club[],
  events: PlatformEvent[],
  orgs: PublicOrg[],
): Club[] {
  const map = new Map(
    base.map((club) => [club.slug, { ...club, sessions: [...club.sessions] }]),
  );
  const eventsByOrg = new Map<string, PlatformEvent[]>();
  for (const event of events) {
    const list = eventsByOrg.get(event.orgId) ?? [];
    list.push(event);
    eventsByOrg.set(event.orgId, list);
  }

  for (const org of orgs) {
    const orgEvents = eventsByOrg.get(org.id) ?? [];
    const extra = orgEvents.map(eventToSession);
    const existing = map.get(org.slug);
    if (existing) {
      const sessions = extra.length ? extra : existing.sessions;
      map.set(org.slug, {
        ...existing,
        name: org.name,
        sport: org.sport,
        venue: org.venue,
        phone: org.contact.phone,
        email: org.contact.email,
        website: org.contact.website,
        ageBands: [
          ...new Set([...org.ageBands, ...orgEvents.flatMap((event) => event.ageBands)]),
        ],
        gender: org.gender,
        accessible: org.accessible || orgEvents.some((event) => event.accessible),
        sessions,
        days: summariseDays(sessions),
        evenings: existing.evenings || orgEvents.some((event) => isEveningIso(event.startsAt)),
        tags: extra.some((session) => session.demo)
          ? [
              ...existing.tags.filter((tag) => tag.label !== "New session"),
              { label: "New session", tone: "pink" },
            ]
          : existing.tags,
      });
    } else {
      const sessions = extra.length
        ? extra
        : [
            {
              day: "Weekly",
              time: "see timetable",
              price: "Ask the club",
              title: "Times from the club",
            },
          ];
      map.set(org.slug, {
        slug: org.slug,
        name: org.name,
        sport: org.sport,
        venue: org.venue,
        postcode: "",
        distanceMiles: org.distanceMiles,
        days: summariseDays(sessions),
        soonestMinutes: Number.POSITIVE_INFINITY,
        pricePence: 400,
        priceLabel: extra[0]?.price ?? "Pay as you go",
        priceNote: "listed by the club",
        offer: "payg",
        tags: [{ label: "Listed this week", tone: "pink" }],
        accessVerified: "club-reported",
        accessFlags: org.accessible ? ["step-free"] : [],
        ageBands: org.ageBands,
        gender: org.gender,
        accessible: org.accessible,
        freeTaster: false,
        evenings: orgEvents.some((event) => isEveningIso(event.startsAt)),
        tilt: 0.3,
        lat: org.lat,
        lng: org.lng,
        phone: org.contact.phone,
        email: org.contact.email,
        website: org.contact.website,
        sessions,
      });
    }
  }

  return [...map.values()];
}

function eventToSession(event: PlatformEvent): Club["sessions"][number] {
  const seeded = event.id.startsWith("evt-seed-");
  return {
    day: weekdayName(event.startsAt),
    time: formatClock(event.startsAt),
    price: event.price,
    title: event.title,
    demo: !seeded,
  };
}

function summariseDays(sessions: Club["sessions"]) {
  const ordered = [...sessions].sort(
    (a, b) => Number(Boolean(b.demo)) - Number(Boolean(a.demo)),
  );
  return ordered
    .slice(0, 3)
    .map((session) =>
      session.demo && session.title
        ? `${session.title} · ${session.day.slice(0, 3)} ${session.time}`
        : `${session.day.slice(0, 3)} ${session.time}`,
    )
    .join(", ");
}

export function clubListings(
  events: PlatformEvent[] = [],
  orgs: PublicOrg[] = [],
): Club[] {
  if (isPlatformEnabled() && (events.length || orgs.length)) {
    return listingsFromPublishedEvents(clubs, events, orgs);
  }
  return clubs;
}

export function wellnessListings(): Club[] {
  return wellness;
}

export function allPublicListings(
  events: PlatformEvent[] = [],
  orgs: PublicOrg[] = [],
): Club[] {
  return [...clubListings(events, orgs), ...wellnessListings()];
}

export function listingHref(listing: Club, kind: "club" | "wellness" = "club") {
  return kind === "wellness" ? `/wellness/${listing.slug}` : `/clubs/${listing.slug}`;
}

export function findWellness(slug: string) {
  return wellness.find((item) => item.slug === slug);
}

export function listingInventory(listings: Club[]) {
  return {
    listed: listings.length,
    sessions: listings.reduce((sum, listing) => sum + listing.sessions.length, 0),
    freeTasters: listings.filter((listing) => listing.freeTaster).length,
    accessible: listings.filter((listing) => listing.accessible).length,
  };
}

export type UpcomingSession = {
  key: string;
  href: string;
  listingName: string;
  venue: string;
  title: string;
  day: string;
  time: string;
  price: string;
  photo?: string;
  posted?: boolean;
};

export function upcomingSessions(
  listings: { listing: Club; kind: "club" | "wellness" }[],
): UpcomingSession[] {
  return listings.flatMap(({ listing, kind }) =>
    listing.sessions.flatMap((session, index) => {
      if (!/^\d{1,2}(?::\d{2})?\s*(am|pm)$/i.test(session.time.trim())) return [];
      const next = nextStartsAt(session.day, session.time);
      const when = next ? formatEventWhen(next.toISOString()) : null;
      return [
        {
          key: `${listing.slug}-${index}`,
          href: listingHref(listing, kind),
          listingName: listing.name,
          venue: listing.venue,
          title: session.title ?? `${listing.sport} · ${session.day}`,
          day: when?.label ?? session.day,
          time: when?.time ?? session.time,
          price: session.price,
          photo: listing.photo,
          posted: session.demo,
        },
      ];
    }),
  );
}

export function upcomingFromEvents(
  events: PlatformEvent[],
  orgs: PublicOrg[],
): UpcomingSession[] {
  const orgById = new Map(orgs.map((org) => [org.id, org]));
  return events
    .slice()
    .filter((event) => new Date(event.startsAt).getTime() >= Date.now() - 30 * 60 * 1000)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .flatMap((event) => {
      const org = orgById.get(event.orgId);
      if (!org) return [];
      return [
        {
          key: event.id,
          href: listingHref({ slug: org.slug } as Club),
          listingName: org.name,
          venue: event.venue || org.venue,
          title: event.title,
          day: formatEventWhen(event.startsAt).label,
          time: formatClock(event.startsAt),
          price: event.price,
          posted: !event.id.startsWith("evt-seed-"),
        },
      ];
    });
}

export function findListing(
  slug: string,
  events: PlatformEvent[] = [],
  orgs: PublicOrg[] = [],
) {
  return clubListings(events, orgs).find((club) => club.slug === slug);
}
