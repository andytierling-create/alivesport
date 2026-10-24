"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS, ageBandLabel, genderLabel } from "@/data/clubs";
import { formatEventWhen } from "@/lib/platform/dates";

function defaultStartsAt() {
  const date = new Date();
  const diff = (6 - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  date.setHours(10, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function DeskPage() {
  const { role, org, orgEvents, saveOrg, addEvent, removeEvent, signInDemo, lastNotice } =
    useDemo();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (role !== "org" || !org) {
    return (
      <div className="page-shell">
        <DemoBanner />
        <section className="indent account-hero" style={{ maxWidth: 640 }}>
          <div className="eyebrow">Club desk</div>
          <h1 className="display h1-clubs">Sign in as a club to post events.</h1>
          <p className="hero-sub">
            Bitterne Netball already has a Friday floodlit social. Open that
            desk, or register a new listing.
          </p>
          <div className="demo-shortcuts">
            <button
              type="button"
              className="btn-sun"
              onClick={() => {
                void signInDemo("org").then(() => window.location.assign("/desk"));
              }}
            >
              Continue as Bitterne Netball
            </button>
            <Link href="/join/club" className="btn-navy">
              Register a club
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
        <div className="eyebrow">Club desk</div>
        <h1 className="display h1-clubs">{org.name}</h1>
        <p className="hero-sub">
          Post a dated event. Tick publish if it should appear on Find a club,
          What&apos;s on, and Play. Nothing is emailed from this demo.
        </p>
        {lastNotice ? <aside className="demo-notice">{lastNotice}</aside> : null}
        <p className="notify-note">
          Public page:{" "}
          <Link href={`/clubs/${org.slug}`} style={{ color: "#FFC94D", fontWeight: 600 }}>
            /clubs/{org.slug}
          </Link>
          {" · "}
          <Link href="/embed" style={{ color: "#3B96DC", fontWeight: 600 }}>
            JS snippet
          </Link>
        </p>

        <h2 className="display desk-heading">Packages</h2>
        <div className="sku-grid">
          <label className="sku-card">
            <input
              type="checkbox"
              checked={org.subscription.listing}
              onChange={(event) => {
                void saveOrg({
                  subscription: { listing: event.target.checked },
                });
              }}
            />
            <div>
              <strong>Listing</strong>
              <p>Required to post. A new club starts with this on.</p>
            </div>
          </label>
          <label className="sku-card">
            <input
              type="checkbox"
              checked={org.subscription.notifyArea}
              onChange={(event) => {
                void saveOrg({
                  subscription: { notifyArea: event.target.checked },
                });
              }}
            />
            <div>
              <strong>Notify area</strong>
              <p>Add-on. Preview who would be told — we do not send.</p>
            </div>
          </label>
        </div>
        {!org.subscription.listing ? (
          <p className="form-error">Listing is off. Posting will return 402 until you turn it on.</p>
        ) : null}

        <h2 className="display desk-heading">Listing</h2>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void saveOrg({
              name: String(form.get("name")),
              sport: String(form.get("sport")),
              venue: String(form.get("venue")),
              contact: {
                phone: String(form.get("phone")),
                email: String(form.get("email")),
              },
              ageBands: [
                String(form.get("age")) as never,
                ...org.ageBands.filter((band) => band !== String(form.get("age"))),
              ],
              gender: String(form.get("gender")) as never,
              accessible: form.get("accessible") === "yes",
            }).then(() => setSaved(true));
          }}
        >
          <label className="search-field">
            <span className="field-label">Club name</span>
            <input name="name" defaultValue={org.name} required />
          </label>
          <label className="search-field">
            <span className="field-label">Sport</span>
            <input name="sport" defaultValue={org.sport} required />
          </label>
          <label className="search-field">
            <span className="field-label">Venue</span>
            <input name="venue" defaultValue={org.venue} required />
          </label>
          <label className="search-field">
            <span className="field-label">Phone</span>
            <input name="phone" defaultValue={org.contact.phone} />
          </label>
          <label className="search-field">
            <span className="field-label">Email</span>
            <input name="email" type="email" defaultValue={org.contact.email} />
          </label>
          <label className="search-field">
            <span className="field-label">Main age band</span>
            <select name="age" defaultValue={org.ageBands[0] ?? "adult"}>
              {AGE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Who it&apos;s for</span>
            <select name="gender" defaultValue={org.gender}>
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Accessible</span>
            <select name="accessible" defaultValue={org.accessible ? "yes" : "no"}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <button className="btn-gradient" type="submit">
            {saved ? "Listing saved" : "Save listing"}
          </button>
        </form>

        <h2 className="display desk-heading">Events</h2>
        <div className="event-sheet">
          {orgEvents.length === 0 ? (
            <p className="notify-note">No events yet. Add one below.</p>
          ) : (
            orgEvents.map((item) => {
              const when = formatEventWhen(item.startsAt);
              return (
                <article key={item.id} className="event-row">
                  <div>
                    <div className="display" style={{ fontSize: 22 }}>
                      {item.title}
                    </div>
                    <p>
                      {when.label} · {item.price}
                      <br />
                      {item.ageBands.map(ageBandLabel).join(", ")} · {genderLabel(item.gender)}
                      {item.accessible ? " · Accessible" : ""}
                      <br />
                      {item.publishOnAliveSport ? "Published on Alive Sport" : "Club only — hidden from search"}
                      {` · ${item.source}`}
                    </p>
                    {item.notes ? <p className="event-notes">{item.notes}</p> : null}
                  </div>
                  <button
                    type="button"
                    className="event-remove"
                    onClick={() => {
                      void removeEvent(item.id);
                    }}
                  >
                    Take down
                  </button>
                </article>
              );
            })
          )}
        </div>

        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            const form = new FormData(event.currentTarget);
            const startsAt = new Date(String(form.get("startsAt"))).toISOString();
            void addEvent({
              title: String(form.get("title")),
              startsAt,
              price: String(form.get("price")),
              ageBands: [String(form.get("age")) as never],
              gender: String(form.get("gender")) as never,
              accessible: form.get("accessible") === "yes",
              notes: String(form.get("notes") || ""),
              publishOnAliveSport: form.get("publish") === "yes",
            })
              .then(() => {
                event.currentTarget.reset();
              })
              .catch((err) => {
                setError(err instanceof Error ? err.message : "Could not post.");
              });
          }}
        >
          <label className="search-field">
            <span className="field-label">Event title</span>
            <input name="title" required placeholder="Saturday beginners" />
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
            <select name="gender" defaultValue={org.gender}>
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Accessible</span>
            <select name="accessible" defaultValue={org.accessible ? "yes" : "no"}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="search-field" style={{ gridColumn: "1 / -1" }}>
            <span className="field-label">Notes</span>
            <input name="notes" placeholder="Beginners welcome" />
          </label>
          <label className="check-row">
            <input name="publish" type="checkbox" value="yes" defaultChecked />
            Publish on Alive Sport
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn-gradient" type="submit">
            Post event
          </button>
        </form>
      </section>
    </div>
  );
}
