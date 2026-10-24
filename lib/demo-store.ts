import {
  clubs,
  type AgeBand,
  type Club,
  type Gender,
} from "@/data/clubs";

export const DEMO_STORAGE_KEY = "alive-sport-demo-v1";

export const DEMO_PLAYER = {
  email: "alex@demo.alivesport",
  password: "play",
  name: "Alex Rivers",
} as const;

export const DEMO_CLUB = {
  email: "clubs@demo.alivesport",
  password: "list",
  name: "Bitterne Netball",
  slug: "bitterne-netball",
} as const;

export type DemoRole = "player" | "club";

export type DemoAccount = {
  id: string;
  email: string;
  password: string;
  role: DemoRole;
};

export type PlayerProfile = {
  displayName: string;
  postcode: string;
  ageBand: AgeBand | "any";
  gender: Gender | "any";
  accessible: boolean;
  notifyOptIn: boolean;
};

export type DemoEvent = {
  id: string;
  title: string;
  day: string;
  time: string;
  price: string;
  ageBands: AgeBand[];
  gender: Gender;
  accessible: boolean;
  notes: string;
};

export type DemoClubRecord = {
  ownerId: string;
  slug: string;
  listing: {
    name: string;
    sport: string;
    venue: string;
    phone: string;
    email: string;
    website: string;
    ageBands: AgeBand[];
    gender: Gender;
    accessible: boolean;
    lat: number;
    lng: number;
    distanceMiles: number;
  };
  events: DemoEvent[];
};

export type DemoSnapshot = {
  accounts: DemoAccount[];
  sessionUserId: string | null;
  players: Record<string, PlayerProfile>;
  clubs: DemoClubRecord[];
  lastNotice: string | null;
};

const PLAYER_ID = "acct-alex";
const CLUB_ID = "acct-bitterne";

function seedEvent(): DemoEvent {
  return {
    id: "evt-floodlit",
    title: "Friday floodlit social",
    day: "Friday",
    time: "7:00pm",
    price: "£4",
    ageBands: ["10-18"],
    gender: "women",
    accessible: true,
    notes: "Beginners welcome. Arrive 10 minutes early for a warm-up.",
  };
}

export function seedSnapshot(): DemoSnapshot {
  const bitterne = clubs.find((club) => club.slug === DEMO_CLUB.slug)!;
  return {
    accounts: [
      {
        id: PLAYER_ID,
        email: DEMO_PLAYER.email,
        password: DEMO_PLAYER.password,
        role: "player",
      },
      {
        id: CLUB_ID,
        email: DEMO_CLUB.email,
        password: DEMO_CLUB.password,
        role: "club",
      },
    ],
    sessionUserId: null,
    players: {
      [PLAYER_ID]: {
        displayName: DEMO_PLAYER.name,
        postcode: "SO14 3ZE",
        ageBand: "any",
        gender: "any",
        accessible: false,
        notifyOptIn: true,
      },
    },
    clubs: [
      {
        ownerId: CLUB_ID,
        slug: bitterne.slug,
        listing: {
          name: bitterne.name,
          sport: bitterne.sport,
          venue: bitterne.venue,
          phone: bitterne.phone,
          email: bitterne.email,
          website: bitterne.website,
          ageBands: bitterne.ageBands,
          gender: bitterne.gender,
          accessible: bitterne.accessible,
          lat: bitterne.lat,
          lng: bitterne.lng,
          distanceMiles: bitterne.distanceMiles,
        },
        events: [seedEvent()],
      },
    ],
    lastNotice: null,
  };
}

function canUseStorage() {
  return typeof window !== "undefined";
}

let cached: DemoSnapshot | null = null;
let cachedRaw: string | null = null;

export function readSnapshot(): DemoSnapshot {
  if (!canUseStorage()) return seedSnapshot();
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw === cachedRaw && cached) return cached;
    if (!raw) {
      const seeded = seedSnapshot();
      const serialised = JSON.stringify(seeded);
      window.localStorage.setItem(DEMO_STORAGE_KEY, serialised);
      cached = seeded;
      cachedRaw = serialised;
      return seeded;
    }
    cached = JSON.parse(raw) as DemoSnapshot;
    cachedRaw = raw;
    return cached;
  } catch {
    const seeded = seedSnapshot();
    cached = seeded;
    cachedRaw = JSON.stringify(seeded);
    return seeded;
  }
}

