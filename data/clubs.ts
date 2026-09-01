export type AccessVerified = "in-person" | "club-reported";
export type OfferType = "free-taster" | "payg" | "access-verified";
export type TagTone = "pink" | "blue" | "sun" | "neutral";
export type AgeBand = "3-10" | "10-18" | "adult" | "seniors";
export type Gender = "men" | "women" | "mixed";

export const AGE_BANDS: { id: AgeBand; label: string }[] = [
  { id: "3-10", label: "3–10" },
  { id: "10-18", label: "10–18" },
  { id: "adult", label: "Adult" },
  { id: "seniors", label: "Seniors" },
];

export const GENDERS: { id: Gender; label: string }[] = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
  { id: "mixed", label: "Mixed" },
];

export type ClubTag = {
  label: string;
  tone: TagTone;
};

export type Club = {
  slug: string;
  name: string;
  sport: string;
  venue: string;
  distanceMiles: number;
  days: string;
  soonestMinutes: number;
  pricePence: number | null;
  priceLabel: string;
  priceNote: string;
  offer: OfferType;
  tags: ClubTag[];
  accessVerified: AccessVerified;
  accessFlags: string[];
  ageBands: AgeBand[];
  gender: Gender;
  accessible: boolean;
  freeTaster: boolean;
  evenings: boolean;
  tilt: number;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  website: string;
  sessions: { day: string; time: string; price: string }[];
};

const ACCESS_FLAG_LABELS: Record<string, string> = {
  "step-free": "Step-free",
  "chairs-provided": "Chairs provided",
  "changing-places": "Changing Places toilet",
  hoist: "Hoist available",
  "pool-hoist": "Pool hoist",
};

export function ageBandLabel(id: AgeBand) {
  return AGE_BANDS.find((band) => band.id === id)?.label ?? id;
}

export function genderLabel(id: Gender) {
  return GENDERS.find((item) => item.id === id)?.label ?? id;
}

export function accessFlagLabel(flag: string) {
  return ACCESS_FLAG_LABELS[flag] ?? flag;
}

export function listingTags(club: Club): ClubTag[] {
  return [
    ...club.ageBands.map((id) => ({ label: ageBandLabel(id), tone: "pink" as const })),
    { label: genderLabel(club.gender), tone: "blue" as const },
    ...(club.accessible ? [{ label: "Accessible", tone: "sun" as const }] : []),
    ...club.tags,
  ];
}

