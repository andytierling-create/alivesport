import { readPlatform, saveSearch, searchesFor } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";
import type { SaveSearchInput } from "@/lib/platform/types";

export async function GET(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "adult") return jsonError("Adult sign-in required.", 401);
  const state = await readPlatform();
  return jsonOk({ searches: searchesFor(actor.adult, state) });
}

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  let body: SaveSearchInput & Record<string, unknown>;
  try {
    body = (await request.json()) as SaveSearchInput & Record<string, unknown>;
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const actor = await actorFromRequest(request);
  if (actor?.role === "adult") {
    body.email = body.email || actor.adult.email;
    body.adultId = actor.adult.id;
  }
  const result = await saveSearch(body);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk(
    {
      search: result.search,
      sent: false,
      message:
        "Saved. If this were live we would email when a matching session appears. Nothing is sent from this demo.",
    },
    201,
  );
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
