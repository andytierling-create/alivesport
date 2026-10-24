import type { AgeBand, Gender } from "@/data/clubs";
import type { SearchRadius } from "@/lib/search";
import type { GeoLocate } from "@/lib/platform/geo";

export type { AgeBand, Gender };

export type EventSource = "desk" | "embed";
export type SessionRole = "adult" | "org";

export type OrgSubscription = {
  listing: boolean;
  notifyArea: boolean;
};

export type OrgContact = {
  email: string;
  phone: string;
  website: string;
};

export type Org = {
  id: string;
  name: string;
  slug: string;
  sport: string;
  venue: string;
  contact: OrgContact;
  lat: number;
  lng: number;
  apiKey: string;
  subscription: OrgSubscription;
  notifyRadiusMiles?: number;
  ageBands: AgeBand[];
  gender: Gender;
  accessible: boolean;
  distanceMiles: number;
};

export type PublicOrg = Omit<Org, "apiKey">;

export type PlatformEvent = {
  id: string;
  orgId: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  venue: string;
  lat: number;
  lng: number;
  ageBands: AgeBand[];
  gender: Gender;
  accessible: boolean;
  price: string;
  notes: string;
  publishOnAliveSport: boolean;
  source: EventSource;
  seriesId?: string;
};

export type PublicSearchEvent = PlatformEvent & {
  distanceMiles: number | null;
  fitsFamily?: boolean;
};

export type PublicSearchOrg = PublicOrg & {
  distanceMiles: number | null;
  fitsFamily?: boolean;
};

export type PublicSearch = {
  origin: GeoLocate | null;
  radius: SearchRadius;
  q: string;
  events: PublicSearchEvent[];
  orgs: PublicSearchOrg[];
};

export type SavedSearch = {
  id: string;
  email: string;
  adultId?: string;
  familyId?: string;
  q: string;
  postcode: string;
  radius: string;
  day: string;
  age: string;
  gender: string;
  accessible: string;
  filters: string[];
  createdAt: string;
};

export type ChildSlot = {
  id: string;
  ageBand: "3-10" | "10-18";
  gender: Gender;
};

export type Family = {
  id: string;
  adultIds: string[];
  childSlots: ChildSlot[];
  categoryIds: string[];
};

export type FamilyInvite = {
  id: string;
  familyId: string;
  email: string;
  token: string;
  invitedByAdultId: string;
  createdAt: string;
  expiresAt: string;
};

export type ActivityCategory = {
  id: string;
  slug: string;
  label: string;
};

export type Adult = {
  id: string;
  displayName: string;
  email: string;
  postcode: string;
  lookingForAgeBands: AgeBand[];
  gender: Gender | "any";
  accessible: boolean;
  notifyOptIn: boolean;
  categoryIds: string[];
};

export type Credential = {
  email: string;
  password: string;
  role: SessionRole;
  subjectId: string;
};

export type Session = {
  role: SessionRole;
  subjectId: string;
};

export type AccessToken = {
  token: string;
  role: SessionRole;
  subjectId: string;
  createdAt: string;
};

export type PlatformState = {
  orgs: Org[];
  events: PlatformEvent[];
  adults: Adult[];
  credentials: Credential[];
  lastNotice: string | null;
  savedSearches: SavedSearch[];
  tokens: AccessToken[];
  families: Family[];
  familyInvites: FamilyInvite[];
  activityCategories: ActivityCategory[];
};

export type SaveSearchInput = {
  email: string;
  q?: string;
  postcode?: string;
  radius?: string;
  day?: string;
  age?: string;
  gender?: string;
  accessible?: string;
  filters?: string[];
  adultId?: string;
};

export type CreateEventInput = {
  title: string;
  startsAt: string;
  endsAt?: string;
  venue?: string;
  lat?: number;
  lng?: number;
  ageBands?: AgeBand[];
  gender?: Gender;
  accessible?: boolean;
  price?: string;
  notes?: string;
  publishOnAliveSport?: boolean;
  seriesId?: string;
};

export type AdultPatch = {
  displayName?: string;
  postcode?: string;
  lookingForAgeBands?: AgeBand[];
  gender?: Gender | "any";
  accessible?: boolean;
  notifyOptIn?: boolean;
  categoryIds?: string[];
};

export type OrgPatch = {
  name?: string;
  sport?: string;
  venue?: string;
  contact?: Partial<OrgContact>;
  ageBands?: AgeBand[];
  gender?: Gender;
  accessible?: boolean;
  subscription?: Partial<OrgSubscription>;
  notifyRadiusMiles?: number;
};

export const CHILD_SHAPED_KEYS = [
  "children",
  "child",
  "dateOfBirth",
  "school",
] as const;

export const SESSION_COOKIE = "alive_sport_session";

export const DEMO_ADULT = {
  email: "alex@demo.alivesport",
  password: "play",
  name: "Alex Rivers",
} as const;

export const DEMO_ORG = {
  email: "clubs@demo.alivesport",
  password: "list",
  name: "Bitterne Leisure Centre",
  slug: "bitterne-netball",
  apiKey: "ask_bitterne_demo",
} as const;
