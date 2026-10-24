"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isPlatformClientEnabled } from "@/lib/demo-flag";
import type {
  Adult,
  AdultPatch,
  CreateEventInput,
  Org,
  OrgPatch,
  PlatformEvent,
  PublicOrg,
  SessionRole,
} from "@/lib/platform/types";
import { DEMO_ADULT, DEMO_ORG } from "@/lib/platform/types";

type MeResponse =
  | { role: "adult"; adult: Adult; lastNotice?: string | null }
  | { role: "org"; org: Org; events: PlatformEvent[] };

type EventsResponse = {
  events: PlatformEvent[];
  orgs: PublicOrg[];
};

type DemoContextValue = {
  ready: boolean;
  role: SessionRole | null;
  adult: Adult | null;
  org: Org | null;
  orgEvents: PlatformEvent[];
  publishedEvents: PlatformEvent[];
  publicOrgs: PublicOrg[];
  lastNotice: string | null;
  signIn: (email: string, password: string) => Promise<SessionRole>;
  signInDemo: (role: "adult" | "org" | "player" | "club") => Promise<void>;
  signOut: () => Promise<void>;
  resetDemo: () => Promise<void>;
  registerAdult: (input: {
    email: string;
    password: string;
    displayName: string;
    postcode?: string;
    lookingForAgeBands?: Adult["lookingForAgeBands"];
    gender?: Adult["gender"];
    accessible?: boolean;
    notifyOptIn?: boolean;
  }) => Promise<void>;
  registerOrg: (input: {
    email: string;
    password: string;
    name: string;
    sport: string;
    venue: string;
    postcode?: string;
    phone?: string;
    contactEmail?: string;
    ageBands?: Org["ageBands"];
    gender?: Org["gender"];
    accessible?: boolean;
  }) => Promise<void>;
  saveAdult: (patch: AdultPatch) => Promise<void>;
  saveOrg: (patch: OrgPatch) => Promise<void>;
  addEvent: (input: CreateEventInput) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const DemoContext = createContext<DemoContextValue | null>(null);

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const platform = isPlatformClientEnabled();
  const [ready, setReady] = useState(!platform);
  const [role, setRole] = useState<SessionRole | null>(null);
  const [adult, setAdult] = useState<Adult | null>(null);
  const [org, setOrg] = useState<Org | null>(null);
  const [orgEvents, setOrgEvents] = useState<PlatformEvent[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<PlatformEvent[]>([]);
  const [publicOrgs, setPublicOrgs] = useState<PublicOrg[]>([]);
  const [lastNotice, setLastNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!platform) return;
    const [eventsRes, meRes] = await Promise.all([
      fetch("/api/events", { cache: "no-store" }),
      fetch("/api/me", { cache: "no-store" }),
    ]);
    const eventsBody = await readJson<EventsResponse>(eventsRes);
    setPublishedEvents(eventsBody.events);
    setPublicOrgs(eventsBody.orgs);

    if (meRes.status === 401) {
      setRole(null);
      setAdult(null);
      setOrg(null);
      setOrgEvents([]);
      return;
    }
    const me = await readJson<MeResponse>(meRes);
    if (me.role === "adult") {
      setRole("adult");
      setAdult(me.adult);
      setOrg(null);
      setOrgEvents([]);
      setLastNotice(me.lastNotice ?? null);
    } else {
      setRole("org");
      setOrg(me.org);
      setOrgEvents(me.events);
      setAdult(null);
    }
  }, [platform]);

  useEffect(() => {
    if (!platform) return;
    refresh()
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, [platform, refresh]);

  const value = useMemo<DemoContextValue>(() => {
    return {
      ready,
      role,
      adult,
      org,
      orgEvents,
      publishedEvents,
      publicOrgs,
      lastNotice,
      async signIn(email, password) {
        const data = await readJson<{ role: SessionRole }>(
          await fetch("/api/auth/sign-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }),
        );
        setLastNotice(null);
        await refresh();
        return data.role;
      },
      async signInDemo(who) {
        const adultLogin = who === "adult" || who === "player";
        const email = adultLogin ? DEMO_ADULT.email : DEMO_ORG.email;
        const password = adultLogin ? DEMO_ADULT.password : DEMO_ORG.password;
        await readJson<{ role: SessionRole }>(
          await fetch("/api/auth/sign-in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }),
        );
        setLastNotice(null);
        await refresh();
      },
      async signOut() {
        await fetch("/api/auth/sign-out", { method: "POST" });
        setRole(null);
        setAdult(null);
        setOrg(null);
        setOrgEvents([]);
        setLastNotice(null);
        await refresh();
      },
      async resetDemo() {
        await fetch("/api/auth/reset", { method: "POST" });
        setLastNotice(null);
        await refresh();
      },
      async registerAdult(input) {
        await readJson(
          await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "adult", ...input }),
          }),
        );
        setLastNotice(null);
        await refresh();
      },
      async registerOrg(input) {
        await readJson(
          await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "org", ...input }),
          }),
        );
        setLastNotice(null);
        await refresh();
      },
      async saveAdult(patch) {
        await readJson(
          await fetch("/api/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          }),
        );
        await refresh();
      },
      async saveOrg(patch) {
        await readJson(
          await fetch("/api/org", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          }),
        );
        await refresh();
      },
      async addEvent(input) {
        await readJson(
          await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          }),
        );
        let notice = "Posted.";
        if (org?.subscription.notifyArea) {
          try {
            const preview = await readJson<{ message: string }>(
              await fetch("/api/notify/preview", { method: "POST" }),
            );
            notice = `Posted. ${preview.message}`;
          } catch {
            notice = "Posted.";
          }
        } else {
          notice = "Posted. Notify-area add-on is off, so nobody would be told.";
        }
        setLastNotice(notice);
        await refresh();
      },
      async removeEvent(id) {
        await readJson(
          await fetch(`/api/events/${id}`, { method: "DELETE" }),
        );
        await refresh();
      },
      refresh,
    };
  }, [
    ready,
    role,
    adult,
    org,
    orgEvents,
    publishedEvents,
    publicOrgs,
    lastNotice,
    refresh,
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside DemoProvider");
  return value;
}
