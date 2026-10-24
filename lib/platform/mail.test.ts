import assert from "node:assert/strict";
import { test } from "node:test";
import { inviteLink, inviteOrigin, sendInviteEmail } from "./mail";

test("inviteLink points at /join/family", () => {
  assert.equal(
    inviteLink("https://alive-sport-website.vercel.app", "inv_abc"),
    "https://alive-sport-website.vercel.app/join/family?token=inv_abc",
  );
});

test("inviteOrigin in production uses the configured site URL, not forwarded host", () => {
  const request = new Request("http://localhost:3000/api/family/invite", {
    headers: { "x-forwarded-host": "evil.example", origin: "https://evil.example" },
  });
  assert.equal(
    inviteOrigin(request, {
      NODE_ENV: "production",
      ALIVE_SITE_URL: "https://alive-sport-website.vercel.app",
    }),
    "https://alive-sport-website.vercel.app",
  );
});

test("sendInviteEmail without RESEND_API_KEY does not claim sent", async () => {
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  const result = await sendInviteEmail({
    to: "jordan@demo.alivesport",
    link: "https://example.com/join/family?token=inv_x",
    fromName: "Alex",
  });
  if (previous === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = previous;
  assert.equal(result.sent, false);
  if (result.sent) return;
  assert.match(result.error, /not configured/i);
});
