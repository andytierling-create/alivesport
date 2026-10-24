import { inviteAdult } from "@/lib/platform/store";
import { demoApiGuard } from "@/lib/platform/demo-api";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";
import { inviteLink, sendInviteEmail } from "@/lib/platform/mail";
import { actorFromRequest } from "@/lib/platform/session";

function publicOrigin(request: Request) {
  const forwarded = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (forwarded) return `${proto}://${forwarded.split(",")[0].trim()}`;
  const origin = request.headers.get("origin");
  if (origin) return origin;
  return new URL(request.url).origin;
}

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
  const result = await inviteAdult(actor.adult, String(body.email ?? ""));
  if (!result.ok) return jsonError(result.error, result.status);
  const link = inviteLink(publicOrigin(request), result.invite.token);
  const mail = await sendInviteEmail({
    to: result.invite.email,
    link,
    fromName: actor.adult.displayName,
  });
  if (process.env.NODE_ENV === "production" && !mail.sent) {
    return jsonError(mail.error, 503);
  }
  return jsonOk(
    {
      invite: result.invite,
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
