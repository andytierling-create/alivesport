import { leaveFamily } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "adult") return jsonError("Sign in required.", 401);
  const result = await leaveFamily(actor.adult);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ ok: true });
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
