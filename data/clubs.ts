export type AccessVerified = "club-reported";
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
  postcode: string;
  phone: string;
  email: string;
  website: string;
  sessions: { day: string; time: string; price: string; title?: string; demo?: boolean }[];
  /** Drop a file in public/photos and set this to `/photos/your-file.jpg`. */
  photo?: string;
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
    name: "Bitterne Leisure Centre",
    sport: "Netball",
    venue: "Bitterne Leisure Centre, Dean Road",
    distanceMiles: 0,
    days: "Times from the venue",
    soonestMinutes: Number.POSITIVE_INFINITY,
    pricePence: null,
    priceLabel: "Ask reception",
    priceNote: "Active Nation lists netball here",
    offer: "payg",
    tags: [{ label: "Step-free", tone: "sun" }],
    accessVerified: "club-reported",
    accessFlags: ["step-free"],
    ageBands: ["3-10", "10-18", "adult"],
    gender: "mixed",
    accessible: true,
    freeTaster: false,
    evenings: true,
    tilt: -0.5,
    lat: 50.916862,
    lng: -1.355712,
    postcode: "SO18 6AQ",
    phone: "023 8043 7647",
    email: "bitterne.lc@activenation.org.uk",
    website: "https://activenation.org.uk/venues/bitterne-leisure-centre/",
    sessions: [
      {
        day: "Weekly",
        time: "see timetable",
        price: "Ask reception",
        title: "Netball — confirm this week's times with reception",
      },
    ],
  },
  {
    slug: "solent-wheelchair-basketball",
    name: "Hampshire Harriers",
    sport: "Wheelchair basketball",
    venue: "Applemore Health & Leisure, Claypits Lane, Dibden",
    distanceMiles: 0,
    days: "Wed 7:30pm, Sun 10:00am",
    soonestMinutes: 0,
    pricePence: 0,
    priceLabel: "First two free",
    priceNote: "then £35 / month",
    offer: "free-taster",
    tags: [{ label: "Sports wheelchairs available", tone: "blue" }],
    accessVerified: "club-reported",
    accessFlags: ["chairs-provided", "step-free"],
    ageBands: ["10-18", "adult", "seniors"],
    gender: "mixed",
    accessible: true,
    freeTaster: true,
    evenings: true,
    tilt: 0.4,
    lat: 50.86642,
    lng: -1.425712,
    postcode: "SO45 5TN",
    phone: "07946 821530",
    email: "annettefloss@hotmail.com",
    website: "https://www.hampshireharriers.com/",
    sessions: [
      { day: "Wednesday", time: "7:30pm", price: "First two sessions free" },
      { day: "Sunday", time: "10:00am", price: "First two sessions free" },
    ],
  },
  {
    slug: "woolston-walking-football",
    name: "Southampton Strollers",
    sport: "Walking football",
    venue: "Outdoor Sports Centre, 36 Thornhill Road",
    distanceMiles: 0,
    days: "Mon 11:00am, Thu 7:00pm",
    soonestMinutes: 0,
    pricePence: 300,
    priceLabel: "£3",
    priceNote: "over 50s, all abilities",
    offer: "payg",
    tags: [{ label: "Beginners welcome", tone: "blue" }],
    accessVerified: "club-reported",
    accessFlags: [],
    ageBands: ["seniors"],
    gender: "mixed",
    accessible: false,
    freeTaster: false,
    evenings: true,
    tilt: -0.3,
    lat: 50.936917,
    lng: -1.417514,
    postcode: "SO16 7AT",
    phone: "023 8078 4131",
    email: "communities@activenation.org.uk",
    website: "https://www.activenation.org.uk/walking-football-southampton/",
    sessions: [
      { day: "Monday", time: "11:00am", price: "£3" },
      { day: "Thursday", time: "7:00pm", price: "£3" },
    ],
  },
  {
    slug: "she-runs-southampton",
    name: "Southampton parkrun",
    sport: "Running",
    venue: "Southampton Common, meet at the Hawthorns Centre",
    distanceMiles: 0,
    days: "Sat 9:00am",
    soonestMinutes: 0,
    pricePence: 0,
    priceLabel: "Free",
    priceNote: "register once, bring a barcode",
    offer: "free-taster",
    tags: [{ label: "Walk, jog or run", tone: "blue" }],
    accessVerified: "club-reported",
    accessFlags: [],
    ageBands: ["adult", "seniors"],
    gender: "mixed",
    accessible: false,
    freeTaster: true,
    evenings: false,
    tilt: 0.5,
    lat: 50.923919,
    lng: -1.405996,
    postcode: "SO15 7NN",
    phone: "",
    email: "",
    website: "https://www.parkrun.org.uk/southampton/",
    sessions: [{ day: "Saturday", time: "9:00am", price: "Free" }],
  },
  {
    slug: "eastpoint-boccia",
    name: "Chamberlayne Leisure Centre",
    sport: "Court sports",
    venue: "Chamberlayne Leisure Centre, 150 Weston Lane",
    distanceMiles: 0,
    days: "Times from the venue",
    soonestMinutes: Number.POSITIVE_INFINITY,
    pricePence: null,
    priceLabel: "Ask reception",
    priceNote: "Netball, badminton, football — confirm on the timetable",
    offer: "payg",
    tags: [{ label: "Step-free", tone: "sun" }],
    accessVerified: "club-reported",
    accessFlags: ["step-free"],
    ageBands: ["10-18", "adult"],
    gender: "mixed",
    accessible: true,
    freeTaster: false,
    evenings: true,
    tilt: -0.4,
    lat: 50.890763,
    lng: -1.361703,
    postcode: "SO19 9SJ",
    phone: "023 8043 7668",
    email: "chamberlayne@activenation.org.uk",
    website: "https://activenation.org.uk/venues/chamberlayne-leisure-centre/",
    sessions: [
      {
        day: "Weekly",
        time: "see timetable",
        price: "Ask reception",
        title: "Court sports — confirm this week's times with reception",
      },
    ],
  },
  {
    slug: "shirley-swim",
    name: "The Quays Swimming & Diving Complex",
    sport: "Swim",
    venue: "The Quays, 27 Harbour Parade",
    distanceMiles: 0,
    days: "Times from the venue",
    soonestMinutes: Number.POSITIVE_INFINITY,
    pricePence: null,
    priceLabel: "See timetable",
    priceNote: "Public swim — ask reception for lane times",
    offer: "payg",
    tags: [{ label: "Pool hoist", tone: "sun" }],
    accessVerified: "club-reported",
    accessFlags: ["pool-hoist"],
    ageBands: ["adult", "seniors"],
    gender: "mixed",
    accessible: true,
    freeTaster: false,
    evenings: false,
    tilt: 0.3,
    lat: 50.903921,
    lng: -1.40992,
    postcode: "SO15 1BA",
    phone: "023 8072 0900",
    email: "",
    website: "https://activenation.org.uk/venues/the-quays-swimming-diving-complex/",
    sessions: [
      {
        day: "Weekly",
        time: "see timetable",
        price: "See timetable",
        title: "Public swim — times from The Quays timetable",
      },
    ],
  },
  {
    slug: "portswood-mens-five-a-side",
    name: "Southampton Striders",
    sport: "Walking football",
    venue: "Outdoor Sports Centre, Thornhill Road",
    distanceMiles: 0,
    days: "Tue 7:00pm",
    soonestMinutes: 0,
    pricePence: 500,
    priceLabel: "£5",
    priceNote: "over 50s, all abilities",
    offer: "payg",
    tags: [{ label: "Beginners welcome", tone: "blue" }],
    accessVerified: "club-reported",
    accessFlags: [],
    ageBands: ["seniors"],
    gender: "mixed",
    accessible: false,
    freeTaster: false,
    evenings: true,
    tilt: 0.2,
    lat: 50.936917,
    lng: -1.417514,
    postcode: "SO16 7AT",
    phone: "",
    email: "",
    website: "https://walkingfootball.com/walking-football/southampton-striders-wfc/",
    sessions: [{ day: "Tuesday", time: "7:00pm", price: "£5" }],
  },
];

export const featuredSlugs = [
  "woolston-walking-football",
  "solent-wheelchair-basketball",
  "she-runs-southampton",
] as const;

export function getClub(slug: string) {
  return clubs.find((club) => club.slug === slug);
}

export function accessLabel(_verified: AccessVerified) {
  return "Club-reported access";
}
