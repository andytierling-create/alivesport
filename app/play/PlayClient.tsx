"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClubsExplorer } from "@/components/ClubsExplorer";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { FamilyCard } from "@/components/FamilyCard";
import { AGE_BANDS, GENDERS, type AgeBand, type Gender } from "@/data/clubs";

function playSearchParams(
  adult: {
    postcode: string;
    lookingForAgeBands: AgeBand[];
    gender: Gender | "any";
    accessible: boolean;
  },
  current = "",
) {
  const params = new URLSearchParams(current);
  params.set("postcode", adult.postcode || "SO14 3ZE");
  const band = adult.lookingForAgeBands[0];
  if (band) params.set("age", band);
  else params.delete("age");
  if (adult.gender !== "any") params.set("gender", adult.gender);
  else params.delete("gender");
  if (adult.accessible) params.set("accessible", "yes");
  else params.delete("accessible");
  return params;
}

export function PlayClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, adult, saveAdult, signInDemo, lastNotice } = useDemo();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!adult || searchParams.toString()) return;
    router.replace(`/play?${playSearchParams(adult).toString()}`, { scroll: false });
  }, [adult, router, searchParams]);

  if (role !== "adult" || !adult) {
    return (
      <div className="page-shell">
        <DemoBanner />
        <section className="indent account-hero" style={{ maxWidth: 640 }}>
          <div className="eyebrow">Play</div>
          <h1 className="display h1-clubs">Sign in as someone looking for play.</h1>
          <p className="hero-sub">
            Walk in as Alex, or make an adult account. Search bands say who the
            sessions are for — not who lives in your house.
          </p>
          <div className="demo-shortcuts">
            <button
              type="button"
              className="btn-sun"
              onClick={() => {
                void signInDemo("adult").then(() => window.location.assign("/play"));
              }}
            >
              Continue as Alex
            </button>
            <a href="/join/play" className="btn-navy">
              Make an adult account
            </a>
          </div>
        </section>
      </div>
    );
  }

  const selectedBand = adult.lookingForAgeBands[0] ?? "any";

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero">
        <div className="eyebrow">Looking for play</div>
        <h1 className="display h1-clubs">Hi {adult.displayName.split(" ")[0]}.</h1>
        <p className="hero-sub">
          These filters are who the sessions are for, not a child profile.
          Alive Sport does not store children&apos;s details.
        </p>
        {adult.notifyOptIn && lastNotice ? (
          <aside className="demo-notice">{lastNotice}</aside>
        ) : adult.notifyOptIn ? (
          <p className="notify-note">
            You&apos;re opted in. No club with the notify add-on has posted in
            this demo yet — if they did, this box would light up. Nothing is
            emailed.
          </p>
        ) : (
          <p className="notify-note">
            Notifications are off. Turn them on if you want to see the preview
            count when a club posts.
          </p>
        )}
        <form
          className="desk-form play-profile"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const age = String(form.get("age"));
            const next = {
              displayName: String(form.get("name")),
              postcode: String(form.get("postcode") || "SO14 3ZE"),
              lookingForAgeBands: age === "any" ? [] : [age as AgeBand],
              gender: String(form.get("gender")) as Gender | "any",
              accessible: form.get("accessible") === "yes",
              notifyOptIn: form.get("notify") === "yes",
            };
            void saveAdult(next).then(() => {
              setSaved(true);
              router.replace(`/play?${playSearchParams(next, searchParams.toString())}`, {
                scroll: false,
              });
            });
          }}
        >
          <label className="search-field">
            <span className="field-label">Name</span>
            <input name="name" defaultValue={adult.displayName} required />
          </label>
          <label className="search-field">
            <span className="field-label">Postcode</span>
            <input name="postcode" defaultValue={adult.postcode} />
          </label>
          <label className="search-field">
            <span className="field-label">Looking for ages</span>
            <select name="age" defaultValue={selectedBand}>
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
            <select name="gender" defaultValue={adult.gender}>
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
            <select name="accessible" defaultValue={adult.accessible ? "yes" : "no"}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Nearby events</span>
            <select name="notify" defaultValue={adult.notifyOptIn ? "yes" : "no"}>
              <option value="yes">Ask me, then tell me</option>
              <option value="no">Not now</option>
            </select>
          </label>
          <button className="btn-gradient" type="submit">
            {saved ? "Saved" : "Update search prefs"}
          </button>
        </form>
      </section>
      <FamilyCard />
      <ClubsExplorer heading="Sessions near" noun="club" />
    </div>
  );
}
