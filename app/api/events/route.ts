import { type NextRequest } from "next/server";
import { familyForAdult } from "@/lib/platform/family";
import { createEvent, publicEvents, publicOrg, readPlatform } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import {
  familyFitInput,
  fitsFamily,
  publicSearchFor,
  shouldStampFitsFamily,
} from "@/lib/platform/public-search";
import { actorFromRequest, orgFromRequest } from "@/lib/platform/session";
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
  const actor = await actorFromRequest(request);
  if (actor?.role !== "adult") return jsonOk(result.search);
  const family = familyForAdult(actor.adult, state);
  const fit = familyFitInput(actor.adult, state, family);
  if (!shouldStampFitsFamily(family, fit)) return jsonOk(result.search);
  const orgSport = new Map(state.orgs.map((org) => [org.id, org.sport]));
  return jsonOk({
    ...result.search,
    orgs: result.search.orgs.map((org) => ({
      ...org,
      fitsFamily: fitsFamily(org, fit),
    })),
    events: result.search.events.map((event) => ({
      ...event,
      fitsFamily: fitsFamily(
        { ...event, sport: orgSport.get(event.orgId) },
        fit,
      ),
    })),
  });
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
