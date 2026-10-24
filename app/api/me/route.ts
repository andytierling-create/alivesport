import { eventsForOrg, lastNoticeFor, patchAdult, readPlatform, searchesFor } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";

export async function GET(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (!actor) return jsonError("Sign in required.", 401);
  const state = await readPlatform();
  if (actor.role === "adult") {
    return jsonOk({
      role: "adult" as const,
      adult: actor.adult,
      lastNotice: lastNoticeFor(actor.adult, state),
      savedSearches: searchesFor(actor.adult, state),
    });
  }
  return jsonOk({
    role: "org" as const,
    org: actor.org,
    events: eventsForOrg(actor.org.id, state),
  });
}

export async function PATCH(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (!actor) return jsonError("Sign in required.", 401);
  if (actor.role !== "adult") {
    return jsonError("Only an adult can update search preferences.", 403);
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const result = await patchAdult(actor.adult.id, body);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ role: "adult" as const, adult: result.adult });
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
