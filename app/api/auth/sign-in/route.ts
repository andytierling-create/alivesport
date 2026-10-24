import { authenticate, issueToken, readPlatform, replacePlatform, withUpgradedPassword } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { writeSession } from "@/lib/platform/session";

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const state = await readPlatform();
  const email = body.email ?? "";
  const password = body.password ?? "";
  const session = authenticate(email, password, state);
  if (!session) return jsonError("No account matches that email and password.", 401);
  const upgraded = withUpgradedPassword(state, email, password);
  if (upgraded !== state) await replacePlatform(upgraded);
  const access = await issueToken(session.role, session.subjectId, upgraded);
  await writeSession(session);
  return jsonOk({
    role: session.role,
    subjectId: session.subjectId,
    token: access.token,
  });
}

export function OPTIONS() {
  return corsPreflight();
}
