import { join } from "node:path";
import { clubs, type AgeBand, type Gender } from "@/data/clubs";
import { parseRadius } from "@/lib/search";
import { adultInNotifyRadius, locatePostcode } from "@/lib/platform/geo";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/platform/password";
import {
  createNeonSql,
  loadFromFile,
  loadFromNeon,
  saveToFile,
  saveToNeon,
  usesDatabaseUrl,
} from "@/lib/platform/persist";
import { thisWeekStartsAt } from "@/lib/platform/dates";
import { nextStartsAt } from "@/lib/schedule";
import { seedCategories } from "@/lib/platform/family";
import {
  CHILD_SHAPED_KEYS,
  DEMO_ADULT,
  DEMO_ORG,
  type AccessToken,
  type Adult,
  type AdultPatch,
  type CreateEventInput,
  type Credential,
  type EventSource,
  type Org,
  type OrgPatch,
  type PlatformEvent,
  type PlatformState,
  type PublicOrg,
  type SaveSearchInput,
  type SavedSearch,
  type Session,
  type SessionRole,
} from "@/lib/platform/types";

const STORE_PATH = join(process.cwd(), ".data", "platform.json");

const ADULT_ALEX_ID = "adult-alex";
const ORG_BITTERNE_ID = "org-bitterne";

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `org-${Date.now()}`;
}

function uniqueSlug(base: string, taken: Set<string>) {
  let slug = slugify(base);
  let i = 2;
  while (taken.has(slug)) {
    slug = `${slugify(base)}-${i}`;
    i += 1;
  }
  return slug;
}

function clubToOrg(
  club: (typeof clubs)[number],
  options: {
    id: string;
    apiKey: string;
    listing: boolean;
    notifyArea: boolean;
    notifyRadiusMiles?: number;
  },
): Org {
  return {
    id: options.id,
    name: club.name,
    slug: club.slug,
    sport: club.sport,
    venue: club.venue,
    contact: {
      email: club.email,
      phone: club.phone,
      website: club.website,
    },
    lat: club.lat,
    lng: club.lng,
    apiKey: options.apiKey,
    subscription: {
      listing: options.listing,
      notifyArea: options.notifyArea,
    },
    notifyRadiusMiles: options.notifyRadiusMiles,
    ageBands: club.ageBands,
    gender: club.gender,
    accessible: club.accessible,
    distanceMiles: club.distanceMiles,
  };
}

function sessionToEvent(
  club: (typeof clubs)[number],
  orgId: string,
  session: (typeof clubs)[number]["sessions"][number],
  index: number,
  now: Date,
): PlatformEvent {
  return {
    id: `evt-seed-${club.slug}-${index}`,
    orgId,
    title: session.title ?? `${club.sport} · ${session.day}`,
    startsAt: (nextStartsAt(session.day, session.time, now) ?? new Date(thisWeekStartsAt(session.day, session.time, now))).toISOString(),
    venue: club.venue,
    lat: club.lat,
    lng: club.lng,
    ageBands: club.ageBands,
    gender: club.gender,
    accessible: club.accessible,
    price: session.price,
    notes: "",
    publishOnAliveSport: true,
    source: "desk",
    seriesId: `weekly-${club.slug}-${session.day.toLowerCase()}`,
  };
}

