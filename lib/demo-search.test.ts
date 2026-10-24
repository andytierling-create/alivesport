import assert from "node:assert/strict";
import { test } from "node:test";
import { clubs } from "@/data/clubs";
import { listingInventory, listingsFromPublishedEvents } from "./catalog";
import {
  createEventOn,
  publicEvents,
  publicOrg,
  saveSearchOn,
  seedPlatform,
} from "./platform/store";

test("a posted session title is findable in player search", async () => {
  const { searchListings, parseSearch } = await import("./search");
  const seeded = seedPlatform();
  const org = seeded.orgs.find((item) => item.slug === "bitterne-netball");
  assert.ok(org);
  const created = createEventOn(
    seeded,
    org,
    {
      title: "Tuesday test social",
      startsAt: "2026-10-27T20:00:00.000Z",
      price: "£3",
      ageBands: ["adult"],
      gender: "women",
      accessible: true,
      publishOnAliveSport: true,
    },
    "desk",
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const listings = listingsFromPublishedEvents(
    clubs,
    publicEvents(created.state),
    created.state.orgs.map(publicOrg),
  );
  const results = searchListings(parseSearch({ q: "Tuesday test social" }), listings);
  assert.ok(
    results.some((club) => club.slug === "bitterne-netball"),
    "searching the event title should return the club",
  );
});

test("a posted session appears in the result preview line", () => {
  const seeded = seedPlatform();
  const org = seeded.orgs.find((item) => item.slug === "bitterne-netball");
  assert.ok(org);
  const created = createEventOn(
    seeded,
    org,
    {
      title: "Tuesday test social",
      startsAt: "2026-10-27T20:00:00.000Z",
      price: "£3",
      publishOnAliveSport: true,
    },
    "desk",
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const listings = listingsFromPublishedEvents(
    clubs,
    publicEvents(created.state),
    created.state.orgs.map(publicOrg),
  );
  const club = listings.find((item) => item.slug === "bitterne-netball");
  assert.ok(club);
  assert.match(
    club.days,
    /Tuesday test social|Tue/i,
    "the search card preview should mention the new session",
  );
});

test("published events raise the demo inventory session count", () => {
  const seeded = seedPlatform();
  const org = seeded.orgs.find((item) => item.slug === "bitterne-netball");
  assert.ok(org);
  const created = createEventOn(
    seeded,
    org,
    {
      title: "Extra listed social",
      startsAt: "2026-10-29T18:00:00.000Z",
      publishOnAliveSport: true,
    },
    "desk",
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const before = listingInventory(
    listingsFromPublishedEvents(
      clubs,
      publicEvents(seeded),
      seeded.orgs.map(publicOrg),
    ),
  );
  const after = listingInventory(
    listingsFromPublishedEvents(
      clubs,
      publicEvents(created.state),
      created.state.orgs.map(publicOrg),
    ),
  );
  assert.equal(after.listed, created.state.orgs.length);
  assert.ok(
    after.sessions > before.sessions,
    "a published event should increase the homepage session count",
  );
});

test("parseSearch keeps only defined search radii", async () => {
  const { parseSearch } = await import("./search");
  assert.equal(parseSearch({}).radius, "5");
  assert.equal(parseSearch({ radius: "1" }).radius, "1");
  assert.equal(parseSearch({ radius: "25" }).radius, "25");
  assert.equal(parseSearch({ radius: "7" }).radius, "5");
  assert.equal(parseSearch({ radius: "plenty" }).radius, "5");
});

test("searchListings drops clubs outside the chosen radius", async () => {
  const { parseSearch, searchListings } = await import("./search");
  const { withDistances } = await import("./platform/geo");
  const fromSo14 = withDistances(clubs, { lat: 50.90719, lng: -1.39739 });
  const near = searchListings(parseSearch({ radius: "1" }), fromSo14);
  const wider = searchListings(parseSearch({ radius: "5" }), fromSo14);
  assert.ok(near.length > 0);
  assert.ok(near.every((club) => club.distanceMiles <= 1));
  assert.ok(wider.length > near.length);
});

test("saving a search stores a defined radius", () => {
  const seeded = seedPlatform();
  const saved = saveSearchOn(seeded, {
    email: "alex@demo.alivesport",
    q: "netball",
    radius: "99",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.search.radius, "5");
});

test("homepage inventory matches the sample club list", () => {
  const inventory = listingInventory(clubs);
  assert.equal(inventory.listed, clubs.length);
  assert.equal(
    inventory.sessions,
    clubs.reduce((sum, club) => sum + club.sessions.length, 0),
  );
  assert.equal(
    inventory.accessible,
    clubs.filter((club) => club.accessible).length,
  );
});
