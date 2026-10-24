export function inviteLink(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}/join/family?token=${encodeURIComponent(token)}`;
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