export function seedPlatform(now = new Date()): PlatformState {
  const orgs: Org[] = [];
  const events: PlatformEvent[] = [];
  const credentials: Credential[] = [];

  for (const club of clubs) {
    const isBitterne = club.slug === DEMO_ORG.slug;
    const org = clubToOrg(club, {
      id: isBitterne ? ORG_BITTERNE_ID : `org-${club.slug}`,
      apiKey: isBitterne ? DEMO_ORG.apiKey : `ask_${club.slug.replace(/-/g, "_")}`,
      listing: true,
      notifyArea: isBitterne,
      notifyRadiusMiles: isBitterne ? 5 : undefined,
    });
    orgs.push(org);
    club.sessions.forEach((session, index) => {
      if (!/^\d{1,2}(?::\d{2})?\s*(am|pm)$/i.test(session.time.trim())) return;
      events.push(sessionToEvent(club, org.id, session, index, now));
    });
  }

  events.push({
    id: "evt-floodlit",
    orgId: ORG_BITTERNE_ID,
    title: "Friday floodlit social",
    startsAt: (nextStartsAt("Friday", "7:00pm", now) ?? new Date(thisWeekStartsAt("Friday", "7:00pm", now))).toISOString(),
    venue: "Bitterne Leisure Centre",
    lat: 50.916862,
    lng: -1.355712,
    ageBands: ["10-18"],
    gender: "women",
    accessible: true,
    price: "£4",
    notes: "Beginners welcome. Arrive 10 minutes early for a warm-up.",
    publishOnAliveSport: true,
    source: "desk",
  });

  const alex: Adult = {
    id: ADULT_ALEX_ID,
    displayName: DEMO_ADULT.name,
    email: DEMO_ADULT.email,
    postcode: "SO14 3ZE",
    lookingForAgeBands: [],
    gender: "any",
    accessible: false,
    notifyOptIn: true,
    categoryIds: [],
  };

  credentials.push(
    {
      email: DEMO_ADULT.email,
      password: hashPassword(DEMO_ADULT.password),
      role: "adult",
      subjectId: ADULT_ALEX_ID,
    },
    {
      email: DEMO_ORG.email,
      password: hashPassword(DEMO_ORG.password),
      role: "org",
      subjectId: ORG_BITTERNE_ID,
    },
  );

  return {
    orgs,
    events,
    adults: [alex],
    credentials,
    lastNotice: "1 adult in this demo would be told — if this were live.",
    savedSearches: [],
    tokens: [],
    families: [],
    familyInvites: [],
    activityCategories: seedCategories(),
  };
}

let memory: PlatformState | null = null;
let neonVersion = 0;
let neonSql: ReturnType<typeof createNeonSql> | null = null;

export function storePath() {
  return STORE_PATH;
}

function sqlClient() {
  if (!neonSql) neonSql = createNeonSql();
  return neonSql;
}

async function persist(state: PlatformState) {
  if (usesDatabaseUrl()) {
    neonVersion = await saveToNeon(sqlClient(), state, neonVersion);
    memory = state;
    return;
  }
  await saveToFile(STORE_PATH, state);
  memory = state;
}

export async function readPlatform(): Promise<PlatformState> {
  if (usesDatabaseUrl()) {
    const loaded = await loadFromNeon(sqlClient(), seedPlatform);
    memory = loaded.state;
    neonVersion = loaded.version;
    return loaded.state;
  }
  if (memory) return memory;
  memory = await loadFromFile(STORE_PATH, seedPlatform);
  return memory;
}

export async function writePlatform(state: PlatformState) {
  await persist(state);
}

export async function resetPlatform() {
  const seeded = seedPlatform();
  if (usesDatabaseUrl()) {
    const loaded = await loadFromNeon(sqlClient(), seedPlatform);
    neonVersion = loaded.version;
  }
  await persist(seeded);
  return seeded;
}

export async function replacePlatform(state: PlatformState) {
  await persist(state);
  return state;
}

async function commit(next: PlatformState) {
  await persist(next);
  return next;
}

