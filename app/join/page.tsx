import Link from "next/link";
import { DemoBanner } from "@/components/DemoBanner";

export default function JoinPage() {
  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero">
        <div className="eyebrow">Local demo</div>
        <h1 className="display h1-clubs" style={{ fontSize: 56, maxWidth: "16ch" }}>
          Who are you turning up as?
        </h1>
        <p className="hero-sub" style={{ marginBottom: 36 }}>
          Two sides of the same pitch. Pick a door — you can switch whenever
          you like.
        </p>
        <div className="join-grid">
          <Link href="/join/play" className="join-card play-card">
            <div className="eyebrow" style={{ color: "#FF2FA7" }}>
              I want to play
            </div>
            <h2 className="display">Find your play</h2>
            <p>
              Set a postcode, ages, and whether you need accessible sessions.
              Then search the same list clubs are writing into.
            </p>
            <span className="join-go">Make an adult account →</span>
          </Link>
          <Link href="/join/club" className="join-card club-card">
            <div className="eyebrow" style={{ color: "#3B96DC" }}>
              I run a club
            </div>
            <h2 className="display">Get found</h2>
            <p>
              Put the club on the map, add a session, and see it appear for
              people searching nearby — including Friday floodlit socials.
            </p>
            <span className="join-go">Open a club desk →</span>
          </Link>
        </div>
        <p className="notify-note" style={{ marginTop: 28 }}>
          Already set up?{" "}
          <Link href="/sign-in" style={{ color: "#FFC94D", fontWeight: 600 }}>
            Sign in
          </Link>{" "}
          or jump in as Alex or Bitterne Netball.
        </p>
      </section>
    </div>
  );
}