export const clubs: Club[] = [
  {
    slug: "bitterne-netball",
    name: "Bitterne Netball Club",
    sport: "Netball",
    venue: "Bitterne Leisure Centre",
    distanceMiles: 1.2,
    days: "Sat 9:30am, Wed 6:30pm",
    soonestMinutes: 60 * 24 + 9 * 60 + 30,
    pricePence: 400,
    priceLabel: "Free taster",
    priceNote: "then £4 / session",
    offer: "free-taster",
    tags: [
      { label: "All abilities", tone: "blue" },
      { label: "Step-free", tone: "sun" },
    ],
    accessVerified: "in-person",
    accessFlags: ["step-free"],
    ageBands: ["3-10", "10-18"],
    gender: "women",
    accessible: true,
    freeTaster: true,
    evenings: true,
    tilt: -0.5,
    lat: 50.9178,
    lng: -1.3515,
    phone: "023 8044 2100",
    email: "hello@bitternenetball.example",
    website: "https://example.com/bitterne-netball",
    sessions: [
      { day: "Saturday", time: "9:30am", price: "Free taster, then £4" },
      { day: "Wednesday", time: "6:30pm", price: "£4" },
    ],
  },
  {
    slug: "solent-wheelchair-basketball",
    name: "Solent Wheelchair Basketball",
    sport: "Wheelchair basketball",
    venue: "Millbrook Sports Hall",
    distanceMiles: 2.8,
    days: "Tue 6:00pm",
    soonestMinutes: 18 * 60,
    pricePence: 400,
    priceLabel: "£4",
    priceNote: "pay as you go",
    offer: "payg",
    tags: [
      { label: "Chairs provided", tone: "blue" },
      { label: "Changing Places toilet", tone: "sun" },
    ],
    accessVerified: "in-person",
    accessFlags: ["chairs-provided", "changing-places", "step-free"],
    ageBands: ["10-18", "adult"],
    gender: "mixed",
    accessible: true,
    freeTaster: false,
    evenings: true,
    tilt: 0.4,
    lat: 50.9165,
    lng: -1.453,
    phone: "023 8083 3000",
    email: "play@solentwb.example",
    website: "https://example.com/solent-wb",
    sessions: [{ day: "Tuesday", time: "6:00pm", price: "£4 pay as you go" }],
  },
  {
    slug: "woolston-walking-football",
    name: "Woolston Walking Football",
    sport: "Walking football",
    venue: "Woolston Rec",
    distanceMiles: 0.6,
    days: "Thu 10:10am",
    soonestMinutes: 10 * 60 + 10,
    pricePence: 300,
    priceLabel: "£3",
    priceNote: "tea included",
    offer: "access-verified",
    tags: [{ label: "Beginners welcome", tone: "blue" }],
    accessVerified: "club-reported",
    accessFlags: ["step-free"],
    ageBands: ["seniors"],
    gender: "mixed",
    accessible: false,
    freeTaster: false,
    evenings: false,
    tilt: -0.3,
    lat: 50.8967,
    lng: -1.3765,
    phone: "023 8044 8811",
    email: "walk@woolstonfootball.example",
    website: "https://example.com/woolston-wf",
    sessions: [{ day: "Thursday", time: "10:10am", price: "£3, tea included" }],
  },
  {
    slug: "she-runs-southampton",
    name: "She Runs Southampton",
    sport: "Running",
    venue: "Riverside Park",
    distanceMiles: 1.9,
    days: "Mon & Thu 7:00pm",
    soonestMinutes: 19 * 60,
    pricePence: 0,
    priceLabel: "Free",
    priceNote: "always",
    offer: "free-taster",
    tags: [
      { label: "Couch-to-5k group", tone: "blue" },
      { label: "Lit route", tone: "blue" },
    ],
    accessVerified: "club-reported",
    accessFlags: [],
    ageBands: ["adult"],
    gender: "women",
    accessible: false,
    freeTaster: true,
    evenings: true,
    tilt: 0.5,
    lat: 50.9338,
    lng: -1.377,
    phone: "07700 900123",
    email: "hello@sherunssoton.example",
    website: "https://example.com/she-runs",
    sessions: [
      { day: "Monday", time: "7:00pm", price: "Free" },
      { day: "Thursday", time: "7:00pm", price: "Free" },
    ],
  },
  {
    slug: "eastpoint-boccia",
    name: "Eastpoint Boccia & New Age Kurling",
    sport: "Boccia",
    venue: "Eastpoint Centre",
    distanceMiles: 3.4,
    days: "Sat 1:00pm",
    soonestMinutes: 13 * 60,
    pricePence: 250,
    priceLabel: "£2.50",
    priceNote: "carers free",
    offer: "payg",
    tags: [
      { label: "Hoist available", tone: "sun" },
      { label: "Step-free", tone: "sun" },
    ],
    accessVerified: "in-person",
    accessFlags: ["hoist", "step-free"],
    ageBands: ["3-10", "10-18", "adult", "seniors"],
    gender: "mixed",
    accessible: true,
    freeTaster: false,
    evenings: false,
    tilt: -0.4,
    lat: 50.912,
    lng: -1.337,
    phone: "023 8043 2104",
    email: "sport@eastpoint.example",
    website: "https://example.com/eastpoint",
    sessions: [{ day: "Saturday", time: "1:00pm", price: "£2.50, carers free" }],
  },
  {
    slug: "shirley-swim",
    name: "Shirley Swim — Seniors Lane Hour",
    sport: "Swim",
    venue: "The Quays",
    distanceMiles: 2.1,
    days: "Mon, Wed, Fri 9:00am",
    soonestMinutes: 9 * 60,
    pricePence: 420,
    priceLabel: "£4.20",
    priceNote: "concession",
    offer: "payg",
    tags: [{ label: "Pool hoist", tone: "sun" }],
    accessVerified: "club-reported",
    accessFlags: ["pool-hoist"],
    ageBands: ["seniors"],
    gender: "mixed",
    accessible: true,
    freeTaster: false,
    evenings: false,
    tilt: 0.3,
    lat: 50.8962,
    lng: -1.4065,
    phone: "023 8063 5000",
    email: "swim@thequays.example",
    website: "https://example.com/the-quays",
    sessions: [
      { day: "Monday", time: "9:00am", price: "£4.20 concession" },
      { day: "Wednesday", time: "9:00am", price: "£4.20 concession" },
      { day: "Friday", time: "9:00am", price: "£4.20 concession" },
    ],
  },
  {
    slug: "portswood-mens-five-a-side",
    name: "Portswood Men's 5-a-side",
    sport: "Football",
    venue: "Portswood Recreation Ground",
    distanceMiles: 1.5,
    days: "Wed 7:30pm",
    soonestMinutes: 19 * 60 + 30,
    pricePence: 500,
    priceLabel: "£5",
    priceNote: "pay as you go",
    offer: "payg",
    tags: [{ label: "Beginners welcome", tone: "blue" }],
    accessVerified: "club-reported",
    accessFlags: [],
    ageBands: ["adult"],
    gender: "men",
    accessible: false,
    freeTaster: false,
    evenings: true,
    tilt: 0.2,
    lat: 50.9275,
    lng: -1.396,
    phone: "023 8055 4411",
    email: "play@portswoodfive.example",
    website: "https://example.com/portswood-5",
    sessions: [{ day: "Wednesday", time: "7:30pm", price: "£5 pay as you go" }],
  },
];

export const featuredSessions = [
  {
    slug: "bitterne-netball",
    title: "Saturday Junior Netball",
    when: "Sat 9:30am · free taster",
    meta: "Bitterne · 3–10 · 1.2 miles",
    tags: [
      { label: "All abilities", tone: "pink" as TagTone },
      { label: "Beginners", tone: "blue" as TagTone },
    ],
  },
  {
    slug: "solent-wheelchair-basketball",
    title: "Solent Wheelchair Basketball",
    when: "Tue 6:00pm · £4 pay as you go",
    meta: "Millbrook · 10–18 · 2.8 miles",
    tags: [
      { label: "Chairs provided", tone: "blue" as TagTone },
      { label: "Step-free", tone: "sun" as TagTone },
    ],
  },
  {
    slug: "woolston-walking-football",
    title: "Walking Football, Seniors",
    when: "Thu 10:10am · £3",
    meta: "Woolston · mixed · 0.6 miles",
    tags: [
      { label: "Tea after", tone: "pink" as TagTone },
      { label: "No kit needed", tone: "blue" as TagTone },
    ],
  },
];

export function getClub(slug: string) {
  return clubs.find((club) => club.slug === slug);
}

export function accessLabel(verified: AccessVerified) {
  return verified === "in-person"
    ? "Access verified in person"
    : "Club-reported access";
}