export function publicEvents(state: PlatformState) {
  return state.events
    .filter((event) => event.publishOnAliveSport)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function eventsForOrg(orgId: string, state: PlatformState) {
  return state.events
    .filter((event) => event.orgId === orgId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function findOrg(id: string, state: PlatformState) {
  return state.orgs.find((org) => org.id === id) ?? null;
}

export function findOrgBySlug(slug: string, state: PlatformState) {
  return state.orgs.find((org) => org.slug === slug) ?? null;
}

export function findOrgByApiKey(apiKey: string, state: PlatformState) {
  return state.orgs.find((org) => org.apiKey === apiKey) ?? null;
}

export function findAdult(id: string, state: PlatformState) {
  return state.adults.find((adult) => adult.id === id) ?? null;
}

export function findCredential(email: string, state: PlatformState) {
  return (
    state.credentials.find((item) => item.email === email.trim().toLowerCase()) ??
    null
  );
}

export function authenticate(
  email: string,
  password: string,
  state: PlatformState,
): Session | null {
  const match = state.credentials.find(
    (item) => item.email === email.trim().toLowerCase(),
  );
  if (!match || !verifyPassword(password, match.password)) return null;
  return { role: match.role, subjectId: match.subjectId };
}

export function withUpgradedPassword(
  state: PlatformState,
  email: string,
  password: string,
) {
  const normalised = email.trim().toLowerCase();
  const needsUpgrade = state.credentials.some(
    (item) => item.email === normalised && !isHashedPassword(item.password),
  );
  if (!needsUpgrade) return state;
  return {
    ...state,
    credentials: state.credentials.map((item) =>
      item.email === normalised && !isHashedPassword(item.password)
        ? { ...item, password: hashPassword(password) }
        : item,
    ),
  };
}

export function issueTokenOn(
  state: PlatformState,
  role: SessionRole,
  subjectId: string,
) {
  const token: AccessToken = {
    token: `tok_${Math.random().toString(36).slice(2, 18)}`,
    role,
    subjectId,
    createdAt: new Date().toISOString(),
  };
  return {
    token,
    state: { ...state, tokens: [...(state.tokens ?? []), token] },
  };
}

export async function issueToken(
  role: SessionRole,
  subjectId: string,
  state?: PlatformState,
) {
  const current = state ?? (await readPlatform());
  const result = issueTokenOn(current, role, subjectId);
  await commit(result.state);
  return result.token;
}

export function findAccessToken(raw: string, state: PlatformState) {
  return (state.tokens ?? []).find((item) => item.token === raw) ?? null;
}

export function revokeTokenOn(state: PlatformState, raw: string) {
  return {
    ...state,
    tokens: (state.tokens ?? []).filter((item) => item.token !== raw),
  };
}

export async function revokeToken(raw: string, state?: PlatformState) {
  const current = state ?? (await readPlatform());
  await commit(revokeTokenOn(current, raw));
}

export function actorForSession(session: Session | null, state: PlatformState) {
  if (!session) return null;
  if (session.role === "adult") {
    const adult = findAdult(session.subjectId, state);
    return adult ? { role: "adult" as const, adult } : null;
  }
  const org = findOrg(session.subjectId, state);
  return org ? { role: "org" as const, org } : null;
}

export function publicOrg(org: Org): PublicOrg {
  const { apiKey: _apiKey, ...rest } = org;
  return rest;
}

export function createEventOn(
  state: PlatformState,
  org: Org,
  input: CreateEventInput,
  source: EventSource,
): { ok: true; event: PlatformEvent; state: PlatformState } | { ok: false; status: number; error: string } {
  if (!org.subscription.listing) {
    return {
      ok: false,
      status: 402,
      error: "Listing subscription required to post an event.",
    };
  }
  const title = input.title?.trim();
  if (!title) return { ok: false, status: 400, error: "Title is required." };
  if (!input.startsAt) return { ok: false, status: 400, error: "startsAt is required." };
  const starts = new Date(input.startsAt);
  if (Number.isNaN(starts.getTime())) {
    return { ok: false, status: 400, error: "startsAt must be an ISO datetime." };
  }

  const event: PlatformEvent = {
    id: newId("evt"),
    orgId: org.id,
    title,
    startsAt: starts.toISOString(),
    endsAt: input.endsAt,
    venue: input.venue?.trim() || org.venue,
    lat: input.lat ?? org.lat,
    lng: input.lng ?? org.lng,
    ageBands: input.ageBands?.length ? input.ageBands : org.ageBands,
    gender: input.gender ?? org.gender,
    accessible: Boolean(input.accessible),
    price: input.price?.trim() || "Pay as you go",
    notes: input.notes?.trim() || "",
    publishOnAliveSport: Boolean(input.publishOnAliveSport),
    source,
    seriesId: input.seriesId,
  };

  return {
    ok: true,
    event,
    state: { ...state, events: [...state.events, event] },
  };
}

export async function createEvent(
  org: Org,
  input: CreateEventInput,
  source: EventSource,
  state?: PlatformState,
) {
  const current = state ?? (await readPlatform());
  const result = createEventOn(current, org, input, source);
  if (!result.ok) return result;
  await commit(result.state);
  return result;
}

export function deleteEventOn(state: PlatformState, orgId: string, eventId: string) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event || event.orgId !== orgId) {
    return { ok: false as const, status: 404, error: "Event not found." };
  }
  return {
    ok: true as const,
    state: {
      ...state,
      events: state.events.filter((item) => item.id !== eventId),
    },
  };
}

export async function deleteEvent(orgId: string, eventId: string, state?: PlatformState) {
  const current = state ?? (await readPlatform());
  const result = deleteEventOn(current, orgId, eventId);
  if (!result.ok) return result;
  await commit(result.state);
  return result;
}

export function childShapedKeysIn(body: Record<string, unknown>) {
  return CHILD_SHAPED_KEYS.filter((key) => Object.hasOwn(body, key));
}

export function patchAdultOn(
  state: PlatformState,
  adultId: string,
  body: Record<string, unknown>,
):
  | { ok: true; adult: Adult; state: PlatformState }
  | { ok: false; status: number; error: string } {
  const forbidden = childShapedKeysIn(body);
  if (forbidden.length) {
    return {
      ok: false,
      status: 400,
      error: `Adult profiles do not store ${forbidden.join(", ")}.`,
    };
  }
  const adult = state.adults.find((item) => item.id === adultId);
  if (!adult) return { ok: false, status: 404, error: "Adult not found." };

  const patch = body as AdultPatch;
  const next: Adult = {
    ...adult,
    displayName: patch.displayName?.trim() || adult.displayName,
    postcode: patch.postcode?.trim() || adult.postcode,
    lookingForAgeBands: Array.isArray(patch.lookingForAgeBands)
      ? patch.lookingForAgeBands
      : adult.lookingForAgeBands,
    gender: patch.gender ?? adult.gender,
    accessible:
      typeof patch.accessible === "boolean" ? patch.accessible : adult.accessible,
    notifyOptIn:
      typeof patch.notifyOptIn === "boolean" ? patch.notifyOptIn : adult.notifyOptIn,
  };

  return {
    ok: true,
    adult: next,
    state: {
      ...state,
      adults: state.adults.map((item) => (item.id === adultId ? next : item)),
    },
  };
}

export async function patchAdult(
  adultId: string,
  body: Record<string, unknown>,
  state?: PlatformState,
) {
  const current = state ?? (await readPlatform());
  const result = patchAdultOn(current, adultId, body);
  if (!result.ok) return result;
  await commit(result.state);
  return result;
}

export function patchOrgOn(
  state: PlatformState,
  orgId: string,
  patch: OrgPatch,
):
  | { ok: true; org: Org; state: PlatformState }
  | { ok: false; status: number; error: string } {
  const org = state.orgs.find((item) => item.id === orgId);
  if (!org) return { ok: false, status: 404, error: "Organisation not found." };

  const next: Org = {
    ...org,
    name: patch.name?.trim() || org.name,
    sport: patch.sport?.trim() || org.sport,
    venue: patch.venue?.trim() || org.venue,
    contact: {
      ...org.contact,
      ...patch.contact,
    },
    ageBands: patch.ageBands ?? org.ageBands,
    gender: patch.gender ?? org.gender,
    accessible:
      typeof patch.accessible === "boolean" ? patch.accessible : org.accessible,
    subscription: {
      ...org.subscription,
      ...patch.subscription,
    },
    notifyRadiusMiles: patch.notifyRadiusMiles ?? org.notifyRadiusMiles,
  };

  return {
    ok: true,
    org: next,
    state: {
      ...state,
      orgs: state.orgs.map((item) => (item.id === orgId ? next : item)),
    },
  };
}

export async function patchOrg(orgId: string, patch: OrgPatch, state?: PlatformState) {
  const current = state ?? (await readPlatform());
  const result = patchOrgOn(current, orgId, patch);
  if (!result.ok) return result;
  await commit(result.state);
  return result;
}

export function previewNotifyOn(state: PlatformState, org: Org) {
  if (!org.subscription.notifyArea) {
    return {
      ok: false as const,
      status: 402,
      error: "Notify-area add-on required to preview a send.",
    };
  }
  const adults = state.adults.filter(
    (adult) => adult.notifyOptIn && adultInNotifyRadius(adult.postcode, org),
  );
  return {
    ok: true as const,
    count: adults.length,
    message:
      adults.length > 0
        ? `${adults.length} adult${adults.length === 1 ? "" : "s"} in this demo would be told — if this were live.`
        : "No opted-in adults in this demo sit inside the notify radius.",
  };
}

export async function previewNotify(org: Org, state?: PlatformState) {
  const current = state ?? (await readPlatform());
  await Promise.all(
    current.adults
      .filter((adult) => adult.notifyOptIn)
      .map((adult) => locatePostcode(adult.postcode)),
  );
  const result = previewNotifyOn(current, org);
  if (result.ok) await commit({ ...current, lastNotice: result.message });
  return result;
}

export function lastNoticeFor(adult: Adult, state: PlatformState) {
  if (!adult.notifyOptIn) return null;
  return state.lastNotice ?? null;
}

export function searchesFor(adult: Adult, state: PlatformState) {
  return (state.savedSearches ?? []).filter(
    (search) => search.adultId === adult.id || search.email === adult.email,
  );
}

export function saveSearchOn(
  state: PlatformState,
  input: SaveSearchInput & Record<string, unknown>,
):
  | { ok: true; search: SavedSearch; state: PlatformState }
  | { ok: false; status: number; error: string } {
  const forbidden = childShapedKeysIn(input);
  if (forbidden.length) {
    return {
      ok: false,
      status: 400,
      error: `Saved searches do not store ${forbidden.join(", ")}.`,
    };
  }
  const email = String(input.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, status: 400, error: "A valid email is required." };
  }
  const adult =
    state.adults.find((item) => item.id === input.adultId) ??
    state.adults.find((item) => item.email === email) ??
    null;
  const search: SavedSearch = {
    id: newId("search"),
    email,
    adultId: adult?.id,
    q: String(input.q ?? "").trim(),
    postcode: String(input.postcode ?? adult?.postcode ?? "SO14 3ZE").trim(),
    radius: parseRadius(input.radius),
    day: String(input.day ?? "any"),
    age: String(input.age ?? ""),
    gender: String(input.gender ?? ""),
    accessible: String(input.accessible ?? ""),
    filters: Array.isArray(input.filters)
      ? input.filters.map((item) => String(item))
      : [],
    createdAt: new Date().toISOString(),
  };
  const adults = adult
    ? state.adults.map((item) =>
        item.id === adult.id
          ? {
              ...item,
              notifyOptIn: true,
              postcode: search.postcode || item.postcode,
            }
          : item,
      )
    : state.adults;
  return {
    ok: true,
    search,
    state: {
      ...state,
      adults,
      savedSearches: [...(state.savedSearches ?? []), search],
    },
  };
}

