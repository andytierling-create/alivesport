"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccessTag, PhotoSlot, Tag } from "@/components/Media";
import { useDemo } from "@/components/DemoProvider";
import {
  accessFlagLabel,
  ageBandLabel,
  genderLabel,
  type Club,
} from "@/data/clubs";
import { findListing } from "@/lib/catalog";
import { isPlatformClientEnabled } from "@/lib/demo-flag";
import {
  formatMiles,
  withDistances,
  type GeoLocate,
} from "@/lib/platform/geo";
import { postcodeDistrict } from "@/lib/search";

export function ClubDetailView({
  slug,
  initialClub,
  backHref = "/clubs",
  fromPostcode = "SO14 3ZE",
}: {
  slug: string;
  initialClub: Club | null;
  backHref?: string;
  fromPostcode?: string;
}) {
  const { publishedEvents, publicOrgs, lastNotice } = useDemo();
  const [from, setFrom] = useState({
    miles: null as number | null,
    district: postcodeDistrict(fromPostcode),
  });
  const club =
    (isPlatformClientEnabled() ? findListing(slug, publishedEvents, publicOrgs) : null) ??
    initialClub;
  const clubLat = club?.lat;
  const clubLng = club?.lng;

  useEffect(() => {
    if (clubLat === undefined || clubLng === undefined) return;
    let cancelled = false;
    void fetch(`/api/geo?postcode=${encodeURIComponent(fromPostcode)}`)
      .then(async (response) => {
        const data = (await response.json()) as GeoLocate & { error?: string };
        if (!response.ok) throw new Error(data.error);
        return data;
      })
      .then((origin) => {
        if (cancelled) return;
        setFrom({
          miles: withDistances(
            [{ lat: clubLat, lng: clubLng, distanceMiles: 0 }],
            origin,
          )[0]?.distanceMiles ?? null,
          district: origin.district,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setFrom({ miles: null, district: postcodeDistrict(fromPostcode) });
      });
    return () => {
      cancelled = true;
    };
  }, [clubLat, clubLng, fromPostcode]);

  if (!club) {
    return (
      <div className="page-shell">
        <article className="indent detail-panel" style={{ paddingTop: 64, paddingBottom: 96 }}>
          <Link href={backHref} style={{ color: "#3B96DC", fontWeight: 600, textDecoration: "none" }}>
            ← Back to results
          </Link>
          <h1 className="display h1-clubs" style={{ marginTop: 28 }}>
            That listing isn&apos;t on Alive Sport.
          </h1>
          <p className="hero-sub">
            Reset the demo from the yellow ribbon, or list a club from the
            desk.
          </p>
        </article>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <article className="indent detail-panel" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <Link
          href={`${backHref}?postcode=${encodeURIComponent(fromPostcode)}`}
          style={{ color: "#3B96DC", fontWeight: 600, textDecoration: "none" }}
        >
          ← Back to results
        </Link>
        <div className="eyebrow" style={{ marginTop: 28 }}>
          {club.sport}
        </div>
        <h1 className="display h1-clubs">{club.name}</h1>
        <p className="hero-sub" style={{ marginTop: 16 }}>
          {club.venue}
          {from.miles !== null
            ? ` · ${formatMiles(from.miles)} from ${from.district}`
            : null}
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
          {club.phone ? (
            <a href={`tel:${club.phone.replace(/\s/g, "")}`}>{club.phone}</a>
          ) : null}
          {club.email ? <a href={`mailto:${club.email}`}>{club.email}</a> : null}
          {club.website ? (
            <a href={club.website} rel="noreferrer">
              Club or venue website
            </a>
          ) : null}
        </div>
        {lastNotice && club.sessions.some((session) => session.demo) ? (
          <p className="notify-note" style={{ marginTop: 28 }}>
            {lastNotice}
          </p>
        ) : null}
      </article>
    </div>
  );
}
