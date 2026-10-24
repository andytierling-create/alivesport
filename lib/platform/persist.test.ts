import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  loadFromFile,
  loadFromNeon,
  normaliseState,
  saveToFile,
  saveToNeon,
  usesDatabaseUrl,
  type SqlQuery,
} from "./persist";
import type { PlatformState } from "./types";

function emptyState(): PlatformState {
  return {
    orgs: [],
    events: [],
    adults: [],
    credentials: [],
    lastNotice: null,
    savedSearches: [],
    tokens: [],
    families: [],
    familyInvites: [],
    activityCategories: [],
  };
}

function fakeSql(
  handler: (sql: string, values: unknown[]) => Record<string, unknown>[],
): SqlQuery {
  return async (strings, ...values) => {
    const sql = strings.join("?");
    return handler(sql, values);
  };
}

test("normaliseState fills missing adult categoryIds", () => {
  const state = normaliseState({
    adults: [
      {
        id: "adult-x",
        displayName: "X",
        email: "x@demo.alivesport",
        postcode: "SO14 3ZE",
        lookingForAgeBands: [],
        gender: "any",
        accessible: false,
        notifyOptIn: true,
      } as never,
    ],
  });
  assert.deepEqual(state.adults[0].categoryIds, []);
});

test("usesDatabaseUrl is false when the variable is missing or blank", () => {
  assert.equal(usesDatabaseUrl(undefined), false);
  assert.equal(usesDatabaseUrl(""), false);
  assert.equal(usesDatabaseUrl("   "), false);
  assert.equal(usesDatabaseUrl("postgresql://example"), true);
});

test("a missing file store seeds and writes the fallback file", async () => {
  const dir = mkdtempSync(join(tmpdir(), "alive-store-"));
  const filePath = join(dir, "platform.json");
  try {
    const state = await loadFromFile(filePath, emptyState);
    assert.equal(state.orgs.length, 0);
    const written = JSON.parse(readFileSync(filePath, "utf8")) as PlatformState;
    assert.deepEqual(written.tokens, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an existing file store is read without hitting Neon", async () => {
  const dir = mkdtempSync(join(tmpdir(), "alive-store-"));
  const filePath = join(dir, "platform.json");
  try {
    const seeded = emptyState();
    seeded.lastNotice = "from-file";
    writeFileSync(filePath, JSON.stringify(seeded));
    const state = await loadFromFile(filePath, emptyState);
    assert.equal(state.lastNotice, "from-file");
    await saveToFile(filePath, { ...state, lastNotice: "saved" });
    const written = JSON.parse(readFileSync(filePath, "utf8")) as PlatformState;
    assert.equal(written.lastNotice, "saved");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an empty Neon table is seeded on first load", async () => {
  const calls: string[] = [];
  const sql = fakeSql((query) => {
    calls.push(query);
    if (query.includes("SELECT")) return [];
    return [{ version: 0 }];
  });
  const loaded = await loadFromNeon(sql, emptyState);
  assert.equal(loaded.version, 0);
  assert.ok(calls.some((query) => query.includes("INSERT")));
});

test("Neon load returns the stored document", async () => {
  const stored = emptyState();
  stored.lastNotice = "from-neon";
  const sql = fakeSql((query) => {
    if (query.includes("SELECT")) return [{ data: stored, version: 3 }];
    throw new Error(`unexpected query: ${query}`);
  });
  const loaded = await loadFromNeon(sql, emptyState);
  assert.equal(loaded.version, 3);
  assert.equal(loaded.state.lastNotice, "from-neon");
});

test("Neon save bumps version and fails on a conflict", async () => {
  const sqlOk = fakeSql(() => [{ version: 4 }]);
  assert.equal(await saveToNeon(sqlOk, emptyState(), 3), 4);

  const sqlConflict = fakeSql(() => []);
  await assert.rejects(
    () => saveToNeon(sqlConflict, emptyState(), 3),
    /conflict/i,
  );
});
