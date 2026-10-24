import assert from "node:assert/strict";
import { test } from "node:test";
import { minutesUntilNextSession, nextStartsAt } from "@/lib/schedule";
import { seedPlatform, registerOrgOn } from "@/lib/platform/store";

test("soonest is minutes until the next dated session, not a baked figure", () => {
  const mondayMorning = new Date(2026, 9, 26, 8, 0, 0);
  assert.equal(mondayMorning.getDay(), 1);
  const minutes = minutesUntilNextSession(
    [{ day: "Monday", time: "9:00am", price: "£4" }],
    mondayMorning,
  );
  assert.equal(minutes, 60);
});

test("a session that has already started this week rolls to next week", () => {
  const mondayAfternoon = new Date(2026, 9, 26, 16, 0, 0);
  const next = nextStartsAt("Monday", "9:00am", mondayAfternoon);
  assert.ok(next);
  assert.ok(next.getTime() > mondayAfternoon.getTime());
  assert.equal(next.getDay(), 1);
});

test("listings without a clock do not pretend to be soon", () => {
  assert.equal(minutesUntilNextSession([], new Date()), Number.POSITIVE_INFINITY);
});

test("a new club is not dropped on Southampton city centre", () => {
  const seeded = seedPlatform();
  const rejected = registerOrgOn(seeded, {
    email: "leeds@example.com",
    password: "list",
    name: "Leeds Table Tennis",
    sport: "Table tennis",
    venue: "Leeds Sports Hall",
  });
  assert.equal(rejected.ok, false);
  const placed = registerOrgOn(seeded, {
    email: "leeds@example.com",
    password: "list",
    name: "Leeds Table Tennis",
    sport: "Table tennis",
    venue: "Leeds Sports Hall",
    lat: 53.8,
    lng: -1.55,
  });
  assert.equal(placed.ok, true);
  if (!placed.ok) return;
  assert.equal(placed.org.lat, 53.8);
  assert.equal(placed.org.lng, -1.55);
});
