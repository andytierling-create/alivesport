"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS } from "@/data/clubs";

export default function JoinPlayPage() {
  const { registerPlayer, signInDemo } = useDemo();
  const [error, setError] = useState("");

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 640 }}>
        <div className="eyebrow">Player</div>
        <h1 className="display h1-clubs">Tell us who you&apos;re finding play for.</h1>
        <p className="hero-sub">
          This stays in your browser. Use a made-up email. Or skip the form and
          walk in as Alex.
        </p>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              registerPlayer(String(form.get("email")), String(form.get("password")), {
                displayName: String(form.get("name")),
                postcode: String(form.get("postcode") || "SO14 3ZE"),
                ageBand: String(form.get("age")) as never,
                gender: String(form.get("gender")) as never,
                accessible: form.get("accessible") === "yes",
                notifyOptIn: form.get("notify") === "yes",
              });
              window.location.assign("/play");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not register.");
            }
          }}
        >
          <label className="search-field">
            <span className="field-label">Your name</span>
            <input name="name" required placeholder="Alex Rivers" />
          </label>
          <label className="search-field">
            <span className="field-label">Email</span>
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label className="search-field">
            <span className="field-label">Password</span>
            <input name="password" type="password" required minLength={3} />
          </label>
          <label className="search-field">
            <span className="field-label">Postcode</span>
            <input name="postcode" defaultValue="SO14 3ZE" />
          </label>
          <label className="search-field">
            <span className="field-label">Age band</span>
            <select name="age" defaultValue="adult">
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
            <select name="gender" defaultValue="any">
              <option value="any">No preference</option>
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Need accessible listings?</span>
            <select name="accessible" defaultValue="no">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Hear about nearby events?</span>
            <select name="notify" defaultValue="yes">
              <option value="yes">Yes — ask me first, then tell me</option>
              <option value="no">Not now</option>
            </select>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn-gradient" type="submit">
            Save player profile
          </button>
        </form>
        <div className="demo-shortcuts">
          <Link
            href="/play"
            className="btn-sun"
            onClick={() => signInDemo("player")}
          >
            Continue as Alex
          </Link>
          <Link href="/sign-in" style={{ color: "#3B96DC", fontWeight: 600 }}>
            I already have a demo login
          </Link>
        </div>
      </section>
    </div>
  );
}
