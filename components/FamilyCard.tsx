"use client";

import { useCallback, useEffect, useState } from "react";
import { GENDERS, type Gender } from "@/data/clubs";
import { useDemo } from "@/components/DemoProvider";
import type {
  ActivityCategory,
  Adult,
  ChildSlot,
  Family,
  FamilyInvite,
} from "@/lib/platform/types";

type MeAdult = {
  role: "adult";
  adult: Adult;
  family: Family | null;
  invite: FamilyInvite | null;
  incomingInvite: FamilyInvite | null;
  categories: ActivityCategory[];
};

const SLOT_BANDS = [
  { id: "3-10" as const, label: "3–10" },
  { id: "10-18" as const, label: "10–18" },
];

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function FamilyCard() {
  const { adult, refresh } = useDemo();
  const [me, setMe] = useState<MeAdult | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [ageBand, setAgeBand] = useState<"3-10" | "10-18">("3-10");
  const [gender, setGender] = useState<Gender>("mixed");

  const load = useCallback(async () => {
    const data = await readJson<MeAdult>(await fetch("/api/me", { cache: "no-store" }));
    if (data.role !== "adult") return;
    setMe(data);
  }, []);

  useEffect(() => {
    void load().catch((err) => {
      setError(err instanceof Error ? err.message : "Could not load family.");
    });
  }, [load]);

  if (!adult || !me) return null;

  const family = me.family;
  const categories = me.categories ?? [];
  const familyCategoryIds = new Set(family?.categoryIds ?? []);
  const ownIds = me.adult.categoryIds ?? [];
  const ownCategoryIds = new Set(ownIds);

  async function run(action: () => Promise<void>) {
    setError("");
    setNote("");
    try {
      await action();
      await load();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
    }
  }

  return (
    <section className="indent family-card" style={{ marginBottom: 36 }}>
      <div className="eyebrow">Family</div>
      <h2 className="desk-heading">Who you share this search with</h2>
      <p className="hero-sub">
        Age band and gender only. We do not store a child&apos;s name or date of
        birth.
      </p>

      {me.incomingInvite ? (
        <form
          className="desk-form"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await readJson(
                await fetch("/api/family/accept", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: me.incomingInvite?.token }),
                }),
              );
              setNote("You joined the family.");
            });
          }}
        >
          <p className="notify-note" style={{ gridColumn: "1 / -1", margin: 0 }}>
            You&apos;ve been invited to share a family. Accept to share
            searches.
          </p>
          <button className="btn-gradient" type="submit">
            Accept invite
          </button>
        </form>
      ) : null}

      <form
        className="desk-form"
        onSubmit={(event) => {
          event.preventDefault();
          void run(async () => {
            const result = await readJson<{ sent: boolean; link?: string }>(
              await fetch("/api/family/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
              }),
            );
            setInviteEmail("");
            setNote(
              result.sent
                ? "Invite email sent. They have to accept."
                : result.link
                  ? `Mail could not be sent. Share this link: ${result.link}`
                  : "Invite saved. Mail could not be sent.",
            );
          });
        }}
      >
        <p className="notify-note" style={{ gridColumn: "1 / -1", margin: 0 }}>
          We&apos;ll email them a link. They have to accept. Until then you are
          the only adult in this family.
        </p>
        {me.invite ? (
          <p className="notify-note" style={{ gridColumn: "1 / -1", margin: 0 }}>
            Waiting for {me.invite.email} to accept.
          </p>
        ) : null}
        <label className="search-field">
          <span className="field-label">Invite an adult</span>
          <input
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="jordan@example.com"
            required
          />
        </label>
        <button className="btn-gradient" type="submit">
          Send invite
        </button>
      </form>

      {family ? (
        <>
          <form
            className="desk-form"
            onSubmit={(event) => {
              event.preventDefault();
              const next: ChildSlot[] = [
                ...(family.childSlots ?? []),
                { id: "", ageBand, gender },
              ];
              void run(async () => {
                await readJson(
                  await fetch("/api/family", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ childSlots: next }),
                  }),
                );
              });
            }}
          >
            <label className="search-field">
              <span className="field-label">Age band</span>
              <select
                value={ageBand}
                onChange={(event) =>
                  setAgeBand(event.target.value as "3-10" | "10-18")
                }
              >
                {SLOT_BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="search-field">
              <span className="field-label">Gender</span>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as Gender)}
              >
                {GENDERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn-gradient" type="submit">
              Add child slot
            </button>
          </form>

          {family.childSlots.length ? (
            <ul className="event-sheet">
              {family.childSlots.map((slot) => (
                <li key={slot.id} className="event-row">
                  <div>
                    <strong>
                      {slot.ageBand === "3-10" ? "3–10" : "10–18"}
                    </strong>
                    <p className="event-notes">
                      {GENDERS.find((item) => item.id === slot.gender)?.label ??
                        slot.gender}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-navy"
                    onClick={() => {
                      void run(async () => {
                        await readJson(
                          await fetch("/api/family", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              childSlots: family.childSlots.filter(
                                (item) => item.id !== slot.id,
                              ),
                            }),
                          }),
                        );
                      });
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <form className="desk-form">
            <p className="field-label" style={{ gridColumn: "1 / -1" }}>
              Family activities
            </p>
            {categories.map((category) => (
              <label key={category.id} className="search-field">
                <span className="field-label">
                  <input
                    type="checkbox"
                    checked={familyCategoryIds.has(category.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...family.categoryIds, category.id]
                        : family.categoryIds.filter((id) => id !== category.id);
                      void run(async () => {
                        await readJson(
                          await fetch("/api/family", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ categoryIds: next }),
                          }),
                        );
                      });
                    }}
                  />{" "}
                  {category.label}
                </span>
              </label>
            ))}
          </form>

          <button
            type="button"
            className="btn-navy"
            onClick={() => {
              void run(async () => {
                await readJson(await fetch("/api/family/leave", { method: "POST" }));
                setNote("You left the family.");
              });
            }}
          >
            Leave family
          </button>
        </>
      ) : null}

      <form className="desk-form" style={{ marginTop: 22 }}>
        <p className="field-label" style={{ gridColumn: "1 / -1" }}>
          Your activities
        </p>
        {categories.map((category) => (
          <label key={category.id} className="search-field">
            <span className="field-label">
              <input
                type="checkbox"
                checked={ownCategoryIds.has(category.id)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...ownIds, category.id]
                    : ownIds.filter((id) => id !== category.id);
                  void run(async () => {
                    await readJson(
                      await fetch("/api/me", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ categoryIds: next }),
                      }),
                    );
                  });
                }}
              />{" "}
              {category.label}
            </span>
          </label>
        ))}
      </form>

      {error ? <p className="form-error">{error}</p> : null}
      {note ? <p className="notify-note">{note}</p> : null}
    </section>
  );
}
