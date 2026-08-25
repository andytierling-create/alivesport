export type AccessVerified = "in-person" | "club-reported";
export type OfferType = "free-taster" | "payg" | "access-verified";
export type TagTone = "pink" | "blue" | "sun" | "neutral";

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
  womenOnly: boolean;
  over50: boolean;
  freeTaster: boolean;
  evenings: boolean;
  ages812: boolean;
  allAbilities: boolean;
  wheelchairAccessible: boolean;
  tilt: number;
  pin: { left: string; top: string };
  phone: string;
  email: string;
  website: string;
  sessions: { day: string; time: string; price: string }[];
};

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
      { label: "Ages 8–12", tone: "pink" },
      { label: "All abilities", tone: "blue" },
      { label: "Step-free", tone: "sun" },
    ],
    accessVerified: "in-person",
    accessFlags: ["step-free"],
    womenOnly: false,
    over50: false,
    freeTaster: true,
    evenings: true,
    ages812: true,
    allAbilities: true,
    wheelchairAccessible: true,
    tilt: -0.5,
    pin: { left: "34%", top: "38%" },
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
      { label: "Ages 14+", tone: "blue" },
      { label: "Changing Places toilet", tone: "sun" },
    ],
    accessVerified: "in-person",
    accessFlags: ["chairs-provided", "changing-places", "step-free"],
    womenOnly: false,
    over50: false,
    freeTaster: false,
    evenings: true,
    ages812: false,
    allAbilities: true,
    wheelchairAccessible: true,
    tilt: 0.4,
    pin: { left: "58%", top: "52%" },
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
    tags: [
      { label: "Over 60s", tone: "pink" },
      { label: "Beginners welcome", tone: "blue" },
    ],
    accessVerified: "club-reported",
    accessFlags: ["step-free"],
    womenOnly: false,
    over50: true,
    freeTaster: false,
    evenings: false,
    ages812: false,
    allAbilities: true,
    wheelchairAccessible: false,
    tilt: -0.3,
    pin: { left: "22%", top: "64%" },
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
      { label: "Women-only", tone: "pink" },
      { label: "Couch-to-5k group", tone: "blue" },
      { label: "Lit route", tone: "blue" },
    ],
    accessVerified: "club-reported",
    accessFlags: [],
    womenOnly: true,
    over50: false,
    freeTaster: true,
    evenings: true,
    ages812: false,
    allAbilities: true,
    wheelchairAccessible: false,
    tilt: 0.5,
    pin: { left: "70%", top: "28%" },
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
      { label: "All ages", tone: "blue" },
      { label: "Hoist available", tone: "sun" },
      { label: "Step-free", tone: "sun" },
    ],
    accessVerified: "in-person",
    accessFlags: ["hoist", "step-free"],
    womenOnly: false,
    over50: true,
    freeTaster: false,
    evenings: false,
    ages812: true,
    allAbilities: true,
    wheelchairAccessible: true,
    tilt: -0.4,
    pin: { left: "46%", top: "72%" },
    phone: "023 8043 2104",
    email: "sport@eastpoint.example",
    website: "https://example.com/eastpoint",
    sessions: [{ day: "Saturday", time: "1:00pm", price: "£2.50, carers free" }],
  },
  {
    slug: "shirley-swim",
    name: "Shirley Swim — Over 60s Lane Hour",
    sport: "Swim",
    venue: "The Quays",
    distanceMiles: 2.1,
    days: "Mon, Wed, Fri 9:00am",
    soonestMinutes: 9 * 60,
    pricePence: 420,
    priceLabel: "£4.20",
    priceNote: "concession",
    offer: "payg",
    tags: [
      { label: "Over 60s", tone: "pink" },
      { label: "Pool hoist", tone: "sun" },
    ],
    accessVerified: "club-reported",
    accessFlags: ["pool-hoist"],
    womenOnly: false,
    over50: true,
    freeTaster: false,
    evenings: false,
    ages812: false,
    allAbilities: false,
    wheelchairAccessible: true,
    tilt: 0.3,
    pin: { left: "62%", top: "44%" },
    phone: "023 8063 5000",
    email: "swim@thequays.example",
    website: "https://example.com/the-quays",
    sessions: [
      { day: "Monday", time: "9:00am", price: "£4.20 concession" },
      { day: "Wednesday", time: "9:00am", price: "£4.20 concession" },
      { day: "Friday", time: "9:00am", price: "£4.20 concession" },
    ],
  },
];

export const featuredSessions = [
  {
    slug: "bitterne-netball",
    title: "Saturday Junior Netball",
    when: "Sat 9:30am · free taster",
    meta: "Bitterne · ages 8–12 · 1.2 miles",
    tags: [
      { label: "All abilities", tone: "pink" as TagTone },
      { label: "Beginners", tone: "blue" as TagTone },
    ],
  },
  {
    slug: "solent-wheelchair-basketball",
    title: "Solent Wheelchair Basketball",
    when: "Tue 6:00pm · £4 pay as you go",
    meta: "Millbrook · ages 14+ · 2.8 miles",
    tags: [
      { label: "Chairs provided", tone: "blue" as TagTone },
      { label: "Step-free", tone: "sun" as TagTone },
    ],
  },
  {
    slug: "woolston-walking-football",
    title: "Walking Football, Over 60s",
    when: "Thu 10:10am · £3",
    meta: "Woolston · all welcome · 0.6 miles",
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
