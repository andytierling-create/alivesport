import type { Metadata } from "next";
import Link from "next/link";
import { CLUB_SETUP_COPY } from "@/data/copy";

export const metadata: Metadata = {
  title: "For clubs",
};

export default function ForClubsPage() {
  return (
    <div className="page-shell">
      <section className="section indent" style={{ paddingTop: 74, paddingBottom: 48 }}>
        <div className="hero-copy" style={{ marginLeft: 0, maxWidth: 760 }}>
          <div className="eyebrow">For clubs & leisure centres</div>
          <h1 className="display h1-clubs" style={{ fontSize: 56 }}>
            Two things a listing actually does for you.
          </h1>
          <p className="hero-sub" style={{ marginBottom: 0 }}>
            Alive Sport is for the people looking — and for the clubs they
            haven&apos;t found yet. No commission on what you charge. No app
            for your members to download.
          </p>
        </div>
      </section>

      <section className="indent" style={{ paddingBottom: 20 }}>
        <div className="for-clubs-benefits">
          <article className="for-clubs-benefit">
            <div className="eyebrow" style={{ color: "#FF2FA7" }}>
              1
            </div>
            <h2 className="display" style={{ fontSize: 32, margin: "0 0 12px" }}>
              A proper club profile
            </h2>
            <p>
              Sessions, ages, who it&apos;s for, access notes, and how to join
              — in one place people can search. You become findable by someone
              new in the area, not only by people who already know your name.
            </p>
          </article>
          <article className="for-clubs-benefit">
            <div className="eyebrow" style={{ color: "#3B96DC" }}>
              2
            </div>
            <h2 className="display" style={{ fontSize: 32, margin: "0 0 12px" }}>
              Reach people who don&apos;t follow you yet
            </h2>
            <p>
              Tell people nearby about events and news. Facebook only reaches
              people who already follow the club. Word of mouth only reaches
              people who already know someone. This is the step up from both.
            </p>
          </article>
        </div>
      </section>

      <section className="skew-band club-band" style={{ marginTop: 20 }}>
        <div className="skew-inner">
          <div style={{ flex: 1.1 }}>
            <div className="eyebrow" style={{ color: "rgba(10,13,36,.6)" }}>
              Setup
            </div>
            <h2 className="h2 h2-sm" style={{ color: "#0A0D24", marginBottom: 16, fontSize: 42 }}>
              {CLUB_SETUP_COPY}
            </h2>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: 16,
                lineHeight: 1.55,
                color: "rgba(10,13,36,.78)",
                maxWidth: "46ch",
              }}
            >
              You add your sessions once. We keep them findable. No rewriting
              your website, no commission, no extra app.
            </p>
            <Link href="/suggest" className="btn-navy">
              Register your club
            </Link>
          </div>
          <div className="price-card">
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span className="display" style={{ fontSize: 46, lineHeight: 1 }}>
                £19
              </span>
              <span style={{ fontSize: 15, color: "rgba(247,245,255,.6)" }}>
                per month, per club
              </span>
            </div>
            <div style={{ fontSize: 13, color: "#FFC94D", marginBottom: 20 }}>
              Cancel any month. First two months free at launch.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div className="price-row">
                <span style={{ color: "rgba(247,245,255,.75)" }}>Commission on your fees</span>
                <span style={{ fontWeight: 600 }}>£0</span>
              </div>
              <div className="price-row">
                <span style={{ color: "rgba(247,245,255,.75)" }}>Sessions you can list</span>
                <span style={{ fontWeight: 600 }}>Unlimited</span>
              </div>
              <div className="price-row">
                <span style={{ color: "rgba(247,245,255,.75)" }}>Time to set up</span>
                <span style={{ fontWeight: 600 }}>~10 min</span>
              </div>
              <div className="price-row">
                <span style={{ color: "rgba(247,245,255,.75)" }}>Booking & payments</span>
                <span style={{ fontWeight: 600 }}>Not included</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
