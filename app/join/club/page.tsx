"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS, type AgeBand, type Gender } from "@/data/clubs";

export default function JoinClubPage() {
  const { registerClub, signInDemo } = useDemo();
  const [error, setError] = useState("");

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 640 }}>
        <div className="eyebrow">Club</div>
        <h1 className="display h1-clubs">Put the club where people can find it.</h1>
        <p className="hero-sub">
          Ten minutes of form, then events. Or open the seeded Bitterne desk
          and add a session to a listing that already exists.
        </p>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              registerClub(String(form.get("email")), String(form.get("password")), {
                name: String(form.get("name")),
                sport: String(form.get("sport")),
                venue: String(form.get("venue")),
                phone: String(form.get("phone") || "023 0000 0000"),
                email: String(form.get("clubEmail") || form.get("email")),
                website: "https://example.com/club",
                ageBands: [String(form.get("age")) as AgeBand],
                gender: String(form.get("gender")) as Gender,
                accessible: form.get("accessible") === "yes",
                lat: 50.9097,
                lng: -1.4044,
                distanceMiles: 1.8,
              });
              window.location.assign("/desk");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not register.");
            }
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
            <input name="venue" required placeholder="Portswood Rec" />
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
          <Link
            href="/desk"
            className="btn-sun"
            onClick={() => signInDemo("club")}
          >
            Continue as Bitterne Netball
          </Link>
          <Link href="/sign-in" style={{ color: "#3B96DC", fontWeight: 600 }}>
            I already have a demo login
          </Link>
        </div>
      </section>
    </div>
  );
}
