"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS } from "@/data/clubs";
import { DEMO_ORG } from "@/lib/platform/types";

function defaultStartsAt() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(18, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EmbedPage() {
  const { org, refresh } = useDemo();
  const apiKey = org?.apiKey ?? DEMO_ORG.apiKey;
  const [result, setResult] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const snippet = useMemo(
    () => `<script>
  window.AliveSport = {
    endpoint: "${origin || "https://your-site.example"}/api/events",
    key: "${apiKey}",
    postEvent(event) {
      return fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.key
        },
        body: JSON.stringify(event)
      });
    }
  };
</script>`,
    [apiKey, origin],
  );

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 760 }}>
        <div className="eyebrow">JS snippet</div>
        <h1 className="display h1-clubs">Put this on your site.</h1>
        <p className="hero-sub">
          Same JSON the club desk posts. A future WordPress plugin is this HTTP
          call, not a second data model. The key stays on your origin — this
          playground is demo-only.
        </p>
        <pre className="embed-snippet">{snippet}</pre>
        <p className="notify-note">
          Using {org ? `${org.name}'s` : "Bitterne's seeded"} API key.
          Sign in on the desk to post as your own club.
        </p>

        <h2 className="display desk-heading">Try it</h2>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const body = {
              title: String(form.get("title")),
              startsAt: new Date(String(form.get("startsAt"))).toISOString(),
              price: String(form.get("price")),
              ageBands: [String(form.get("age"))],
              gender: String(form.get("gender")),
              accessible: form.get("accessible") === "yes",
              notes: String(form.get("notes") || ""),
              publishOnAliveSport: form.get("publish") === "yes",
            };
            void fetch("/api/events", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${String(form.get("apiKey"))}`,
              },
              body: JSON.stringify(body),
            })
              .then(async (response) => {
                const data = await response.json();
                if (!response.ok) {
                  throw new Error(data.error || `HTTP ${response.status}`);
                }
                setResult(`Posted ${data.event.title}. Refresh Find a club to see it.`);
                await refresh();
              })
              .catch((err) => {
                setResult(err instanceof Error ? err.message : "Could not post.");
              });
          }}
        >
          <label className="search-field" style={{ gridColumn: "1 / -1" }}>
            <span className="field-label">API key</span>
            <input name="apiKey" defaultValue={apiKey} required />
          </label>
          <label className="search-field">
            <span className="field-label">Event title</span>
            <input name="title" required defaultValue="Embed playground social" />
          </label>
          <label className="search-field">
            <span className="field-label">Starts</span>
            <input name="startsAt" type="datetime-local" required defaultValue={defaultStartsAt()} />
          </label>
          <label className="search-field">
            <span className="field-label">Price</span>
            <input name="price" required defaultValue="£4" />
          </label>
          <label className="search-field">
            <span className="field-label">Age band</span>
            <select name="age" defaultValue="10-18">
              {AGE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Who it&apos;s for</span>
            <select name="gender" defaultValue="women">
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Accessible</span>
            <select name="accessible" defaultValue="yes">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Notes</span>
            <input name="notes" placeholder="Posted from the snippet" />
          </label>
          <label className="check-row">
            <input name="publish" type="checkbox" value="yes" defaultChecked />
            Publish on Alive Sport
          </label>
          <button className="btn-gradient" type="submit">
            POST /api/events
          </button>
        </form>
        {result ? <aside className="demo-notice">{result}</aside> : null}
      </section>
    </div>
  );
}
