import { type NextRequest } from "next/server";
import { createEvent, publicEvents, publicOrg, readPlatform } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { publicSearchFor } from "@/lib/platform/public-search";
import { orgFromRequest } from "@/lib/platform/session";
import type { CreateEventInput } from "@/lib/platform/types";

export async function GET(request: NextRequest) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const state = await readPlatform();
  const params = request.nextUrl.searchParams;
  const result = await publicSearchFor({
    events: publicEvents(state),
    orgs: state.orgs.map(publicOrg),
    postcode: params.get("postcode") ?? "",
    radius: params.get("radius") ?? undefined,
    q: params.get("q") ?? "",
  });
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk(result.search);
}

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await orgFromRequest(request);
  if (!actor) return jsonError("Organisation sign-in or API key required.", 401);

  let body: CreateEventInput;
  try {
    body = (await request.json()) as CreateEventInput;
  } catch {
    return jsonError("Expected JSON.", 400);
  }

  const result = await createEvent(actor.org, body, actor.source);
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ event: result.event }, 201);
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
