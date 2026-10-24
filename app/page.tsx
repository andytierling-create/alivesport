import Link from "next/link";
import { AthleteFigures, GroupMark } from "@/components/AthleteFigures";
import { HomeSearch, PopularChips } from "@/components/HomeSearch";
import { PhotoSlot, Tag } from "@/components/Media";
import { clubs, featuredSessions, getClub } from "@/data/clubs";
import {
  CLUB_SETUP_COPY,
  GROUP_CARDS,
  GROUPS_HEADING,
  HERO_HEADERS,
  MISSION_STATEMENT,
  TWO_SIDED_PURPOSE,
  USER_NOTIFICATIONS_NOTE,
  WHY_SPORT_MATTERS,
} from "@/data/copy";
import { listingInventory } from "@/lib/catalog";

const inventory = listingInventory(clubs);

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="glow-pink" />
      <div className="glow-blue" />

      <section className="hero-home">
        <div className="hero-copy">
          <div className="live-pill">Southampton & Hampshire · live now</div>
          <div className="hero-headers" aria-label={HERO_HEADERS.join(". ")}>
            {HERO_HEADERS.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <h1 className="display h1-home">
            Somewhere
            <br />
            near you,
            <span className="gradient-text wobble-word">something</span>
            <br />
            is about to start.
          </h1>
          <p className="mission-statement">{MISSION_STATEMENT}</p>
          <p className="two-sided-purpose">{TWO_SIDED_PURPOSE}</p>
          <p className="hero-sub">
            Netball on a Tuesday. Boccia on a Saturday. Walking football at ten
            past ten. Free to search, no account, no fuss.
          </p>
          <HomeSearch />
          <p className="notify-note">{USER_NOTIFICATIONS_NOTE}</p>
          <PopularChips />
        </div>
        <AthleteFigures />
      </section>

      <section className="section indent why-sport-section">
        <div className="why-sport">
          <div>
            <div className="eyebrow">Why sport matters</div>
            <h2 className="h2 h2-sm" style={{ marginBottom: 18 }}>
              A weekly session is more than the hour you spend there.
            </h2>
            {WHY_SPORT_MATTERS.map((sentence) => (
              <p key={sentence} className="why-sport-copy">
                {sentence}
              </p>
            ))}
          </div>
          <PhotoSlot
            label="photo — people playing, various sports (step 16)"
            className="why-sport-photo"
            ratio="4 / 3"
          />
        </div>
      </section>

      <section className="skew-band stat-band">
        <div className="skew-inner">
          <div>
            <span className="stat-num" style={{ color: "#FF2FA7" }}>
              {inventory.listed}
            </span>
            <span className="stat-label">
              sample clubs listed across Southampton & Hampshire
            </span>
          </div>
          <div>
            <span className="stat-num" style={{ color: "#3B96DC" }}>
              {inventory.freeTasters}
            </span>
            <span className="stat-label">sample listings with a free taster</span>
          </div>
          <div>
            <span className="stat-num" style={{ color: "#FFC94D" }}>
              {inventory.accessible}
            </span>
            <span className="stat-label">
              sample listings marked accessible
            </span>
          </div>
        </div>
      </section>

      <section className="section indent">
        <div className="eyebrow">Sport is for everyone</div>
        <h2 className="h2" style={{ maxWidth: "18ch" }}>
          {GROUPS_HEADING}
        </h2>
        <div className="group-grid">
          {GROUP_CARDS.map((card) => (
            <article
              key={card.title}
              className="group-card"
              style={{ transform: `rotate(${card.tilt})`, ["--tilt" as string]: card.tilt }}
            >
              <GroupMark variant={card.variant} />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <p className="group-benefit">{card.benefit}</p>
            </article>
          ))}
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
          <Link href="/whats-on" style={{ fontSize: 14, fontWeight: 600, color: "#3B96DC", textDecoration: "none" }}>
            See all {inventory.sessions} club sessions →
          </Link>
        </div>
        <div className="session-grid">
          {featuredSessions.map((session) => (
            <Link key={session.slug} href={`/clubs/${session.slug}`} className="session-card">
              <PhotoSlot
                label="club photo 4:3"
                src={getClub(session.slug)?.photo}
              />
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
              Get found by people who are already looking.
            </h2>
            <div className="club-benefits">
              <p>
                <strong>A proper club profile.</strong> Your sessions, ages,
                access notes and how to join — findable by people searching near
                you, not only by those who already know your name.
              </p>
              <p>
                <strong>Reach beyond Facebook.</strong> Tell people in your area
                about events and news, instead of relying on a page that only
                reaches people who already follow you, or on word of mouth.
              </p>
            </div>
            <p className="club-setup">{CLUB_SETUP_COPY}</p>
            <Link href="/for-clubs" className="btn-navy">
              See how listing works
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
