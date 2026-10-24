import assert from "node:assert/strict";
import { test } from "node:test";
import { normaliseState } from "./persist";
import {
  SEED_CATEGORY_LABELS,
  acceptInviteOn,
  addCategoryOn,
  inviteAdultOn,
  isCategoryAdmin,
  leaveFamilyOn,
  patchFamilyOn,
  seedCategories,
} from "./family";
import { registerAdultOn, saveSearchOn, searchesFor, seedPlatform } from "./store";

test("normaliseState fills empty family collections and seed categories match the spec labels", () => {
  const state = normaliseState({});
  assert.deepEqual(state.families, []);
  assert.deepEqual(state.familyInvites, []);
  assert.deepEqual(state.activityCategories, []);
  assert.deepEqual(
    seedCategories().map((item) => item.label),
    SEED_CATEGORY_LABELS,
  );
});

function twoAdults() {
  const seeded = seedPlatform();
  const first = seeded.adults[0];
  const registered = registerAdultOn(seeded, {
    email: "jordan@demo.alivesport",
    password: "secret12",
    displayName: "Jordan Lee",
    postcode: "SO15 1AA",
  });
  assert.equal(registered.ok, true);
  if (!registered.ok) throw new Error("register");
  const second = registered.adult;
  return { state: registered.state, first, second };
}

