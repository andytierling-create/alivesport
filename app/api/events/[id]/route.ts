import { deleteEvent } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "org") return jsonError("Organisation sign-in required.", 401);
  const { id } = await context.params;
  const result = await deleteEvent(actor.org.id, id);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ ok: true });
}
