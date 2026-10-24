import { peekInvite } from "@/lib/platform/family";
import { acceptInvite, issueToken, readPlatform } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { writeSession } from "@/lib/platform/session";

export async function GET(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const state = await readPlatform();
  const peek = peekInvite(state, token);
  if (!peek) return jsonError("That invite is not valid.", 400);
  return jsonOk(peek);
}

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  let body: { token?: string; displayName?: string; password?: string };
  try {
    body = (await request.json()) as {
      token?: string;
      displayName?: string;
      password?: string;
    };
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const result = await acceptInvite(String(body.token ?? ""), {
    displayName: body.displayName,
    password: body.password,
  });
  if (!result.ok) return jsonError(result.error, result.status);
  const session = { role: "adult" as const, subjectId: result.adult.id };
  const access = await issueToken(session.role, session.subjectId, result.state);
  await writeSession(session);
  return jsonOk(
    { role: "adult", subjectId: result.adult.id, token: access.token },
    201,
  );
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
