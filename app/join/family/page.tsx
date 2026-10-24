"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";

type Peek = { email: string; needsAccount: boolean };

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

function JoinFamilyForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { adult, signOut } = useDemo();
  const [peek, setPeek] = useState<Peek | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    void fetch(`/api/family/accept?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    })
      .then((response) => readJson<Peek>(response))
      .then(setPeek)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "That invite is not valid.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function accept(extra: { displayName?: string; password?: string } = {}) {
    await readJson(
      await fetch("/api/family/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...extra }),
      }),
    );
    window.location.assign("/play");
  }

  const otherSession = Boolean(
    adult && peek && adult.email !== peek.email,
  );

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 640 }}>
        <div className="eyebrow">Join a family</div>
        <h1 className="display h1-clubs">Accept this family invite.</h1>
        <p className="hero-sub">
          Two adults can share searches. Child slots are age band and gender
          only — this page does not collect a child&apos;s name or date of
          birth.
        </p>
        {loading ? <p className="notify-note">Checking the invite…</p> : null}
        {!token ? (
          <p className="form-error">This link is missing an invite token.</p>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
        {peek && otherSession ? (
          <>
            <p className="notify-note">
              You&apos;re signed in as {adult?.email}. This invite is for{" "}
              {peek.email}. Sign out, then accept.
            </p>
            <button
              type="button"
              className="btn-navy"
              onClick={() => {
                void signOut();
              }}
            >
              Sign out
            </button>
          </>
        ) : null}
        {peek && !otherSession && peek.needsAccount ? (
          <form
            className="desk-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void accept({
                displayName: String(form.get("name")),
                password: String(form.get("password")),
              }).catch((err) => {
                setError(err instanceof Error ? err.message : "Could not join.");
              });
            }}
          >
            <label className="search-field">
              <span className="field-label">Email</span>
              <input type="email" value={peek.email} readOnly />
            </label>
            <label className="search-field">
              <span className="field-label">Your name</span>
              <input name="name" required placeholder="Jordan Lee" />
            </label>
            <label className="search-field">
              <span className="field-label">Password</span>
              <input name="password" type="password" required minLength={3} />
            </label>
            <button className="btn-gradient" type="submit">
              Create account and join
            </button>
          </form>
        ) : null}
        {peek && !otherSession && !peek.needsAccount ? (
          <form
            className="desk-form"
            onSubmit={(event) => {
              event.preventDefault();
              void accept().catch((err) => {
                setError(err instanceof Error ? err.message : "Could not join.");
              });
            }}
          >
            <label className="search-field">
              <span className="field-label">Email</span>
              <input type="email" name="email" value={peek.email} readOnly />
            </label>
            <button className="btn-gradient" type="submit">
              Accept invite
            </button>
          </form>
        ) : null}
        <p className="notify-note" style={{ marginTop: 22 }}>
          Wrong door? <Link href="/sign-in">Sign in</Link>
        </p>
      </section>
    </div>
  );
}

export default function JoinFamilyPage() {
  return (
    <Suspense fallback={<div className="page-shell" />}>
      <JoinFamilyForm />
    </Suspense>
  );
}
