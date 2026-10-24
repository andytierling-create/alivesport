"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS, type AgeBand } from "@/data/clubs";

export default function JoinPlayPage() {
  const { registerAdult, signInDemo } = useDemo();
  const [error, setError] = useState("");

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 640 }}>
        <div className="eyebrow">Adult account</div>
        <h1 className="display h1-clubs">Tell us who you&apos;re finding play for.</h1>
        <p className="hero-sub">
          Search bands are who the sessions are for, not a child profile. We
          do not store children&apos;s names, dates of birth, or schools.
        </p>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const age = String(form.get("age"));
            void registerAdult({
              email: String(form.get("email")),
              password: String(form.get("password")),
              displayName: String(form.get("name")),
              postcode: String(form.get("postcode") || "SO14 3ZE"),
              lookingForAgeBands: age === "any" ? [] : [age as AgeBand],
              gender: String(form.get("gender")) as never,
              accessible: form.get("accessible") === "yes",
              notifyOptIn: form.get("notify") === "yes",
            })
              .then(() => window.location.assign("/play"))
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Could not register.");
              });
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
            <span className="field-label">Looking for ages</span>
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
            Save adult account
          </button>
        </form>
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
          <Link href="/sign-in" style={{ color: "#3B96DC", fontWeight: 600 }}>
            I already have a demo login
          </Link>
        </div>
      </section>
    </div>
  );
}