export function writeSnapshot(next: DemoSnapshot) {
  cached = next;
  cachedRaw = JSON.stringify(next);
  if (!canUseStorage()) return;
  window.localStorage.setItem(DEMO_STORAGE_KEY, cachedRaw);
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `club-${Date.now()}`;
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

function isEvening(time: string) {
  const match = time.match(/(\d+)/);
  const hour = Number(match?.[1] ?? 0);
  const pm = /pm/i.test(time);
  const hour24 = pm && hour < 12 ? hour + 12 : hour;
  return hour24 >= 17;
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

export function mergeClubListings(
  base: Club[] = clubs,
  state: DemoSnapshot = readSnapshot(),
): Club[] {
  const map = new Map(
    base.map((club) => [club.slug, { ...club, sessions: [...club.sessions] }]),
  );

  for (const record of state.clubs) {
    const extra = record.events.map((event) => ({
      day: event.day,
      time: event.time,
      price: event.price,
      title: event.title,
      demo: true as const,
    }));
    const existing = map.get(record.slug);
    if (existing) {
      const sessions = [...existing.sessions, ...extra];
      const ageBands = [
        ...new Set([
          ...record.listing.ageBands,
          ...record.events.flatMap((event) => event.ageBands),
        ]),
      ];
      map.set(record.slug, {
        ...existing,
        name: record.listing.name,
        sport: record.listing.sport,
        venue: record.listing.venue,
        phone: record.listing.phone,
        email: record.listing.email,
        website: record.listing.website,
        ageBands,
        gender: record.listing.gender,
        accessible:
          record.listing.accessible || record.events.some((event) => event.accessible),
        sessions,
        days: summariseDays(sessions),
        evenings: existing.evenings || record.events.some((event) => isEvening(event.time)),
        tags: extra.length
          ? [...existing.tags.filter((tag) => tag.label !== "New session"), { label: "New session", tone: "pink" }]
          : existing.tags,
      });
    } else {
      const sessions = extra.length
        ? extra
        : [{ day: "Saturday", time: "10:00am", price: "Pay as you go" }];
      map.set(record.slug, {
        slug: record.slug,
        name: record.listing.name,
        sport: record.listing.sport,
        venue: record.listing.venue,
        distanceMiles: record.listing.distanceMiles,
        days: summariseDays(sessions),
        soonestMinutes: 12 * 60,
        pricePence: 400,
        priceLabel: extra[0]?.price ?? "Pay as you go",
        priceNote: "listed by the club",
        offer: "payg",
        tags: [{ label: "Listed this week", tone: "pink" }],
        accessVerified: "club-reported",
        accessFlags: record.listing.accessible ? ["step-free"] : [],
        ageBands: record.listing.ageBands,
        gender: record.listing.gender,
        accessible: record.listing.accessible,
        freeTaster: false,
        evenings: record.events.some((event) => isEvening(event.time)),
        tilt: 0.3,
        lat: record.listing.lat,
        lng: record.listing.lng,
        phone: record.listing.phone,
        email: record.listing.email,
        website: record.listing.website,
        sessions,
      });
    }
  }

  return [...map.values()];
}

export function findMergedClub(
  slug: string,
  base: Club[] = clubs,
  state?: DemoSnapshot,
) {
  return mergeClubListings(base, state).find((club) => club.slug === slug);
}

export function currentAccount(state: DemoSnapshot) {
  return state.accounts.find((account) => account.id === state.sessionUserId) ?? null;
}

export function clubRecordFor(state: DemoSnapshot, userId: string) {
  return state.clubs.find((club) => club.ownerId === userId) ?? null;
}

export function optedInPlayers(state: DemoSnapshot) {
  return Object.values(state.players).filter((player) => player.notifyOptIn);
}

export function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function registerPlayerAccount(
  state: DemoSnapshot,
  input: { email: string; password: string; profile: PlayerProfile },
) {
  const email = input.email.trim().toLowerCase();
  if (state.accounts.some((account) => account.email === email)) {
    throw new Error("That email is already in use in this browser demo.");
  }
  const id = newId("acct");
  return {
    ...state,
    accounts: [...state.accounts, { id, email, password: input.password, role: "player" as const }],
    players: { ...state.players, [id]: input.profile },
    sessionUserId: id,
    lastNotice: null,
  };
}

export function registerClubAccount(
  state: DemoSnapshot,
  input: {
    email: string;
    password: string;
    listing: DemoClubRecord["listing"];
  },
) {
  const email = input.email.trim().toLowerCase();
  if (state.accounts.some((account) => account.email === email)) {
    throw new Error("That email is already in use in this browser demo.");
  }
  const taken = new Set([
    ...clubs.map((club) => club.slug),
    ...state.clubs.map((club) => club.slug),
  ]);
  const id = newId("acct");
  const slug = uniqueSlug(input.listing.name, taken);
  return {
    ...state,
    accounts: [...state.accounts, { id, email, password: input.password, role: "club" as const }],
    clubs: [
      ...state.clubs,
      { ownerId: id, slug, listing: input.listing, events: [] },
    ],
    sessionUserId: id,
    lastNotice: null,
  };
}
