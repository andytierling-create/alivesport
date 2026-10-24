import { demoApiGuard } from "@/lib/platform/demo-api";
import { jsonError, jsonOk } from "@/lib/platform/http";
import { clearSession } from "@/lib/platform/session";
import { resetPlatform } from "@/lib/platform/store";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return jsonError("Not found.", 404);
  }
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  await resetPlatform();
  await clearSession();
  return jsonOk({ ok: true });
}
