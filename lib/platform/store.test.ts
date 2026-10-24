import assert from "node:assert/strict";
import { test } from "node:test";
import {
  actorForSession,
  authenticate,
  createEventOn,
  findAccessToken,
  issueTokenOn,
  lastNoticeFor,
  patchAdultOn,
  previewNotifyOn,
  publicEvents,
  registerAdultOn,
  revokeTokenOn,
  saveSearchOn,
  searchesFor,
  seedPlatform,
} from "./store";
import { isHashedPassword } from "./password";
import { DEMO_ADULT, DEMO_ORG } from "./types";

test("a created event is returned from the public list when published", () => {
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
  const listed = publicEvents(created.state);
  assert.ok(
    listed.some((event) => event.title === "Tuesday test social"),
    "published events should appear on the public list",
  );
});

test("unpublished events are omitted from the public list", () => {
  const seeded = seedPlatform();
  const org = seeded.orgs.find((item) => item.slug === "bitterne-netball");
  assert.ok(org);
  const created = createEventOn(
    seeded,
    org,
    {
      title: "Private club night",
      startsAt: "2026-10-28T19:00:00.000Z",
      publishOnAliveSport: false,
    },
    "desk",
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const listed = publicEvents(created.state);
  assert.ok(
    listed.every((event) => event.title !== "Private club night"),
    "unpublished events must not appear on GET-style public list",
  );
});

test("adult patch rejects child-shaped fields", () => {
  const seeded = seedPlatform();
  const adult = seeded.adults[0];
  const rejected = patchAdultOn(seeded, adult.id, {
    lookingForAgeBands: ["3-10"],
    children: [{ name: "Sam" }],
  });
  assert.equal(rejected.ok, false);
  if (rejected.ok) return;
  assert.equal(rejected.status, 400);
  assert.match(rejected.error, /children/i);
});

test("posting without the listing SKU returns 402", () => {
  const seeded = seedPlatform();
  const org = {
    ...seeded.orgs[0],
    subscription: { listing: false, notifyArea: false },
  };
  const created = createEventOn(
    seeded,
    org,
    { title: "Blocked", startsAt: "2026-10-27T18:00:00.000Z" },
    "desk",
  );
  assert.equal(created.ok, false);
  if (created.ok) return;
  assert.equal(created.status, 402);
});

test("an opted-in adult can read the latest notify preview", () => {
  const seeded = seedPlatform();
  const adult = seeded.adults[0];
  assert.equal(adult.notifyOptIn, true);
  assert.match(lastNoticeFor(adult, seeded) ?? "", /adult/i);
  const off = { ...adult, notifyOptIn: false };
  assert.equal(lastNoticeFor(off, seeded), null);
});

test("saving a search stores it against the adult email", () => {
  const seeded = seedPlatform();
  const saved = saveSearchOn(seeded, {
    email: "alex@demo.alivesport",
    q: "netball",
    postcode: "SO14 3ZE",
    radius: "5",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.search.email, "alex@demo.alivesport");
  assert.equal(saved.search.q, "netball");
  assert.equal(saved.search.adultId, "adult-alex");
  assert.equal(saved.state.savedSearches.length, 1);
  const adult = saved.state.adults.find((item) => item.id === "adult-alex");
  assert.equal(adult?.notifyOptIn, true);
});

test("searchesFor returns family searches once the adult is linked", () => {
  const seeded = seedPlatform();
  const adult = seeded.adults[0];
  const saved = saveSearchOn(seeded, {
    email: adult.email,
    adultId: adult.id,
    q: "personal",
    postcode: "SO14 3ZE",
    radius: "5",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(searchesFor(adult, saved.state).length, 1);
  assert.equal(searchesFor(adult, saved.state)[0].familyId, undefined);
});

test("saving a search rejects child-shaped fields", () => {
  const seeded = seedPlatform();
  const rejected = saveSearchOn(seeded, {
    email: "new@example.com",
    q: "swim",
    children: [{ name: "Sam" }],
  } as never);
  assert.equal(rejected.ok, false);
  if (rejected.ok) return;
  assert.equal(rejected.status, 400);
});

test("notify preview without the add-on returns 402", () => {
  const seeded = seedPlatform();
  const org = {
    ...seeded.orgs[0],
    subscription: { listing: true, notifyArea: false },
  };
  const preview = previewNotifyOn(seeded, org);
  assert.equal(preview.ok, false);
  if (preview.ok) return;
  assert.equal(preview.status, 402);
});

test("an issued token resolves the adult", () => {
  const seeded = seedPlatform();
  assert.deepEqual(seeded.tokens, []);
  const issued = issueTokenOn(seeded, "adult", "adult-alex");
  const found = findAccessToken(issued.token.token, issued.state);
  assert.ok(found);
  const actor = actorForSession(found, issued.state);
  assert.equal(actor?.role, "adult");
  if (actor?.role !== "adult") return;
  assert.equal(actor.adult.id, "adult-alex");
});

test("an unknown token does not resolve a session", () => {
  const seeded = seedPlatform();
  assert.equal(findAccessToken("tok_nope", seeded), null);
  assert.equal(actorForSession(null, seeded), null);
});

test("revoking a token stops it resolving", () => {
  const seeded = seedPlatform();
  const issued = issueTokenOn(seeded, "adult", "adult-alex");
  const revoked = revokeTokenOn(issued.state, issued.token.token);
  assert.equal(findAccessToken(issued.token.token, revoked), null);
});

test("seeded and registered passwords are hashed and still sign in", () => {
  const seeded = seedPlatform();
  const alex = seeded.credentials.find((item) => item.email === DEMO_ADULT.email);
  assert.ok(alex);
  assert.equal(isHashedPassword(alex.password), true);
  assert.ok(authenticate(DEMO_ADULT.email, DEMO_ADULT.password, seeded));
  assert.equal(authenticate(DEMO_ADULT.email, "wrong", seeded), null);

  const registered = registerAdultOn(seeded, {
    email: "new@demo.alivesport",
    password: "secret",
    displayName: "New Adult",
  });
  assert.equal(registered.ok, true);
  if (!registered.ok) return;
  const stored = registered.state.credentials.find(
    (item) => item.email === "new@demo.alivesport",
  );
  assert.ok(stored);
  assert.equal(isHashedPassword(stored.password), true);
  assert.ok(authenticate("new@demo.alivesport", "secret", registered.state));
});

test("an org API key still posts an event and is not a session token", () => {
  const seeded = seedPlatform();
  const org = seeded.orgs.find((item) => item.apiKey === DEMO_ORG.apiKey);
  assert.ok(org);
  assert.equal(findAccessToken(org.apiKey, seeded), null);
  const created = createEventOn(
    seeded,
    org,
    {
      title: "API key social",
      startsAt: "2026-10-27T20:00:00.000Z",
      publishOnAliveSport: true,
    },
    "embed",
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;
  assert.ok(publicEvents(created.state).some((event) => event.title === "API key social"));
});