export async function saveSearch(
  input: SaveSearchInput & Record<string, unknown>,
  state?: PlatformState,
) {
  const current = state ?? (await readPlatform());
  const result = saveSearchOn(current, input);
  if (!result.ok) return result;
  await commit(result.state);
  return result;
}

export function registerAdultOn(
  state: PlatformState,
  input: {
    email: string;
    password: string;
    displayName: string;
    postcode?: string;
    lookingForAgeBands?: AgeBand[];
    gender?: Gender | "any";
    accessible?: boolean;
    notifyOptIn?: boolean;
  },
) {
  const email = input.email.trim().toLowerCase();
  if (state.credentials.some((item) => item.email === email)) {
    return { ok: false as const, status: 409, error: "That email is already in use." };
  }
  const id = newId("adult");
  const adult: Adult = {
    id,
    displayName: input.displayName.trim() || "Player",
    email,
    postcode: input.postcode?.trim() || "SO14 3ZE",
    lookingForAgeBands: input.lookingForAgeBands ?? [],
    gender: input.gender ?? "any",
    accessible: Boolean(input.accessible),
    notifyOptIn: input.notifyOptIn ?? true,
    categoryIds: [],
  };
  return {
    ok: true as const,
    session: { role: "adult" as const, subjectId: id },
    adult,
    state: {
      ...state,
      adults: [...state.adults, adult],
      credentials: [
        ...state.credentials,
        { email, password: hashPassword(input.password), role: "adult" as const, subjectId: id },
      ],
    },
  };
}

