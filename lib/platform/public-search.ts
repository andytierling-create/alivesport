import { milesBetween, type GeoLocate, locatePostcode } from "@/lib/platform/geo";
import { parseRadius, type SearchRadius } from "@/lib/search";
import type { AgeBand } from "@/data/clubs";
import type {
  Adult,
  Family,
  PlatformEvent,
  PlatformState,
  PublicOrg,
  PublicSearch,
} from "@/lib/platform/types";

export function fitsFamily(
  item: { sport?: string; ageBands: AgeBand[] },
  input: { ageBands: AgeBand[]; categoryLabels: string[] },
) {
  if (input.ageBands.length) {
    const overlap = item.ageBands.some((band) => input.ageBands.includes(band));
    if (!overlap) return false;
  }
  if (input.categoryLabels.length) {
    const sport = (item.sport ?? "").toLowerCase();
    if (!input.categoryLabels.some((label) => label.toLowerCase() === sport)) {
      return false;
    }
  }
  return true;
}

export function shouldStampFitsFamily(
  family: { id: string } | null,
  fit: { ageBands: unknown[]; categoryLabels: unknown[] },
) {
  return Boolean(family) || fit.ageBands.length > 0 || fit.categoryLabels.length > 0;
}

export function familyFitInput(
  adult: Adult,
  state: PlatformState,
  family: Family | null,
) {
  const categoryIds = new Set([
    ...(family?.categoryIds ?? []),
    ...adult.categoryIds,
  ]);
  return {
    ageBands: Array.from(
      new Set([
        ...(family?.childSlots.map((slot) => slot.ageBand) ?? []),
        ...adult.lookingForAgeBands,
      ]),
    ),
    categoryLabels: state.activityCategories
      .filter((item) => categoryIds.has(item.id))
      .map((item) => item.label),
  };
}

function matchesQuery(haystack: string, q: string) {
  if (!q.trim()) return true;
  return haystack.toLowerCase().includes(q.trim().toLowerCase());
}

function withMiles<T extends { lat: number; lng: number }>(
  item: T,
  origin: GeoLocate | null,
): T & { distanceMiles: number | null } {
  return {
    ...item,
    distanceMiles: origin
      ? Math.round(milesBetween(origin, item) * 10) / 10
      : null,
  };
}

export function buildPublicSearch(input: {
  events: PlatformEvent[];
  orgs: PublicOrg[];
  origin?: GeoLocate | null;
  radius?: string;
  q?: string;
}): PublicSearch {
  const origin = input.origin ?? null;
  const radius: SearchRadius = parseRadius(input.radius);
  const miles = Number(radius);
  const q = (input.q ?? "").trim();
  const orgs = input.orgs.map((org) => withMiles(org, origin)).filter((org) => {
    if (origin && (org.distanceMiles ?? Number.POSITIVE_INFINITY) > miles) {
      return false;
    }
    return matchesQuery(`${org.name} ${org.sport} ${org.venue}`, q);
  });
  const orgById = new Map(input.orgs.map((org) => [org.id, org]));
  const events = input.events
    .map((event) => withMiles(event, origin))
    .filter((event) => {
      if (origin && (event.distanceMiles ?? Number.POSITIVE_INFINITY) > miles) {
        return false;
      }
      const org = orgById.get(event.orgId);
      return matchesQuery(
        `${event.title} ${event.venue} ${org?.name ?? ""} ${org?.sport ?? ""}`,
        q,
      );
    });

  return { origin, radius, q, events, orgs };
}

export async function publicSearchFor(input: {
  events: PlatformEvent[];
  orgs: PublicOrg[];
  postcode?: string;
  radius?: string;
  q?: string;
  locate?: typeof locatePostcode;
}): Promise<
  | { ok: true; search: PublicSearch }
  | { ok: false; status: 404; error: string }
> {
  const postcode = input.postcode?.trim() ?? "";
  if (!postcode) {
    return {
      ok: true,
      search: buildPublicSearch({
        events: input.events,
        orgs: input.orgs,
        radius: input.radius,
        q: input.q,
      }),
    };
  }

  const locate = input.locate ?? locatePostcode;
  const origin = await locate(postcode);
  if (!origin) {
    return {
      ok: false,
      status: 404,
      error: "We couldn't place that postcode.",
    };
  }

  return {
    ok: true,
    search: buildPublicSearch({
      events: input.events,
      orgs: input.orgs,
      origin,
      radius: input.radius,
      q: input.q,
    }),
  };
}
