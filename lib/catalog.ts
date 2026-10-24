import { clubs, type Club } from "@/data/clubs";
import { wellness } from "@/data/wellness";
import { isDemoEnabled } from "@/lib/demo-flag";
import { mergeClubListings, type DemoSnapshot } from "@/lib/demo-store";

/**
 * Public read path for listings.
 * Today this is static data, plus the local demo overlay when the demo flag is on.
 * A future API should return the same Club shape so search and What's on stay put.
 */
export function clubListings(demoState?: DemoSnapshot): Club[] {
  if (isDemoEnabled() && demoState) return mergeClubListings(clubs, demoState);
  return clubs;
}

export function wellnessListings(): Club[] {
  return wellness;
}

export function allPublicListings(demoState?: DemoSnapshot): Club[] {
  return [...clubListings(demoState), ...wellnessListings()];
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
};

export function upcomingSessions(
  listings: { listing: Club; kind: "club" | "wellness" }[],
): UpcomingSession[] {
  return listings.flatMap(({ listing, kind }) =>
    listing.sessions.map((session, index) => ({
      key: `${listing.slug}-${index}`,
      href: listingHref(listing, kind),
      listingName: listing.name,
      venue: listing.venue,
      title: session.title ?? `${listing.sport} · ${session.day}`,
      day: session.day,
      time: session.time,
      price: session.price,
      photo: listing.photo,
    })),
  );
}
