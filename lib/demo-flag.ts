/**
 * Local two-sided mock chrome (Alex shortcuts, reset, seeded passwords).
 * On in `next dev` unless NEXT_PUBLIC_ALIVE_DEMO=0.
 * Off in production builds unless NEXT_PUBLIC_ALIVE_DEMO=1 is set on Vercel.
 */
export function isDemoEnabled() {
  if (process.env.NEXT_PUBLIC_ALIVE_DEMO === "1") return true;
  if (process.env.NEXT_PUBLIC_ALIVE_DEMO === "0") return false;
  return process.env.NODE_ENV !== "production";
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Server: store and API when Neon is configured, or when the local mock is on. */
export function isPlatformEnabled() {
  return isDemoEnabled() || hasDatabaseUrl();
}

/** Client: production builds talk to the hosted API; local uses the mock. */
export function isPlatformClientEnabled() {
  return isDemoEnabled() || process.env.NODE_ENV === "production";
}
