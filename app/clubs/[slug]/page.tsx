import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessTag, PhotoSlot, Tag } from "@/components/Media";
import {
  accessFlagLabel,
  ageBandLabel,
  clubs,
  genderLabel,
  getClub,
} from "@/data/clubs";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return clubs.map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = getClub(slug);
  return { title: club?.name ?? "Club" };
}

export default async function ClubPage({ params }: Props) {
  const { slug } = await params;
  const club = getClub(slug);
  if (!club) notFound();

  return (
    <div className="page-shell">
      <article className="indent detail-panel" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <Link href="/clubs" style={{ color: "#3B96DC", fontWeight: 600, textDecoration: "none" }}>
          ← Back to results
        </Link>
        <div className="eyebrow" style={{ marginTop: 28 }}>
          {club.sport}
        </div>
        <h1 className="display h1-clubs">{club.name}</h1>
        <p className="hero-sub" style={{ marginTop: 16 }}>
          {club.venue} · {club.distanceMiles} miles from SO14
        </p>
        <PhotoSlot label="club photo 4:3" ratio="4 / 3" />

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
            <div className="honesty-row" key={`${session.day}-${session.time}`}>
              <span className="status" style={{ color: "#FFC94D", width: 110 }}>
                {session.day.toUpperCase()}
              </span>
              <span>
                {session.time} · {session.price}
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
      </article>
    </div>
  );
}
