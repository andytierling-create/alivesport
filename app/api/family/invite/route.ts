import { inviteAdultOn, inviteCommitAllowed, publicInvite } from "@/lib/platform/family";
import { readPlatform, writePlatform } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { inviteLink, inviteOrigin, sendInviteEmail } from "@/lib/platform/mail";
import { actorFromRequest } from "@/lib/platform/session";

export async function POST(request: Request) {
  const blocked = demoApiGuard();
  if (blocked) return blocked;
  const actor = await actorFromRequest(request);
  if (actor?.role !== "adult") return jsonError("Sign in required.", 401);
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return jsonError("Expected JSON.", 400);
  }
  const state = await readPlatform();
  const result = inviteAdultOn(state, actor.adult, String(body.email ?? ""));
  if (!result.ok) return jsonError(result.error, result.status);
  const link = inviteLink(inviteOrigin(request), result.invite.token);
  const mail = await sendInviteEmail({
    to: result.invite.email,
    link,
    fromName: actor.adult.displayName,
  });
  if (!inviteCommitAllowed(mail.sent)) {
    return jsonError(mail.error, 503);
  }
  await writePlatform(result.state);
  return jsonOk(
    {
      invite: publicInvite(result.invite),
      sent: mail.sent,
      ...(mail.sent || process.env.NODE_ENV === "production" ? {} : { link }),
    },
    201,
  );
}

export function OPTIONS() {
  return corsPreflight();
}

export const dynamic = "force-dynamic";
