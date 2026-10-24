"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubsExplorer } from "@/components/ClubsExplorer";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS } from "@/data/clubs";

export function PlayClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { account, player, savePlayer, signInDemo, state } = useDemo();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!player || searchParams.toString()) return;
    const params = new URLSearchParams();
    params.set("postcode", player.postcode);
    if (player.ageBand !== "any") params.set("age", player.ageBand);
    if (player.gender !== "any") params.set("gender", player.gender);
    if (player.accessible) params.set("accessible", "yes");
    router.replace(`/play?${params.toString()}`, { scroll: false });
  }, [player, router, searchParams]);

  if (!account || account.role !== "player" || !player) {
    return (
      <div className="page-shell">
        <DemoBanner />
        <section className="indent account-hero" style={{ maxWidth: 640 }}>
          <div className="eyebrow">Player</div>
          <h1 className="display h1-clubs">Sign in as someone looking for play.</h1>
          <p className="hero-sub">
            Walk in as Alex, or make a player profile. Clubs posting events
            land in the same search.
          </p>
          <div className="demo-shortcuts">
            <Link
              href="/play"
              className="btn-sun"
              onClick={() => signInDemo("player")}
            >
              Continue as Alex
            </Link>
            <Link href="/join/play" className="btn-navy">
              Make a player profile
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero">
        <div className="eyebrow">Looking for play</div>
        <h1 className="display h1-clubs">Hi {player.displayName.split(" ")[0]}.</h1>
        <p className="hero-sub">
          Your filters sit on the same list clubs write into. Change them,
          search, then open a listing — including anything posted from a club
          desk in this browser.
        </p>
        {player.notifyOptIn && state.lastNotice ? (
          <aside className="demo-notice">{state.lastNotice}</aside>
        ) : player.notifyOptIn ? (
          <p className="notify-note">
            You&apos;re opted in. If a club posts an event here, we&apos;d ask
            before sending — and this box would light up.
          </p>
        ) : (
          <p className="notify-note">
            Notifications are off. Turn them on in the profile if you want the
            mock inbox.
          </p>
        )}
        <form
          className="desk-form play-profile"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            savePlayer({
              displayName: String(form.get("name")),
              postcode: String(form.get("postcode") || "SO14 3ZE"),
              ageBand: String(form.get("age")) as never,
              gender: String(form.get("gender")) as never,
              accessible: form.get("accessible") === "yes",
              notifyOptIn: form.get("notify") === "yes",
            });
            setSaved(true);
          }}
        >
          <label className="search-field">
            <span className="field-label">Name</span>
            <input name="name" defaultValue={player.displayName} required />
          </label>
          <label className="search-field">
            <span className="field-label">Postcode</span>
            <input name="postcode" defaultValue={player.postcode} />
          </label>
          <label className="search-field">
            <span className="field-label">Age band</span>
            <select name="age" defaultValue={player.ageBand}>
              <option value="any">Anyone</option>
              {AGE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Sessions for</span>
            <select name="gender" defaultValue={player.gender}>
              <option value="any">No preference</option>
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Accessible</span>
            <select name="accessible" defaultValue={player.accessible ? "yes" : "no"}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Nearby events</span>
            <select name="notify" defaultValue={player.notifyOptIn ? "yes" : "no"}>
              <option value="yes">Ask me, then tell me</option>
              <option value="no">Not now</option>
            </select>
          </label>
          <button className="btn-gradient" type="submit">
            {saved ? "Saved" : "Update profile"}
          </button>
        </form>
      </section>
      <SuspenseFallbackExplorer />
    </div>
  );
}

function SuspenseFallbackExplorer() {
  return <ClubsExplorer heading="Sessions near" noun="club" />;
}
