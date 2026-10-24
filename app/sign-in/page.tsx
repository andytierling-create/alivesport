"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { isDemoEnabled } from "@/lib/demo-flag";
import { DEMO_ADULT, DEMO_ORG } from "@/lib/platform/types";

export default function SignInPage() {
  const { signIn, signInDemo } = useDemo();
  const [error, setError] = useState("");
  const demo = isDemoEnabled();

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 560 }}>
        <div className="eyebrow">Sign in</div>
        <h1 className="display h1-clubs">Same site. Two keys.</h1>
        <p className="hero-sub">
          Seeded logins hit the local API and set a session cookie. Or use an
          account you registered here.
        </p>
        {demo ? (
          <>
            <div className="demo-shortcuts" style={{ marginBottom: 28 }}>
              <button
                type="button"
                className="btn-sun"
                onClick={() => {
                  void signInDemo("adult").then(() => window.location.assign("/play"));
                }}
              >
                Alex · looking for play
              </button>
              <button
                type="button"
                className="btn-navy"
                onClick={() => {
                  void signInDemo("org").then(() => window.location.assign("/desk"));
                }}
              >
                Bitterne Netball · club desk
              </button>
            </div>
            <p className="notify-note">
              {DEMO_ADULT.email} / {DEMO_ADULT.password} · {DEMO_ORG.email} /{" "}
              {DEMO_ORG.password}
            </p>
          </>
        ) : null}
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void signIn(String(form.get("email")), String(form.get("password")))
              .then((role) => window.location.assign(role === "org" ? "/desk" : "/play"))
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Could not sign in.");
              });
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
