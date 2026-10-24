"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { DEMO_CLUB, DEMO_PLAYER } from "@/lib/demo-store";

export default function SignInPage() {
  const { signIn, signInDemo } = useDemo();
  const [error, setError] = useState("");

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 560 }}>
        <div className="eyebrow">Sign in</div>
        <h1 className="display h1-clubs">Same site. Two keys.</h1>
        <p className="hero-sub">
          Seeded logins are ready. Or use an account you registered in this
          browser.
        </p>
        <div className="demo-shortcuts" style={{ marginBottom: 28 }}>
          <Link
            href="/play"
            className="btn-sun"
            onClick={() => signInDemo("player")}
          >
            Alex · looking for play
          </Link>
          <Link
            href="/desk"
            className="btn-navy"
            onClick={() => signInDemo("club")}
          >
            Bitterne Netball · club desk
          </Link>
        </div>
        <p className="notify-note">
          {DEMO_PLAYER.email} / {DEMO_PLAYER.password} · {DEMO_CLUB.email} /{" "}
          {DEMO_CLUB.password}
        </p>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              const role = signIn(String(form.get("email")), String(form.get("password")));
              window.location.assign(role === "club" ? "/desk" : "/play");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not sign in.");
            }
          }}
        >
          <label className="search-field">
            <span className="field-label">Email</span>
            <input name="email" type="email" required />
          </label>
          <label className="search-field">
            <span className="field-label">Password</span>
            <input name="password" type="password" required />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn-gradient" type="submit">
            Sign in
          </button>
        </form>
        <p className="notify-note" style={{ marginTop: 22 }}>
          New here? <Link href="/join">Choose player or club</Link>
        </p>
      </section>
    </div>
  );
}
