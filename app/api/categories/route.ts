import { isCategoryAdmin } from "@/lib/platform/family";
import { addCategory, readPlatform } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { actorFromRequest } from "@/lib/platform/session";

export async function GET() {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const state = await readPlatform();
  return jsonOk({ categories: state.activityCategories });
}

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "adult") return jsonError("Sign in required.", 401);
  if (!isCategoryAdmin(actor.adult.email)) {
    return jsonError("You cannot add categories.", 403);
  }
  let body: { label?: string };
  try {
    body = (await request.json()) as { label?: string };
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const result = await addCategory(String(body.label ?? ""));
  if (!result.ok) return jsonError(result.error, result.status);
  return jsonOk({ category: result.category }, 201);
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
