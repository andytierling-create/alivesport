"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  DEMO_CLUB,
  DEMO_PLAYER,
  clubRecordFor,
  currentAccount,
  optedInPlayers,
  readSnapshot,
  registerClubAccount,
  registerPlayerAccount,
  seedSnapshot,
  writeSnapshot,
  type DemoClubRecord,
  type DemoEvent,
  type DemoSnapshot,
  type PlayerProfile,
  newId,
} from "@/lib/demo-store";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return readSnapshot();
}

function commit(next: DemoSnapshot) {
  writeSnapshot(next);
  emit();
}

type DemoContextValue = {
  state: DemoSnapshot;
  account: ReturnType<typeof currentAccount>;
  player: PlayerProfile | null;
  club: DemoClubRecord | null;
  signIn: (email: string, password: string) => "player" | "club";
  signInDemo: (role: "player" | "club") => void;
  signOut: () => void;
  resetDemo: () => void;
  registerPlayer: (email: string, password: string, profile: PlayerProfile) => void;
  registerClub: (email: string, password: string, listing: DemoClubRecord["listing"]) => void;
  savePlayer: (profile: PlayerProfile) => void;
  saveClubListing: (listing: DemoClubRecord["listing"]) => void;
  addEvent: (event: Omit<DemoEvent, "id">) => void;
  removeEvent: (id: string) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const serverSeed = useMemo(() => seedSnapshot(), []);
  const state = useSyncExternalStore(subscribe, getSnapshot, () => serverSeed);

  const value = useMemo<DemoContextValue>(() => {
    const account = currentAccount(state);
    return {
      state,
      account,
      player: account?.role === "player" ? (state.players[account.id] ?? null) : null,
      club: account?.role === "club" ? clubRecordFor(state, account.id) : null,
      signIn(email, password) {
        const match = state.accounts.find(
          (item) => item.email === email.trim().toLowerCase() && item.password === password,
        );
        if (!match) throw new Error("No demo account matches that email and password.");
        commit({ ...state, sessionUserId: match.id });
        return match.role;
      },
      signInDemo(role) {
        const email = role === "player" ? DEMO_PLAYER.email : DEMO_CLUB.email;
        const match = state.accounts.find((item) => item.email === email);
        if (!match) throw new Error("Demo account missing. Reset the demo and try again.");
        commit({ ...state, sessionUserId: match.id });
      },
      signOut() {
        commit({ ...state, sessionUserId: null });
      },
      resetDemo() {
        commit(seedSnapshot());
      },
      registerPlayer(email, password, profile) {
        commit(registerPlayerAccount(state, { email, password, profile }));
      },
      registerClub(email, password, listing) {
        commit(registerClubAccount(state, { email, password, listing }));
      },
      savePlayer(profile) {
        if (!account || account.role !== "player") return;
        commit({
          ...state,
          players: { ...state.players, [account.id]: profile },
        });
      },
      saveClubListing(listing) {
        if (!account || account.role !== "club") return;
        commit({
          ...state,
          clubs: state.clubs.map((club) =>
            club.ownerId === account.id ? { ...club, listing } : club,
          ),
        });
      },
      addEvent(event) {
        if (!account || account.role !== "club") return;
        const listenersCount = optedInPlayers(state).length;
        const notice =
          listenersCount > 0
            ? `Posted. ${listenersCount} player${listenersCount === 1 ? "" : "s"} in this browser would be told — if this were live.`
            : "Posted. No opted-in players in this browser yet.";
        commit({
          ...state,
          lastNotice: notice,
          clubs: state.clubs.map((club) =>
            club.ownerId === account.id
              ? { ...club, events: [...club.events, { ...event, id: newId("evt") }] }
              : club,
          ),
        });
      },
      removeEvent(id) {
        if (!account || account.role !== "club") return;
        commit({
          ...state,
          clubs: state.clubs.map((club) =>
            club.ownerId === account.id
              ? { ...club, events: club.events.filter((event) => event.id !== id) }
              : club,
          ),
        });
      },
    };
  }, [state]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo must be used inside DemoProvider");
  return value;
}
