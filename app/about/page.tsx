import type { Metadata } from "next";
import Link from "next/link";
import { PhotoSlot } from "@/components/Media";
import { roadmap, roadmapUpdated } from "@/data/roadmap";

export const metadata: Metadata = {
  title: "About us",
};

const statusColor = {
  shipped: "#3B96DC",
  "in-progress": "#FFC94D",
  "not-started": "#FF2FA7",
} as const;

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="section indent" style={{ paddingTop: 74, paddingBottom: 60 }}>
        <div className="hero-copy" style={{ marginLeft: 0, maxWidth: 800 }}>
          <div className="eyebrow" style={{ color: "#3B96DC" }}>
            About us
          </div>
          <h1 className="display h1-about">
            Two people in{" "}
            <span className="gradient-text" style={{ transform: "rotate(-3deg)" }}>
              Southampton
            </span>
            , trying to get more of Hampshire playing.
          </h1>
          <p className="hero-sub" style={{ maxWidth: "56ch", marginBottom: 0 }}>
            We started Alive Sport because finding a local club shouldn&apos;t
            mean three Facebook groups, a dead phone number and a PDF from 2019.
            And because the clubs doing the work are run by volunteers who
            don&apos;t have a marketing budget.
          </p>
        </div>
      </section>

      <section
        className="skew-band about-band"
        style={{
          background: "#131A3C",
          transform: "skewY(-2.2deg)",
          padding: "66px 68px",
        }}
      >
        <div className="skew-inner" style={{ transform: "skewY(2.2deg)", alignItems: "center", gap: 44 }}>
          <div style={{ flex: 1.15 }}>
            <h2 className="h2 h2-sm" style={{ marginBottom: 18 }}>
              Sport is for everyone — said by nearly everyone, designed for by almost no one.
            </h2>
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(247,245,255,.75)",
                maxWidth: "50ch",
              }}
            >
              Participation drops off hardest for four groups: children whose
              parents can&apos;t find anything nearby, women and girls who
              don&apos;t want their first session to be competitive, disabled
              people who can&apos;t find out whether the door is even step-free,
              and older adults who&apos;ve been quietly told sport is over for
              them.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(247,245,255,.75)",
                maxWidth: "50ch",
              }}
            >
              Our mark has three athletes in it and one of them is in a
              wheelchair, in the middle, celebrating with the others. That&apos;s
              not a badge — it&apos;s the brief.
            </p>
          </div>
          <PhotoSlot
            label="photo — real session, Southampton"
            className="about-photo"
          />
        </div>
      </section>

      <section className="section indent" style={{ paddingBottom: 20 }}>
        <div className="eyebrow">What we hold ourselves to</div>
        <div className="value-grid">
          <article className="value-card" style={{ transform: "rotate(-.8deg)", ["--accent" as string]: "#FF2FA7" }}>
            <h3 className="display" style={{ fontSize: 26, color: "#FF2FA7", margin: "0 0 8px" }}>
              Honesty
            </h3>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "rgba(247,245,255,.72)" }}>
              If a club&apos;s details are unverified, the listing says so. If a
              feature doesn&apos;t exist, we don&apos;t put a screenshot of it on
              the homepage.
            </p>
          </article>
          <article className="value-card" style={{ transform: "rotate(.9deg)", ["--accent" as string]: "#3B96DC" }}>
            <h3 className="display" style={{ fontSize: 26, color: "#3B96DC", margin: "0 0 8px" }}>
              Transparency
            </h3>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "rgba(247,245,255,.72)" }}>
              One price, published. No commission, no tiers that appear at
              checkout, no &quot;contact sales&quot;.
            </p>
          </article>
          <article className="value-card" style={{ transform: "rotate(1deg)", ["--accent" as string]: "#FFC94D" }}>
            <h3 className="display" style={{ fontSize: 26, color: "#FFC94D", margin: "0 0 8px" }}>
              Improvement
            </h3>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "rgba(247,245,255,.72)" }}>
              We ship small and often, and we publish what changed. The roadmap
              below is the real one.
            </p>
          </article>
          <article className="value-card" style={{ transform: "rotate(-1.1deg)", ["--accent" as string]: "#FF2FA7" }}>
            <h3 className="display gradient-text" style={{ fontSize: 26, margin: "0 0 8px" }}>
              Drive
            </h3>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "rgba(247,245,255,.72)" }}>
              We walk into clubs and leisure centres in person. Hampshire first,
              properly, before anywhere else.
            </p>
          </article>
        </div>
      </section>

      <section className="indent" id="unfinished" style={{ padding: "60px 48px 40px 198px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 22,
            gap: 12,
          }}
        >
          <h2 className="h2" style={{ fontSize: 36, margin: 0 }}>
            The unfinished list
          </h2>
          <span style={{ fontSize: 13, color: "rgba(247,245,255,.5)" }}>
            Updated {roadmapUpdated}
          </span>
        </div>
        <div style={{ borderTop: "1px solid rgba(247,245,255,.14)", maxWidth: 1000 }}>
          {roadmap.map((item) => (
            <div className="roadmap-row" key={item.detail}>
              <span className="roadmap-status" style={{ color: statusColor[item.status] }}>
                {item.label}
              </span>
              <span style={{ flex: 1, fontSize: 15 }}>{item.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="indent" style={{ padding: "40px 48px 70px 198px" }}>
        <h2 className="h2" style={{ fontSize: 36, margin: "0 0 24px" }}>
          Who you&apos;re actually emailing
        </h2>
        <div className="people-grid">
          <article className="person-card">
            <PhotoSlot label="photo" className="avatar" />
            <div>
              <div className="display" style={{ fontSize: 20 }}>
                Co-founder · product
              </div>
              <div style={{ fontSize: 13, color: "rgba(247,245,255,.62)", marginTop: 5 }}>
                Builds the site. Answers club emails on weeknights.
              </div>
            </div>
          </article>
          <article className="person-card">
            <PhotoSlot label="photo" className="avatar" />
            <div>
              <div className="display" style={{ fontSize: 20 }}>
                Co-founder · clubs
              </div>
              <div style={{ fontSize: 13, color: "rgba(247,245,255,.62)", marginTop: 5 }}>
                Visits clubs, verifies access details, runs onboarding.
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="skew-band cta-band">
        <div
          className="skew-inner"
          style={{ justifyContent: "space-between", alignItems: "center", gap: 36 }}
        >
          <div>
            <h2 className="h2 h2-sm" style={{ color: "#0A0D24", margin: "0 0 10px" }}>
              Know a club that should be on here?
            </h2>
            <p style={{ margin: 0, fontSize: 16, color: "rgba(10,13,36,.75)" }}>
              Tell us and we&apos;ll do the chasing. It takes one line.
            </p>
          </div>
          <Link href="/suggest" className="btn-navy" style={{ whiteSpace: "nowrap" }}>
            Suggest a club
          </Link>
        </div>
      </section>
    </div>
  );
}
