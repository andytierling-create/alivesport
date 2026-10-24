import { revokeToken } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonOk } from "@/lib/platform/http";
import { clearSession, readBearer } from "@/lib/platform/session";

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const bearer = readBearer(request);
  if (bearer) await revokeToken(bearer);
  await clearSession();
  return jsonOk({ ok: true });
}

export function OPTIONS() {
  return corsPreflight();
}
