import Link from "next/link";
import { AthleteFigures, GroupMark } from "@/components/AthleteFigures";
import { HomeSearch, PopularChips } from "@/components/HomeSearch";
import { PhotoSlot, Tag } from "@/components/Media";
import { featuredSessions } from "@/data/clubs";

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="glow-pink" />
      <div className="glow-blue" />

      <section className="hero-home">
        <div className="hero-copy">
          <div className="live-pill">Southampton & Hampshire · live now</div>
          <h1 className="display h1-home">
            Somewhere
            <br />
            near you,
            <span className="gradient-text wobble-word">something</span>
            <br />
            is about to start.
          </h1>
          <p className="hero-sub">
            Netball on a Tuesday. Boccia on a Saturday. Walking football at ten
            past ten. Alive Sport lists the real clubs and sessions happening
            around you — free to search, no account, no fuss.
          </p>
          <HomeSearch />
          <PopularChips />
        </div>
        <AthleteFigures />
      </section>

      <section className="skew-band stat-band">
        <div className="skew-inner">
          <div>
            <span className="stat-num" style={{ color: "#FF2FA7" }}>
              142
            </span>
            <span className="stat-label">
              clubs listed across Southampton & Hampshire
            </span>
          </div>
          <div>
            <span className="stat-num" style={{ color: "#3B96DC" }}>
              38
            </span>
            <span className="stat-label">free taster sessions this month</span>
          </div>
          <div>
            <span className="stat-num" style={{ color: "#FFC94D" }}>
              61
            </span>
            <span className="stat-label">
              marked accessible to wheelchair users
            </span>
          </div>
        </div>
      </section>

      <section className="section indent">
        <div className="eyebrow">Sport is for everyone</div>
        <h2 className="h2" style={{ maxWidth: "22ch" }}>
          Four groups who get left off the list. We put them first.
        </h2>
        <div className="group-grid">
          <article className="group-card" style={{ transform: "rotate(-1.4deg)", ["--tilt" as string]: "-1.4deg" }}>
            <GroupMark variant="children" />
            <h3>Children</h3>
            <p>
              Age-banded sessions, so you know a nine-year-old won&apos;t be put
              in with teenagers.
            </p>
          </article>
          <article
            className="group-card"
            style={{ transform: "translateY(20px) rotate(1.2deg)", ["--tilt" as string]: "1.2deg" }}
          >
            <GroupMark variant="women" />
            <h3>Women & girls</h3>
            <p>
              Beginner and women-only sessions flagged clearly, including who
              else usually turns up.
            </p>
          </article>
          <article
            className="group-card"
            style={{ transform: "translateY(6px) rotate(-0.8deg)", ["--tilt" as string]: "-0.8deg" }}
          >
            <GroupMark variant="disabled" />
            <h3>Disabled people</h3>
            <p>
              Step-free access, hoists, changing places and coach training —
              stated, not implied.
            </p>
          </article>
          <article
            className="group-card"
            style={{ transform: "translateY(26px) rotate(1.6deg)", ["--tilt" as string]: "1.6deg" }}
          >
            <GroupMark variant="older" />
            <h3>Older adults</h3>
            <p>
              Walking versions, daytime slots and sessions where a cup of tea is
              part of it.
            </p>
          </article>
        </div>
      </section>

      <section className="section-tight" id="this-week">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
            gap: 16,
          }}
        >
          <h2 className="h2 h2-sm" style={{ margin: 0 }}>
            On this week
          </h2>
          <Link href="/clubs" style={{ fontSize: 14, fontWeight: 600, color: "#3B96DC", textDecoration: "none" }}>
            See all 214 sessions →
          </Link>
        </div>
        <div className="session-grid">
          {featuredSessions.map((session) => (
            <Link key={session.slug} href={`/clubs/${session.slug}`} className="session-card">
              <PhotoSlot label="club photo 4:3" />
              <div className="card-body">
                <div className="meta-sun">{session.when}</div>
                <div className="card-title">{session.title}</div>
                <div className="card-meta">{session.meta}</div>
                <div className="tags">
                  {session.tags.map((tag) => (
                    <Tag key={tag.label} {...tag} />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="skew-band club-band" id="for-clubs">
        <div className="skew-inner">
          <div style={{ flex: 1.1 }}>
            <div className="eyebrow" style={{ color: "rgba(10,13,36,.6)" }}>
              For clubs & leisure centres
            </div>
            <h2 className="h2 h2-sm" style={{ color: "#0A0D24", marginBottom: 16, fontSize: 46 }}>
              Twenty minutes of a volunteer&apos;s evening. That&apos;s the whole setup.
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
              You add your sessions once, we keep them findable. No commission on
              anything you charge, no rewriting your website, no app for your
              members to download.
            </p>
            <Link href="/suggest" className="btn-navy">
              Start listing — see the 20-minute checklist
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
                <span style={{ fontWeight: 600 }}>~20 min</span>
              </div>
              <div className="price-row">
                <span style={{ color: "rgba(247,245,255,.75)" }}>Booking & payments</span>
                <span style={{ fontWeight: 600, color: "#FFC94D" }}>Not built yet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section indent" id="honesty">
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="eyebrow" style={{ color: "#FFC94D" }}>
              Being straight with you
            </div>
            <h2 className="h2" style={{ fontSize: 36, marginBottom: 14 }}>
              What isn&apos;t finished yet
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.6,
                color: "rgba(247,245,255,.7)",
                maxWidth: "44ch",
              }}
            >
              We&apos;d rather you knew now than found out on a Tuesday night in
              a cold sports hall.
            </p>
          </div>
          <div style={{ flex: 1.3, display: "flex", flexDirection: "column", gap: 10, minWidth: 280 }}>
            <div className="honesty-row">
              <span className="status" style={{ color: "#FFC94D" }}>
                IN PROGRESS
              </span>
              <span style={{ fontSize: 14, color: "rgba(247,245,255,.82)" }}>
                Coverage outside Southampton is patchy — Winchester and Portsmouth are thin.
              </span>
            </div>
            <div className="honesty-row">
              <span className="status" style={{ color: "#FF2FA7" }}>
                NOT YET
              </span>
              <span style={{ fontSize: 14, color: "rgba(247,245,255,.82)" }}>
                You can&apos;t book or pay through us. Every listing sends you straight to the club.
              </span>
            </div>
            <div className="honesty-row">
              <span className="status" style={{ color: "#3B96DC" }}>
                CHECKING
              </span>
              <span style={{ fontSize: 14, color: "rgba(247,245,255,.82)" }}>
                Accessibility details are club-reported. We&apos;re verifying the first 60 in person.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
