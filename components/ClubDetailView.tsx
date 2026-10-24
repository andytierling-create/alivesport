"use client";

import Link from "next/link";
import { AccessTag, PhotoSlot, Tag } from "@/components/Media";
import { useDemo } from "@/components/DemoProvider";
import {
  accessFlagLabel,
  ageBandLabel,
  genderLabel,
  type Club,
} from "@/data/clubs";
import { isDemoEnabled } from "@/lib/demo-flag";
import { findMergedClub } from "@/lib/demo-store";

export function ClubDetailView({
  slug,
  initialClub,
  backHref = "/clubs",
}: {
  slug: string;
  initialClub: Club | null;
  backHref?: string;
}) {
  const { state } = useDemo();
  const club =
    (isDemoEnabled() ? findMergedClub(slug, undefined, state) : null) ?? initialClub;

  if (!club) {
    return (
      <div className="page-shell">
        <article className="indent detail-panel" style={{ paddingTop: 64, paddingBottom: 96 }}>
          <Link href={backHref} style={{ color: "#3B96DC", fontWeight: 600, textDecoration: "none" }}>
            ← Back to results
          </Link>
          <h1 className="display h1-clubs" style={{ marginTop: 28 }}>
            That listing isn&apos;t in this browser.
          </h1>
          <p className="hero-sub">
            Demo clubs live in local storage. Reset the demo from the yellow
            ribbon, or list a club from the desk.
          </p>
        </article>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <article className="indent detail-panel" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <Link href={backHref} style={{ color: "#3B96DC", fontWeight: 600, textDecoration: "none" }}>
          ← Back to results
        </Link>
        <div className="eyebrow" style={{ marginTop: 28 }}>
          {club.sport}
        </div>
        <h1 className="display h1-clubs">{club.name}</h1>
        <p className="hero-sub" style={{ marginTop: 16 }}>
          {club.venue} · {club.distanceMiles} miles from SO14
        </p>
        <PhotoSlot label="club photo 4:3" ratio="4 / 3" src={club.photo} />

        <dl className="listing-facts">
          <div>
            <dt>Age bands</dt>
            <dd>{club.ageBands.map(ageBandLabel).join(", ")}</dd>
          </div>
          <div>
            <dt>Who it&apos;s for</dt>
            <dd>{genderLabel(club.gender)}</dd>
          </div>
          <div>
            <dt>Accessible</dt>
            <dd>{club.accessible ? "Yes" : "No"}</dd>
          </div>
        </dl>

        <div className="tags" style={{ marginTop: 20 }}>
          {club.tags.map((tag) => (
            <Tag key={tag.label} {...tag} />
          ))}
          {club.accessFlags
            .filter(
              (flag) =>
                !club.tags.some(
                  (tag) => tag.label.toLowerCase() === accessFlagLabel(flag).toLowerCase(),
                ),
            )
            .map((flag) => (
              <Tag key={flag} label={accessFlagLabel(flag)} tone="sun" />
            ))}
          <AccessTag verified={club.accessVerified} />
        </div>

        <h2 className="display" style={{ fontSize: 28, margin: "40px 0 16px" }}>
          Sessions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {club.sessions.map((session) => (
            <div
              className="honesty-row"
              key={`${session.title ?? ""}-${session.day}-${session.time}`}
            >
              <span className="status" style={{ color: "#FFC94D", width: 110 }}>
                {session.day.toUpperCase()}
              </span>
              <span>
                {session.title ? `${session.title} · ` : ""}
                {session.time} · {session.price}
                {session.demo ? " · posted from the club desk" : ""}
              </span>
            </div>
          ))}
        </div>

        <h2 className="display" style={{ fontSize: 28, margin: "40px 0 8px" }}>
          Contact the club
        </h2>
        <p style={{ color: "rgba(247,245,255,.7)", maxWidth: "46ch" }}>
          There is no booking through Alive Sport. Phone, email or visit their
          site and they will tell you how to turn up.
        </p>
        <div className="contact-list">
          <a href={`tel:${club.phone.replace(/\s/g, "")}`}>{club.phone}</a>
          <a href={`mailto:${club.email}`}>{club.email}</a>
          <a href={club.website} rel="noreferrer">
            Club website
          </a>
        </div>
        {state.lastNotice && club.sessions.some((session) => session.demo) ? (
          <p className="notify-note" style={{ marginTop: 28 }}>
            {state.lastNotice}
          </p>
        ) : null}
      </article>
    </div>
  );
}
