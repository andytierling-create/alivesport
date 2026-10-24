import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";
import type { PlatformState } from "@/lib/platform/types";

export type SqlQuery = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

const ROW_ID = "default";

export function usesDatabaseUrl(url = process.env.DATABASE_URL) {
  return Boolean(url?.trim());
}

export function normaliseState(parsed: Partial<PlatformState> | null | undefined): PlatformState {
  return {
    orgs: parsed?.orgs ?? [],
    events: parsed?.events ?? [],
    adults: parsed?.adults ?? [],
    credentials: parsed?.credentials ?? [],
    lastNotice: parsed?.lastNotice !== undefined ? parsed.lastNotice : null,
    savedSearches: parsed?.savedSearches ?? [],
    tokens: parsed?.tokens ?? [],
  };
}

export async function loadFromFile(
  filePath: string,
  seed: () => PlatformState,
): Promise<PlatformState> {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Partial<PlatformState>;
    return normaliseState(parsed);
  } catch {
    const seeded = seed();
    await saveToFile(filePath, seeded);
    return seeded;
  }
}

export async function saveToFile(filePath: string, state: PlatformState) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(state, null, 2));
}

function asState(data: unknown): PlatformState {
  if (typeof data === "string") {
    return normaliseState(JSON.parse(data) as Partial<PlatformState>);
  }
  return normaliseState(data as Partial<PlatformState>);
}

export async function loadFromNeon(
  sql: SqlQuery,
  seed: () => PlatformState,
): Promise<{ state: PlatformState; version: number }> {
  const rows = await sql`
    SELECT data, version FROM platform_state WHERE id = ${ROW_ID}
  `;
  const row = rows[0];
  if (!row) {
    const seeded = seed();
    await sql`
      INSERT INTO platform_state (id, data, version)
      VALUES (${ROW_ID}, ${JSON.stringify(seeded)}::jsonb, 0)
    `;
    return { state: seeded, version: 0 };
  }
  return {
    state: asState(row.data),
    version: Number(row.version ?? 0),
  };
}

export async function saveToNeon(
  sql: SqlQuery,
  state: PlatformState,
  version: number,
): Promise<number> {
  const rows = await sql`
    UPDATE platform_state
    SET data = ${JSON.stringify(state)}::jsonb,
        version = version + 1,
        updated_at = now()
    WHERE id = ${ROW_ID} AND version = ${version}
    RETURNING version
  `;
  const next = rows[0]?.version;
  if (next === undefined) {
    throw new Error("Could not save platform state (version conflict).");
  }
  return Number(next);
}

export function createNeonSql(url = process.env.DATABASE_URL): SqlQuery {
  if (!url?.trim()) {
    throw new Error("DATABASE_URL is not set.");
  }
  return neon(url) as SqlQuery;
}
