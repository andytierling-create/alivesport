import assert from "node:assert/strict";
import { test } from "node:test";
import { clubs } from "@/data/clubs";
import { listingInventory } from "./catalog";
import { mergeClubListings, seedSnapshot, type DemoSnapshot } from "./demo-store";
import { parseSearch, searchListings } from "./search";

function snapshotWithTestEvent(): DemoSnapshot {
  const state = seedSnapshot();
  state.clubs[0].events.push({
    id: "evt-test",
    title: "Tuesday test social",
    day: "Tuesday",
    time: "8:00pm",
    price: "£3",
    ageBands: ["adult"],
    gender: "women",
    accessible: true,
    notes: "",
  });
  return state;
}

test("a posted session title is findable in player search", () => {
  const listings = mergeClubListings(undefined, snapshotWithTestEvent());
  const results = searchListings(
    parseSearch({ q: "Tuesday test social" }),
    listings,
  );
  assert.ok(
    results.some((club) => club.slug === "bitterne-netball"),
    "searching the event title should return the club",
  );
});

test("a posted session appears in the result preview line", () => {
  const listings = mergeClubListings(undefined, snapshotWithTestEvent());
  const club = listings.find((item) => item.slug === "bitterne-netball");
  assert.ok(club);
  assert.match(
    club.days,
    /Tuesday test social|Tue 8:00pm/i,
    "the search card preview should mention the new session",
  );
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
