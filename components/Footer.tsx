import Link from "next/link";
import { isDemoEnabled, isPlatformClientEnabled } from "@/lib/demo-flag";

export function Footer() {
  const demo = isDemoEnabled();
  const platform = isPlatformClientEnabled();

  return (
    <footer className="site-footer">
      <div style={{ display: "flex", gap: 44, flexWrap: "wrap" }}>
        <div>
          <div className="wordmark" style={{ fontSize: 15 }}>
            ALIVE SPORT
          </div>
          <div style={{ fontSize: 12, color: "rgba(247,245,255,.5)", marginTop: 6 }}>
            Southampton, UK
          </div>
        </div>
        <div className="footer-links">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Link href="/clubs">Find a club</Link>
            <Link href="/wellness">Wellness</Link>
            <Link href="/whats-on">What&apos;s on</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Link href="/for-clubs">For clubs</Link>
            <Link href="/for-clubs">Pricing</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Link href="/about">About us</Link>
            {platform ? <Link href="/join">{demo ? "Join the demo" : "Join"}</Link> : null}
            {demo ? <Link href="/embed">Club snippet</Link> : null}
            <Link href="/suggest">Suggest a club</Link>
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          color: "rgba(247,245,255,.4)",
          textAlign: "right",
        }}
      >
        Free for families, always.
        <br />© 2026 Alive Sport Ltd
      </div>
    </footer>
  );
}
