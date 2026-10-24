/**
 * Local two-sided mock.
 * On in `next dev` unless NEXT_PUBLIC_ALIVE_DEMO=0.
 * Off in production builds unless NEXT_PUBLIC_ALIVE_DEMO=1 is set on Vercel.
 */
export function isDemoEnabled() {
  if (process.env.NEXT_PUBLIC_ALIVE_DEMO === "1") return true;
  if (process.env.NEXT_PUBLIC_ALIVE_DEMO === "0") return false;
  return process.env.NODE_ENV !== "production";
}
