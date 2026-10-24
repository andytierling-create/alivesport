import assert from "node:assert/strict";
import { test } from "node:test";
import { clubs } from "@/data/clubs";
import { parseSearch, searchListings } from "@/lib/search";
import { locatePostcode, withDistances } from "@/lib/platform/geo";

const MANCHESTER = { lat: 53.4808, lng: -2.2426 };

test("listing miles are measured from the search origin, not the baked-in SO14 figures", () => {
  const woolston = clubs.find((club) => club.slug === "woolston-walking-football");
  assert.ok(woolston);
  const placed = withDistances(clubs, { lat: woolston.lat, lng: woolston.lng });
  const here = placed.find((club) => club.slug === woolston.slug);
  const bitterne = placed.find((club) => club.slug === "bitterne-netball");
  const baked = clubs.find((club) => club.slug === "bitterne-netball");
  assert.equal(here?.distanceMiles, 0);
  assert.ok((bitterne?.distanceMiles ?? 0) > 1);
  assert.notEqual(bitterne?.distanceMiles, baked?.distanceMiles);
});

test("a far-away origin puts Southampton clubs outside every search radius", () => {
  const placed = withDistances(clubs, MANCHESTER);
  assert.ok(placed.every((club) => club.distanceMiles > 150));
  const results = searchListings(parseSearch({ radius: "25" }), placed);
  assert.equal(results.length, 0);
});

test("locatePostcode keeps a real lookup and does not fall back to SO14", async () => {
  const located = await locatePostcode("LS1 1BA", async () =>
    new Response(
      JSON.stringify({
        status: 200,
        result: { latitude: 53.8003, longitude: -1.5486, postcode: "LS1 1BA" },
      }),
    ),
  );
  assert.ok(located);
  assert.equal(located.lat, 53.8003);
  assert.equal(located.district, "LS1");
  assert.equal(located.source, "lookup");
});

test("an unknown postcode does not pretend to be Southampton", async () => {
  const located = await locatePostcode("ZZ99 9ZZ", async () => new Response("{}", { status: 404 }));
  assert.equal(located, null);
});

test("a string that is not a postcode does not resolve as SO14", async () => {
  const located = await locatePostcode("not-a-postcode", async () => new Response("{}", { status: 404 }));
  assert.equal(located, null);
});
