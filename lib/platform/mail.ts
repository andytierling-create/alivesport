export function inviteLink(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}/join/family?token=${encodeURIComponent(token)}`;
}

export function inviteOrigin(
  request: Request,
  env: Record<string, string | undefined> = process.env,
) {
  const configured = (env.ALIVE_SITE_URL || env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (configured) return configured.replace(/\/$/, "");
  if (env.NODE_ENV === "production") {
    return "https://alive-sport-website.vercel.app";
  }
  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function sendInviteEmail(input: {
  to: string;
  link: string;
  fromName: string;
}): Promise<{ sent: true } | { sent: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: "Email is not configured." };
  const from = process.env.RESEND_FROM || "Alive Sport <hello@alivesport.co.uk>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: "Join this family on Alive Sport",
      text: `${input.fromName} invited you to share a family on Alive Sport. ${input.link}`,
    }),
  });
  if (!response.ok) {
    return { sent: false, error: "Email could not be sent." };
  }
  return { sent: true };
}
