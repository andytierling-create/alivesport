import assert from "node:assert/strict";
import { test } from "node:test";
import type { AgeBand } from "@/data/clubs";
import { publicEvents, publicOrg, seedPlatform } from "./store";
import {
  buildPublicSearch,
  fitsFamily,
  publicSearchFor,
  shouldStampFitsFamily,
} from "./public-search";

const LEEDS = {
  lat: 53.8003,
  lng: -1.5486,
  postcode: "LS1 1BA",
  district: "LS1",
  source: "lookup" as const,
};

const SOUTHAMPTON = {
  lat: 50.8965,
  lng: -1.3968,
  postcode: "SO14 3ZE",
  district: "SO14",
  source: "lookup" as const,
};

test("a missing origin dumps every published event and org without inventing miles", () => {
  const seeded = seedPlatform();
  const search = buildPublicSearch({
    events: publicEvents(seeded),
    orgs: seeded.orgs.map(publicOrg),
  });
  assert.equal(search.origin, null);
  assert.equal(search.radius, "5");
  assert.equal(search.q, "");
  assert.ok(search.orgs.length >= 1);
  assert.ok(search.events.every((event) => event.distanceMiles === null));
  assert.ok(search.orgs.every((org) => org.distanceMiles === null));
});

test("a Leeds origin puts Hampshire orgs outside a five-mile radius", () => {
  const seeded = seedPlatform();
  const search = buildPublicSearch({
    events: publicEvents(seeded),
    orgs: seeded.orgs.map(publicOrg),
    origin: LEEDS,
    radius: "5",
  });
  assert.equal(search.origin?.district, "LS1");
  assert.equal(search.orgs.length, 0);
  assert.equal(search.events.length, 0);
});

test("q=walking keeps Strollers from a Southampton origin", () => {
  const seeded = seedPlatform();
  const search = buildPublicSearch({
    events: publicEvents(seeded),
    orgs: seeded.orgs.map(publicOrg),
    origin: SOUTHAMPTON,
    radius: "5",
    q: "walking",
  });
  assert.ok(
    search.orgs.some((org) => org.slug === "woolston-walking-football"),
    "Strollers should stay in Find results",
  );
  assert.ok(
    search.events.every((event) =>
      /walking|strollers/i.test(`${event.title} ${event.venue}`),
    ),
    "dated rows should match the query",
  );
  assert.ok(
    search.orgs.every((org) => (org.distanceMiles ?? 99) <= 5),
  );
});

test("publicSearchFor does not fall back to SO14 when the postcode cannot be placed", async () => {
  const seeded = seedPlatform();
  const result = await publicSearchFor({
    events: publicEvents(seeded),
    orgs: seeded.orgs.map(publicOrg),
    postcode: "not-a-postcode",
    locate: async () => null,
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.status, 404);
  assert.match(result.error, /postcode/i);
});

const listing: { sport: string; ageBands: AgeBand[] } = {
  sport: "Netball",
  ageBands: ["3-10"],
};

test("fitsFamily is true when a child 3-10 slot matches a 3-10 listing", () => {
  assert.equal(
    fitsFamily(listing, { ageBands: ["3-10"], categoryLabels: [] }),
    true,
  );
});

test("fitsFamily is false when categories are set and the sport is not one of them", () => {
  assert.equal(
    fitsFamily(listing, { ageBands: ["3-10"], categoryLabels: ["Swim"] }),
    false,
  );
});

test("shouldStampFitsFamily is false when there is no family and no fit input", () => {
  assert.equal(
    shouldStampFitsFamily(null, { ageBands: [], categoryLabels: [] }),
    false,
  );
  assert.equal(
    shouldStampFitsFamily({ id: "fam-1" }, { ageBands: [], categoryLabels: [] }),
    true,
  );
});

test("buildPublicSearch without a family does not require fitsFamily", () => {
  const seeded = seedPlatform();
  const search = buildPublicSearch({
    events: publicEvents(seeded),
    orgs: seeded.orgs.map(publicOrg),
  });
  assert.ok(search.orgs.every((org) => org.fitsFamily === undefined));
  assert.ok(search.events.every((event) => event.fitsFamily === undefined));
});

