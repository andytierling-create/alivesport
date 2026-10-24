import { eventsForOrg, patchOrg, publicOrg, readPlatform } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";
import type { OrgPatch } from "@/lib/platform/types";

export async function GET(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "org") return jsonError("Organisation sign-in required.", 401);
  const state = await readPlatform();
  return jsonOk({
    org: actor.org,
    events: eventsForOrg(actor.org.id, state),
    public: publicOrg(actor.org),
  });
}

export async function PATCH(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "org") return jsonError("Organisation sign-in required.", 401);
  let body: OrgPatch;
  try {
    body = (await request.json()) as OrgPatch;
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const result = await patchOrg(actor.org.id, body);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ org: result.org });
}

export const dynamic = "force-dynamic";
