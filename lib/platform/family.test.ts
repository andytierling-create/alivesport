import assert from "node:assert/strict";
import { test } from "node:test";
import { normaliseState } from "./persist";
import { SEED_CATEGORY_LABELS, seedCategories } from "./family";

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
