import type { Club } from "./clubs";

/** Real public wellness / turn-up sessions around Southampton. */
export const wellness: Club[] = [
  {
    slug: "riverside-morning-run",
    name: "Itchen Valley Country parkrun",
    sport: "Running",
    venue: "Itchen Valley Country Park, Allington Lane, West End",
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
    tilt: 0.4,
    lat: 50.93919,
    lng: -1.340999,
    postcode: "SO30 3HQ",
    phone: "023 8068 3790",
    email: "ivcp@eastleigh.gov.uk",
    website: "https://www.parkrun.org.uk/itchenvalleycountry/",
    sessions: [{ day: "Saturday", time: "9:00am", price: "Free" }],
  },
];
