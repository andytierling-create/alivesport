import { patchFamily } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";

export async function PATCH(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "adult") return jsonError("Sign in required.", 401);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const result = await patchFamily(actor.adult, body);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ family: result.family });
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
