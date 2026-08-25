import Link from "next/link";

export function Footer() {
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
            <Link href="/clubs">What&apos;s on</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Link href="/#for-clubs">For clubs</Link>
            <Link href="/#for-clubs">Pricing</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <Link href="/about">About us</Link>
            <Link href="/about#unfinished">What&apos;s not built</Link>
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
