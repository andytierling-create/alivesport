import { AGE_BANDS, GENDERS, clubs, type AgeBand, type Club, type Gender } from "@/data/clubs";

export const FILTERS = [
  { id: "free-taster", label: "Free taster" },
  { id: "evenings", label: "Evenings" },
] as const;

export const SEARCH_RADII = [
  { id: "1", miles: 1, label: "1 mile" },
  { id: "2", miles: 2, label: "2 miles" },
  { id: "5", miles: 5, label: "5 miles" },
  { id: "10", miles: 10, label: "10 miles" },
  { id: "15", miles: 15, label: "15 miles" },
  { id: "25", miles: 25, label: "25 miles" },
] as const;

export type SearchRadius = (typeof SEARCH_RADII)[number]["id"];
export const DEFAULT_SEARCH_RADIUS: SearchRadius = "5";

export function parseRadius(raw: string | undefined): SearchRadius {
  const value = String(raw ?? "").trim();
  return SEARCH_RADII.some((item) => item.id === value)
    ? (value as SearchRadius)
    : DEFAULT_SEARCH_RADIUS;
}

export function searchRadiusLabel(raw: string | undefined) {
  const radius = parseRadius(raw);
  return SEARCH_RADII.find((item) => item.id === radius)?.label ?? `${radius} miles`;
}

export type FilterId = (typeof FILTERS)[number]["id"];
export type SortId = "nearest" | "soonest" | "price";
export type AccessibleFilter = "yes" | "no" | "";

export type SearchState = {
  q: string;
  postcode: string;
  radius: string;
  day: string;
  age: string;
  gender: string;
  accessible: AccessibleFilter;
  filters: FilterId[];
  sort: SortId;
};

export { AGE_BANDS, GENDERS };

export function parseFilters(raw: string | string[] | undefined): FilterId[] {
  const value = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const ids = new Set(FILTERS.map((filter) => filter.id));
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is FilterId => ids.has(item as FilterId));
}

export function parseSearch(
  params: Record<string, string | string[] | undefined>,
): SearchState {
  const first = (key: string, fallback = "") => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) || fallback;
  };

  const sortRaw = first("sort", "nearest");
  const sort: SortId =
    sortRaw === "soonest" || sortRaw === "price" ? sortRaw : "nearest";

  const accessibleRaw = first("accessible");
  const accessible: AccessibleFilter =
    accessibleRaw === "yes" || accessibleRaw === "no" ? accessibleRaw : "";

  return {
    q: first("q"),
    postcode: first("postcode", "SO14 3ZE"),
    radius: parseRadius(first("radius", DEFAULT_SEARCH_RADIUS)),
    day: first("day", "any"),
    age: first("age"),
    gender: first("gender"),
    accessible,
    filters: parseFilters(params.filters),
    sort,
  };
}

export function postcodeDistrict(postcode: string) {
  const match = postcode.trim().toUpperCase().match(/^[A-Z]{1,2}\d[A-Z\d]?/);
  return match?.[0] ?? "";
}

function matchesQuery(club: Club, q: string) {
  if (!q.trim()) return true;
  const needle = q.toLowerCase();
  return [
    club.name,
    club.sport,
    club.venue,
    club.days,
    ...club.tags.map((tag) => tag.label),
    ...club.sessions.flatMap((session) => [
      session.title ?? "",
      session.day,
      session.time,
    ]),
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function matchesFilter(club: Club, filter: FilterId) {
  switch (filter) {
    case "free-taster":
      return club.freeTaster;
    case "evenings":
      return club.evenings;
  }
}

function isAgeBand(value: string): value is AgeBand {
  return AGE_BANDS.some((band) => band.id === value);
}

function isGender(value: string): value is Gender {
  return GENDERS.some((item) => item.id === value);
}

function matchesAge(club: Club, age: string) {
  if (!age || age === "any") return true;
  if (!isAgeBand(age)) return true;
  return club.ageBands.includes(age);
}

function matchesGender(club: Club, gender: string) {
  if (!gender || gender === "any") return true;
  if (!isGender(gender)) return true;
  return club.gender === gender;
}

function matchesAccessible(club: Club, accessible: AccessibleFilter) {
  if (!accessible) return true;
  return accessible === "yes" ? club.accessible : !club.accessible;
}

function matchesDay(club: Club, day: string) {
  if (!day || day === "any") return true;
  return club.days.toLowerCase().includes(day.slice(0, 3).toLowerCase());
}

export function searchListings(state: SearchState, listings: Club[]): Club[] {
  const radius = Number(parseRadius(state.radius));

  const results = listings.filter((club) => {
    if (club.distanceMiles > radius) return false;
    if (!matchesQuery(club, state.q)) return false;
    if (!matchesAge(club, state.age)) return false;
    if (!matchesGender(club, state.gender)) return false;
    if (!matchesAccessible(club, state.accessible)) return false;
    if (!matchesDay(club, state.day)) return false;
    return state.filters.every((filter) => matchesFilter(club, filter));
  });

  return results.sort((a, b) => {
    if (state.sort === "soonest") return a.soonestMinutes - b.soonestMinutes;
    if (state.sort === "price") {
      const aPrice = a.pricePence ?? Number.MAX_SAFE_INTEGER;
      const bPrice = b.pricePence ?? Number.MAX_SAFE_INTEGER;
      return aPrice - bPrice;
    }
    return a.distanceMiles - b.distanceMiles;
  });
}

export function searchClubs(state: SearchState): Club[] {
  return searchListings(state, clubs);
}

export function sessionCount(results: Club[]) {
  return results.reduce((sum, club) => sum + club.sessions.length, 0);
}

export function offerColor(offer: Club["offer"]) {
  if (offer === "free-taster") return "#FF2FA7";
  if (offer === "access-verified") return "#FFC94D";
  return "#3B96DC";
}