export async function registerAdult(
  input: Parameters<typeof registerAdultOn>[1],
  state?: PlatformState,
) {
  const current = state ?? (await readPlatform());
  const result = registerAdultOn(current, input);
  if (!result.ok) return result;
  await commit(result.state);
  return result;
}

export function registerOrgOn(
  state: PlatformState,
  input: {
    email: string;
    password: string;
    name: string;
    sport: string;
    venue: string;
    phone?: string;
    contactEmail?: string;
    website?: string;
    ageBands?: AgeBand[];
    gender?: Gender;
    accessible?: boolean;
    lat?: number;
    lng?: number;
    postcode?: string;
  },
) {
  const email = input.email.trim().toLowerCase();
  if (state.credentials.some((item) => item.email === email)) {
    return { ok: false as const, status: 409, error: "That email is already in use." };
  }
  if (typeof input.lat !== "number" || typeof input.lng !== "number") {
    return {
      ok: false as const,
      status: 400,
      error: "A placeable postcode is required so the club is not dropped on Southampton.",
    };
  }
  const taken = new Set(state.orgs.map((org) => org.slug));
  const id = newId("org");
  const org: Org = {
    id,
    name: input.name.trim(),
    slug: uniqueSlug(input.name, taken),
    sport: input.sport.trim(),
    venue: input.venue.trim(),
    contact: {
      email: input.contactEmail?.trim() || email,
      phone: input.phone?.trim() || "",
      website: input.website?.trim() || "",
    },
    lat: input.lat,
    lng: input.lng,
    apiKey: `ask_${id.replace(/-/g, "_")}`,
    subscription: { listing: true, notifyArea: false },
    ageBands: input.ageBands?.length ? input.ageBands : ["adult"],
    gender: input.gender ?? "mixed",
    accessible: Boolean(input.accessible),
    distanceMiles: 1.8,
  };
  return {
    ok: true as const,
    session: { role: "org" as const, subjectId: id },
    org,
    state: {
      ...state,
      orgs: [...state.orgs, org],
      credentials: [
        ...state.credentials,
        { email, password: hashPassword(input.password), role: "org" as const, subjectId: id },
      ],
    },
  };
}

export async function registerOrg(
  input: Parameters<typeof registerOrgOn>[1],
  state?: PlatformState,
) {
  const located =
    typeof input.lat === "number" && typeof input.lng === "number"
      ? { lat: input.lat, lng: input.lng }
      : input.postcode
        ? await locatePostcode(input.postcode)
        : null;
  if (!located) {
    return {
      ok: false as const,
      status: 400,
      error: "A placeable UK postcode is required so the club can be found on the map.",
    };
  }
  const current = state ?? (await readPlatform());
  const result = registerOrgOn(current, {
    ...input,
    lat: located.lat,
    lng: located.lng,
  });
  if (!result.ok) return result;
  await commit(result.state);
  return result;
}
