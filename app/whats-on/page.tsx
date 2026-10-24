import type { Metadata } from "next";
import Link from "next/link";
import { PhotoSlot, Tag } from "@/components/Media";
import { clubs } from "@/data/clubs";
import { wellness } from "@/data/wellness";
import { upcomingSessions } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "What's on",
};

export default function WhatsOnPage() {
  const sessions = upcomingSessions([
    ...clubs.map((listing) => ({ listing, kind: "club" as const })),
    ...wellness.map((listing) => ({ listing, kind: "wellness" as const })),
  ]);

  return (
    <div className="page-shell">
      <section className="indent" style={{ paddingTop: 74, paddingBottom: 96 }}>
        <div className="eyebrow">This week</div>
        <h1 className="display h1-clubs">What&apos;s on near SO14</h1>
        <p className="hero-sub">
          {sessions.length} sessions from the sample clubs and wellness
          listings. Open a row for ages, access notes and how to contact them.
        </p>
        <div className="event-sheet" style={{ maxWidth: 840 }}>
          {sessions.map((session) => (
            <Link key={session.key} href={session.href} className="event-row whats-on-row">
              <PhotoSlot
                label="session photo"
                className="result-thumb"
                src={session.photo}
              />
              <div>
                <div className="display" style={{ fontSize: 22 }}>
                  {session.title}
                </div>
                <p>
                  {session.listingName} · {session.venue}
                  <br />
                  {session.day} · {session.time} · {session.price}
                </p>
              </div>
              <Tag label={session.day} tone="sun" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