test("invite then accept links two adults", () => {
  const { state, first, second } = twoAdults();
  const invited = inviteAdultOn(state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  assert.equal(accepted.family.adultIds.length, 2);
  assert.ok(accepted.family.adultIds.includes(first.id));
  assert.ok(accepted.family.adultIds.includes(second.id));
  assert.equal(accepted.state.familyInvites.length, 0);
});

test("invite to an adult already in a family is rejected", () => {
  const { state, first, second } = twoAdults();
  const invited = inviteAdultOn(state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  const third = registerAdultOn(accepted.state, {
    email: "sam@demo.alivesport",
    password: "secret12",
    displayName: "Sam",
  });
  assert.equal(third.ok, true);
  if (!third.ok) return;
  const again = inviteAdultOn(third.state, third.adult, second.email);
  assert.equal(again.ok, false);
  if (again.ok) return;
  assert.equal(again.status, 409);
});

test("accept expired token fails and leaves one adult", () => {
  const { state, first, second } = twoAdults();
  const now = new Date("2026-01-01T00:00:00.000Z");
  const invited = inviteAdultOn(state, first, second.email, now);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const later = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {}, later);
  assert.equal(accepted.ok, false);
  if (accepted.ok) return;
  assert.equal(accepted.status, 400);
  assert.equal(invited.state.families[0].adultIds.length, 1);
});

test("accept reused token fails", () => {
  const { state, first, second } = twoAdults();
  const invited = inviteAdultOn(state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const firstAccept = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(firstAccept.ok, true);
  if (!firstAccept.ok) return;
  const secondAccept = acceptInviteOn(firstAccept.state, invited.invite.token, {});
  assert.equal(secondAccept.ok, false);
  if (secondAccept.ok) return;
  assert.equal(secondAccept.status, 400);
});

test("new adult accept creates an account and joins", () => {
  const seeded = seedPlatform();
  const first = seeded.adults[0];
  const invited = inviteAdultOn(seeded, first, "new@demo.alivesport");
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {
    displayName: "New Player",
    password: "secret12",
  });
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  assert.ok(accepted.state.credentials.some((item) => item.email === "new@demo.alivesport"));
  assert.equal(accepted.family.adultIds.length, 2);
});

test("patchFamilyOn rejects child-shaped keys", () => {
  const { state, first } = twoAdults();
  const invited = inviteAdultOn(state, first, "x@demo.alivesport");
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const patched = patchFamilyOn(invited.state, first, { children: [] });
  assert.equal(patched.ok, false);
  if (patched.ok) return;
  assert.equal(patched.status, 400);
  assert.match(patched.error, /do not store/i);
});

test("patchFamilyOn accepts childSlots age band and gender only", () => {
  const { state, first } = twoAdults();
  const invited = inviteAdultOn(state, first, "x@demo.alivesport");
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const patched = patchFamilyOn(invited.state, first, {
    childSlots: [{ ageBand: "3-10", gender: "mixed" }],
  });
  assert.equal(patched.ok, true);
  if (!patched.ok) return;
  const slot = patched.family.childSlots[0];
  assert.equal(slot.ageBand, "3-10");
  assert.equal(slot.gender, "mixed");
  assert.ok(slot.id);
  assert.deepEqual(Object.keys(slot).sort(), ["ageBand", "gender", "id"]);
});

test("ninth child slot is rejected", () => {
  const { state, first } = twoAdults();
  const invited = inviteAdultOn(state, first, "x@demo.alivesport");
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const slots = Array.from({ length: 9 }, () => ({ ageBand: "3-10" as const, gender: "mixed" as const }));
  const patched = patchFamilyOn(invited.state, first, { childSlots: slots });
  assert.equal(patched.ok, false);
  if (patched.ok) return;
  assert.equal(patched.status, 400);
});

test("either adult can patch childSlots", () => {
  const { state, first, second } = twoAdults();
  const invited = inviteAdultOn(state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  const patched = patchFamilyOn(accepted.state, second, {
    childSlots: [{ ageBand: "10-18", gender: "women" }],
  });
  assert.equal(patched.ok, true);
  if (!patched.ok) return;
  assert.equal(patched.family.childSlots[0].ageBand, "10-18");
});

test("one adult leave keeps family for the other", () => {
  const { state, first, second } = twoAdults();
  const invited = inviteAdultOn(state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  const left = leaveFamilyOn(accepted.state, second);
  assert.equal(left.ok, true);
  if (!left.ok) return;
  assert.equal(left.state.families.length, 1);
  assert.deepEqual(left.state.families[0].adultIds, [first.id]);
});

test("last adult leave deletes family and voids invite", () => {
  const seeded = seedPlatform();
  const first = seeded.adults[0];
  const invited = inviteAdultOn(seeded, first, "pending@demo.alivesport");
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const left = leaveFamilyOn(invited.state, first);
  assert.equal(left.ok, true);
  if (!left.ok) return;
  assert.equal(left.state.families.length, 0);
  assert.equal(left.state.familyInvites.length, 0);
});

test("creating a family carries that adult's existing searches", () => {
  const seeded = seedPlatform();
  const first = seeded.adults[0];
  const saved = saveSearchOn(seeded, {
    email: first.email,
    adultId: first.id,
    q: "walking",
    postcode: "SO14 3ZE",
    radius: "5",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const invited = inviteAdultOn(saved.state, first, "x@demo.alivesport");
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const listed = searchesFor(first, invited.state);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].familyId, invited.family.id);
});

test("accepting carries the second adult's existing searches onto the family", () => {
  const { state, first, second } = twoAdults();
  const saved = saveSearchOn(state, {
    email: second.email,
    adultId: second.id,
    q: "swim",
    postcode: "SO15 1AA",
    radius: "5",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const invited = inviteAdultOn(saved.state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  const listed = searchesFor(first, accepted.state);
  assert.ok(listed.some((item) => item.q === "swim" && item.familyId === accepted.family.id));
});

test("after link, a new save from either adult is a family search", () => {
  const { state, first, second } = twoAdults();
  const invited = inviteAdultOn(state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  const saved = saveSearchOn(accepted.state, {
    email: second.email,
    adultId: second.id,
    q: "netball",
    postcode: "SO14 3ZE",
    radius: "5",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  assert.equal(saved.search.familyId, accepted.family.id);
  assert.ok(searchesFor(first, saved.state).some((item) => item.q === "netball"));
});

test("leaver does not keep the family search list", () => {
  const { state, first, second } = twoAdults();
  const invited = inviteAdultOn(state, first, second.email);
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const accepted = acceptInviteOn(invited.state, invited.invite.token, {});
  assert.equal(accepted.ok, true);
  if (!accepted.ok) return;
  const saved = saveSearchOn(accepted.state, {
    email: first.email,
    adultId: first.id,
    q: "shared",
    postcode: "SO14 3ZE",
    radius: "5",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const left = leaveFamilyOn(saved.state, second);
  assert.equal(left.ok, true);
  if (!left.ok) return;
  assert.equal(searchesFor(second, left.state).some((item) => item.q === "shared"), false);
  assert.ok(searchesFor(first, left.state).some((item) => item.q === "shared"));
});

test("last adult leave returns family searches to that adult as personal", () => {
  const seeded = seedPlatform();
  const first = seeded.adults[0];
  const saved = saveSearchOn(seeded, {
    email: first.email,
    adultId: first.id,
    q: "kept",
    postcode: "SO14 3ZE",
    radius: "5",
  });
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const invited = inviteAdultOn(saved.state, first, "gone@demo.alivesport");
  assert.equal(invited.ok, true);
  if (!invited.ok) return;
  const left = leaveFamilyOn(invited.state, first);
  assert.equal(left.ok, true);
  if (!left.ok) return;
  const listed = searchesFor(first, left.state);
  assert.ok(listed.some((item) => item.q === "kept" && !item.familyId));
});

test("addCategoryOn appends a label Andy can add", () => {
  const seeded = seedPlatform();
  const added = addCategoryOn(seeded, "Martial arts");
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.equal(added.category.label, "Martial arts");
  assert.equal(added.category.slug, "martial-arts");
  assert.ok(added.state.activityCategories.some((item) => item.slug === "martial-arts"));
});

test("addCategoryOn rejects a blank label", () => {
  const seeded = seedPlatform();
  const added = addCategoryOn(seeded, "   ");
  assert.equal(added.ok, false);
  if (added.ok) return;
  assert.equal(added.status, 400);
});

test("isCategoryAdmin matches ADMIN_EMAILS", () => {
  assert.equal(
    isCategoryAdmin("andy@example.com", "andy@example.com, other@x.com"),
    true,
  );
  assert.equal(isCategoryAdmin("nope@example.com", "andy@example.com, other@x.com"), false);
});


