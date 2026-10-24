import { childShapedKeysIn, issueToken, registerAdult, registerOrg } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { writeSession } from "@/lib/platform/session";
import type { AgeBand, Gender } from "@/lib/platform/types";

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Expected JSON.", 400);
  }

  const role = body.role;
  if (role === "adult") {
    const forbidden = childShapedKeysIn(body);
    if (forbidden.length) {
      return jsonError(`Adult profiles do not store ${forbidden.join(", ")}.`, 400);
    }
    const result = await registerAdult({
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      displayName: String(body.displayName ?? ""),
      postcode: typeof body.postcode === "string" ? body.postcode : undefined,
      lookingForAgeBands: Array.isArray(body.lookingForAgeBands)
        ? (body.lookingForAgeBands as AgeBand[])
        : undefined,
      gender: (body.gender as Gender | "any") ?? "any",
      accessible: Boolean(body.accessible),
      notifyOptIn: body.notifyOptIn !== false,
    });
    if (!result.ok) return jsonError(result.error, result.status);
    const access = await issueToken(result.session.role, result.session.subjectId);
    await writeSession(result.session);
    return jsonOk(
      { role: "adult", subjectId: result.adult.id, token: access.token },
      201,
    );
  }

  if (role === "org") {
    const result = await registerOrg({
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      name: String(body.name ?? ""),
      sport: String(body.sport ?? ""),
      venue: String(body.venue ?? ""),
      phone: typeof body.phone === "string" ? body.phone : undefined,
      contactEmail: typeof body.contactEmail === "string" ? body.contactEmail : undefined,
      website: typeof body.website === "string" ? body.website : undefined,
      postcode: typeof body.postcode === "string" ? body.postcode : undefined,
      ageBands: Array.isArray(body.ageBands) ? (body.ageBands as AgeBand[]) : undefined,
      gender: body.gender as Gender | undefined,
      accessible: Boolean(body.accessible),
    });
    if (!result.ok) return jsonError(result.error, result.status);
    const access = await issueToken(result.session.role, result.session.subjectId);
    await writeSession(result.session);
    return jsonOk({ role: "org", subjectId: result.org.id, token: access.token }, 201);
  }

  return jsonError("role must be adult or org.", 400);
}

export function OPTIONS() {
  return corsPreflight();
}
