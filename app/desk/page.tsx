"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { useDemo } from "@/components/DemoProvider";
import { AGE_BANDS, GENDERS, ageBandLabel, genderLabel } from "@/data/clubs";

export default function DeskPage() {
  const { account, club, saveClubListing, addEvent, removeEvent, signInDemo, state } =
    useDemo();
  const [saved, setSaved] = useState(false);

  if (!account || account.role !== "club" || !club) {
    return (
      <div className="page-shell">
        <DemoBanner />
        <section className="indent account-hero" style={{ maxWidth: 640 }}>
          <div className="eyebrow">Club desk</div>
          <h1 className="display h1-clubs">Sign in as a club to post sessions.</h1>
          <p className="hero-sub">
            Bitterne Netball already has a Friday floodlit social. Open that
            desk, or register a new listing.
          </p>
          <div className="demo-shortcuts">
            <Link
              href="/desk"
              className="btn-sun"
              onClick={() => signInDemo("club")}
            >
              Continue as Bitterne Netball
            </Link>
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
        <h1 className="display h1-clubs">{club.listing.name}</h1>
        <p className="hero-sub">
          Edit the public listing, then pin a session to the sheet. Players
          searching in this browser will see it.
        </p>
        {state.lastNotice ? <aside className="demo-notice">{state.lastNotice}</aside> : null}
        <p className="notify-note">
          Public page:{" "}
          <Link href={`/clubs/${club.slug}`} style={{ color: "#FFC94D", fontWeight: 600 }}>
            /clubs/{club.slug}
          </Link>
        </p>

        <h2 className="display desk-heading">Listing</h2>
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            saveClubListing({
              ...club.listing,
              name: String(form.get("name")),
              sport: String(form.get("sport")),
              venue: String(form.get("venue")),
              phone: String(form.get("phone")),
              email: String(form.get("email")),
              ageBands: [
                String(form.get("age")) as never,
                ...club.listing.ageBands.filter((band) => band !== String(form.get("age"))),
              ],
              gender: String(form.get("gender")) as never,
              accessible: form.get("accessible") === "yes",
            });
            setSaved(true);
          }}
        >
          <label className="search-field">
            <span className="field-label">Club name</span>
            <input name="name" defaultValue={club.listing.name} required />
          </label>
          <label className="search-field">
            <span className="field-label">Sport</span>
            <input name="sport" defaultValue={club.listing.sport} required />
          </label>
          <label className="search-field">
            <span className="field-label">Venue</span>
            <input name="venue" defaultValue={club.listing.venue} required />
          </label>
          <label className="search-field">
            <span className="field-label">Phone</span>
            <input name="phone" defaultValue={club.listing.phone} />
          </label>
          <label className="search-field">
            <span className="field-label">Email</span>
            <input name="email" type="email" defaultValue={club.listing.email} />
          </label>
          <label className="search-field">
            <span className="field-label">Main age band</span>
            <select name="age" defaultValue={club.listing.ageBands[0] ?? "adult"}>
              {AGE_BANDS.map((band) => (
                <option key={band.id} value={band.id}>
                  {band.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Who it&apos;s for</span>
            <select name="gender" defaultValue={club.listing.gender}>
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Accessible</span>
            <select name="accessible" defaultValue={club.listing.accessible ? "yes" : "no"}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <button className="btn-gradient" type="submit">
            {saved ? "Listing saved" : "Save listing"}
          </button>
        </form>

        <h2 className="display desk-heading">Session sheet</h2>
        <div className="event-sheet">
          {club.events.length === 0 ? (
            <p className="notify-note">No extra sessions yet. Add one below.</p>
          ) : (
            club.events.map((event) => (
              <article key={event.id} className="event-row">
                <div>
                  <div className="display" style={{ fontSize: 22 }}>
                    {event.title}
                  </div>
                  <p>
                    {event.day} · {event.time} · {event.price}
                    <br />
                    {event.ageBands.map(ageBandLabel).join(", ")} · {genderLabel(event.gender)}
                    {event.accessible ? " · Accessible" : ""}
                  </p>
                  {event.notes ? <p className="event-notes">{event.notes}</p> : null}
                </div>
                <button type="button" className="event-remove" onClick={() => removeEvent(event.id)}>
                  Take down
                </button>
              </article>
            ))
          )}
        </div>

        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            addEvent({
              title: String(form.get("title")),
              day: String(form.get("day")),
              time: String(form.get("time")),
              price: String(form.get("price")),
              ageBands: [String(form.get("age")) as never],
              gender: String(form.get("gender")) as never,
              accessible: form.get("accessible") === "yes",
              notes: String(form.get("notes") || ""),
            });
            event.currentTarget.reset();
          }}
        >
          <label className="search-field">
            <span className="field-label">Session title</span>
            <input name="title" required placeholder="Saturday beginners" />
          </label>
          <label className="search-field">
            <span className="field-label">Day</span>
            <input name="day" required defaultValue="Saturday" />
          </label>
          <label className="search-field">
            <span className="field-label">Time</span>
            <input name="time" required defaultValue="10:00am" />
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
            <select name="gender" defaultValue={club.listing.gender}>
              {GENDERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Accessible</span>
            <select name="accessible" defaultValue={club.listing.accessible ? "yes" : "no"}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </label>
          <label className="search-field">
            <span className="field-label">Notes</span>
            <input name="notes" placeholder="Beginners welcome" />
          </label>
          <button className="btn-gradient" type="submit">
            Post session
          </button>
        </form>
      </section>
    </div>
  );
}
