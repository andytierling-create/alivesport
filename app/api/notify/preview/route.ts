import { previewNotify } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "org") return jsonError("Organisation sign-in required.", 401);
  const result = await previewNotify(actor.org);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({
    count: result.count,
    message: result.message,
    sent: false,
  });
}
