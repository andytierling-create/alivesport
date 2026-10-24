"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS, type AgeBand, type Gender } from "@/data/clubs";

export default function JoinClubPage() {
  const { registerOrg, signInDemo } = useDemo();
  const [error, setError] = useState("");

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 640 }}>
        <div className="eyebrow">Club</div>
        <h1 className="display h1-clubs">Put the club where people can find it.</h1>
        <p className="hero-sub">
          This creates an organisation with the listing package on. The notify
          add-on stays off until you toggle it on the desk.
        </p>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void registerOrg({
              email: String(form.get("email")),
              password: String(form.get("password")),
              name: String(form.get("name")),
              sport: String(form.get("sport")),
              venue: String(form.get("venue")),
              postcode: String(form.get("postcode")),
              phone: String(form.get("phone") || ""),
              contactEmail: String(form.get("clubEmail") || form.get("email")),
              ageBands: [String(form.get("age")) as AgeBand],
              gender: String(form.get("gender")) as Gender,
              accessible: form.get("accessible") === "yes",
            })
              .then(() => window.location.assign("/desk"))
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Could not register.");
              });
          }}
        >
          <label className="search-field">
            <span className="field-label">Club name</span>
            <input name="name" required placeholder="Portswood Table Tennis" />
          </label>
          <label className="search-field">
            <span className="field-label">Sport</span>
            <input name="sport" required placeholder="Table tennis" />
          </label>
          <label className="search-field">
            <span className="field-label">Venue</span>
            <input name="venue" required placeholder="Bitterne Leisure Centre" />
          </label>
          <label className="search-field">
            <span className="field-label">Venue postcode</span>
            <input name="postcode" required placeholder="SO18 6AQ" />
          </label>
          <label className="search-field">
            <span className="field-label">Login email</span>
            <input name="email" type="email" required placeholder="coach@example.com" />
          </label>
          <label className="search-field">
            <span className="field-label">Password</span>
            <input name="password" type="password" required minLength={3} />
          </label>
          <label className="search-field">
            <span className="field-label">Club phone</span>
            <input name="phone" placeholder="023 8044 2100" />
          </label>
          <label className="search-field">
            <span className="field-label">Public club email</span>
            <input name="clubEmail" type="email" placeholder="hello@club.example" />
          </label>
          <label className="search-field">
            <span className="field-label">Main age band</span>
            <select name="age" defaultValue="adult">
              {AGE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Who it&apos;s for</span>
            <select name="gender" defaultValue="mixed">
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Accessible</span>
            <select name="accessible" defaultValue="no">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn-gradient" type="submit">
            Open the club desk
          </button>
        </form>
        <div className="demo-shortcuts">
          <button
            type="button"
            className="btn-sun"
            onClick={() => {
              void signInDemo("org").then(() => window.location.assign("/desk"));
            }}
          >
            Continue as Bitterne Leisure Centre
          </button>
          <Link href="/sign-in" style={{ color: "#3B96DC", fontWeight: 600 }}>
            I already have a demo login
          </Link>
        </div>
      </section>
    </div>
  );
}
