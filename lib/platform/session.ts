import { cookies } from "next/headers";
import {
  actorForSession,
  findAccessToken,
  findOrgByApiKey,
  readPlatform,
} from "@/lib/platform/store";
import { SESSION_COOKIE, type Session } from "@/lib/platform/types";

export function parseSessionValue(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (parsed.role !== "adult" && parsed.role !== "org") return null;
    if (!parsed.subjectId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readBearer(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1].trim() || null;
}

export async function readSession(): Promise<Session | null> {
  const jar = await cookies();
  return parseSessionValue(jar.get(SESSION_COOKIE)?.value);
}

export async function writeSession(session: Session) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function sessionActor() {
  const [session, state] = await Promise.all([readSession(), readPlatform()]);
  return actorForSession(session, state);
}

export async function actorFromRequest(request: Request) {
  const state = await readPlatform();
  const bearer = readBearer(request);
  if (bearer) {
    const access = findAccessToken(bearer, state);
    return actorForSession(access, state);
  }
  const session = await readSession();
  return actorForSession(session, state);
}

export async function orgFromRequest(request: Request) {
  const state = await readPlatform();
  const bearer = readBearer(request);
  if (bearer) {
    const access = findAccessToken(bearer, state);
    const fromToken = actorForSession(access, state);
    if (fromToken?.role === "org") {
      return { org: fromToken.org, source: "desk" as const };
    }
    const fromKey = findOrgByApiKey(bearer, state);
    if (fromKey) return { org: fromKey, source: "embed" as const };
    return null;
  }
  const session = await readSession();
  const actor = actorForSession(session, state);
  if (actor?.role === "org") return { org: actor.org, source: "desk" as const };
  return null;
}
