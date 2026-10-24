import { childShapedKeysIn, newId, registerAdultOn } from "@/lib/platform/store";
import type {
  ActivityCategory,
  Adult,
  ChildSlot,
  Family,
  FamilyInvite,
  Gender,
  PlatformState,
} from "@/lib/platform/types";

export const SEED_CATEGORY_LABELS = [
  "Netball",
  "Wheelchair basketball",
  "Walking football",
  "Running",
  "Court sports",
  "Swim",
] as const;

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_CHILD_SLOTS = 8;

function categorySlug(label: string) {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

export function seedCategories(): ActivityCategory[] {
  return SEED_CATEGORY_LABELS.map((label) => ({
    id: `cat-${categorySlug(label)}`,
    slug: categorySlug(label),
    label,
  }));
}

type Fail = { ok: false; status: number; error: string };

export function familyForAdult(adult: Adult, state: PlatformState) {
  return state.families.find((family) => family.adultIds.includes(adult.id)) ?? null;
}

export function pendingInviteForFamily(familyId: string, state: PlatformState) {
  return state.familyInvites.find((invite) => invite.familyId === familyId) ?? null;
}

export function incomingInviteForEmail(email: string, state: PlatformState) {
  const normalised = email.trim().toLowerCase();
  return (
    state.familyInvites.find((invite) => invite.email === normalised) ?? null
  );
}

export function attachSearchesToFamily(
  state: PlatformState,
  familyId: string,
  adultId: string,
): PlatformState {
  const adult = state.adults.find((item) => item.id === adultId);
  return {
    ...state,
    savedSearches: (state.savedSearches ?? []).map((search) => {
      const owned =
        search.adultId === adultId || Boolean(adult && search.email === adult.email);
      if (!owned || search.familyId) return search;
      return { ...search, familyId };
    }),
  };
}

export function detachFamilySearchesToAdult(
  state: PlatformState,
  familyId: string,
  adultId: string,
): PlatformState {
  return {
    ...state,
    savedSearches: (state.savedSearches ?? []).map((search) => {
      if (search.familyId !== familyId) return search;
      const { familyId: _drop, ...rest } = search;
      return { ...rest, adultId: search.adultId ?? adultId };
    }),
  };
}

function fail(status: number, error: string): Fail {
  return { ok: false, status, error };
}

function adultByEmail(state: PlatformState, email: string) {
  return state.adults.find((item) => item.email === email.trim().toLowerCase()) ?? null;
}

export function inviteAdultOn(
  state: PlatformState,
  inviter: Adult,
  email: string,
  now = new Date(),
):
  | { ok: true; family: Family; invite: FamilyInvite; state: PlatformState }
  | Fail {
  const normalised = email.trim().toLowerCase();
  if (!normalised || !normalised.includes("@")) {
    return fail(400, "A valid email is required.");
  }
  if (normalised === inviter.email) {
    return fail(400, "You cannot invite yourself.");
  }
  const existing = adultByEmail(state, normalised);
  if (existing && familyForAdult(existing, state)) {
    return fail(409, "That adult is already in a family.");
  }

  let family = familyForAdult(inviter, state);
  let next = state;
  if (!family) {
    family = {
      id: newId("fam"),
      adultIds: [inviter.id],
      childSlots: [],
      categoryIds: [],
    };
    next = attachSearchesToFamily(
      { ...next, families: [...next.families, family] },
      family.id,
      inviter.id,
    );
  }
  if (family.adultIds.length >= 2) {
    return fail(409, "This family already has two adults.");
  }

  const invite: FamilyInvite = {
    id: newId("finv"),
    familyId: family.id,
    email: normalised,
    token: `inv_${newId("tok")}`,
    invitedByAdultId: inviter.id,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
  };
  return {
    ok: true,
    family,
    invite,
    state: {
      ...next,
      familyInvites: [
        ...next.familyInvites.filter((item) => item.familyId !== family.id),
        invite,
      ],
    },
  };
}

export function acceptInviteOn(
  state: PlatformState,
  token: string,
  input: { displayName?: string; password?: string },
  now = new Date(),
):
  | { ok: true; family: Family; adult: Adult; state: PlatformState }
  | Fail {
  const invite = state.familyInvites.find((item) => item.token === token);
  if (!invite) return fail(400, "That invite is not valid.");
  if (new Date(invite.expiresAt).getTime() <= now.getTime()) {
    return fail(400, "That invite has expired.");
  }
  const family = state.families.find((item) => item.id === invite.familyId);
  if (!family) return fail(400, "That invite is not valid.");
  if (family.adultIds.length >= 2) {
    return fail(409, "This family already has two adults.");
  }

  let next = state;
  let adult = adultByEmail(state, invite.email);
  if (!adult) {
    if (!input.displayName?.trim() || !input.password) {
      return fail(400, "Name and password are required to create an account.");
    }
    const registered = registerAdultOn(state, {
      email: invite.email,
      password: input.password,
      displayName: input.displayName,
    });
    if (!registered.ok) return registered;
    next = registered.state;
    adult = registered.adult;
  }
  if (familyForAdult(adult, next) && familyForAdult(adult, next)?.id !== family.id) {
    return fail(409, "That adult is already in a family.");
  }

  const joined: Family = {
    ...family,
    adultIds: family.adultIds.includes(adult.id)
      ? family.adultIds
      : [...family.adultIds, adult.id],
  };
  next = attachSearchesToFamily(
    {
      ...next,
      families: next.families.map((item) => (item.id === family.id ? joined : item)),
      familyInvites: next.familyInvites.filter((item) => item.id !== invite.id),
    },
    joined.id,
    adult.id,
  );
  return { ok: true, family: joined, adult, state: next };
}

export function leaveFamilyOn(
  state: PlatformState,
  adult: Adult,
): { ok: true; state: PlatformState } | Fail {
  const family = familyForAdult(adult, state);
  if (!family) return fail(404, "You are not in a family.");
  const remaining = family.adultIds.filter((id) => id !== adult.id);
  if (remaining.length === 0) {
    let next = detachFamilySearchesToAdult(state, family.id, adult.id);
    return {
      ok: true,
      state: {
        ...next,
        families: next.families.filter((item) => item.id !== family.id),
        familyInvites: next.familyInvites.filter((item) => item.familyId !== family.id),
      },
    };
  }
  return {
    ok: true,
    state: {
      ...state,
      families: state.families.map((item) =>
        item.id === family.id ? { ...item, adultIds: remaining } : item,
      ),
    },
  };
}

function parseChildSlots(raw: unknown): ChildSlot[] | Fail {
  if (!Array.isArray(raw)) return fail(400, "childSlots must be a list.");
  if (raw.length > MAX_CHILD_SLOTS) {
    return fail(400, `A family can have at most ${MAX_CHILD_SLOTS} child slots.`);
  }
  const slots: ChildSlot[] = [];
  for (const item of raw) {
    const row = item as { id?: string; ageBand?: string; gender?: string };
    if (row.ageBand !== "3-10" && row.ageBand !== "10-18") {
      return fail(400, "A child slot age band must be 3-10 or 10-18.");
    }
    if (row.gender !== "men" && row.gender !== "women" && row.gender !== "mixed") {
      return fail(400, "A child slot gender must be men, women, or mixed.");
    }
    slots.push({
      id: row.id?.trim() || newId("slot"),
      ageBand: row.ageBand,
      gender: row.gender as Gender,
    });
  }
  return slots;
}

export function patchFamilyOn(
  state: PlatformState,
  adult: Adult,
  body: Record<string, unknown>,
): { ok: true; family: Family; state: PlatformState } | Fail {
  const forbidden = childShapedKeysIn(body);
  if (forbidden.length) {
    return fail(400, `Adult profiles do not store ${forbidden.join(", ")}.`);
  }
  const family = familyForAdult(adult, state);
  if (!family) return fail(404, "You are not in a family.");
  let childSlots = family.childSlots;
  if (Object.hasOwn(body, "childSlots")) {
    const parsed = parseChildSlots(body.childSlots);
    if (!Array.isArray(parsed)) return parsed;
    childSlots = parsed;
  }
  let categoryIds = family.categoryIds;
  if (Object.hasOwn(body, "categoryIds")) {
    if (!Array.isArray(body.categoryIds)) {
      return fail(400, "categoryIds must be a list.");
    }
    const known = new Set(state.activityCategories.map((item) => item.id));
    categoryIds = body.categoryIds.map((item) => String(item));
    if (categoryIds.some((id) => !known.has(id))) {
      return fail(400, "Unknown category.");
    }
  }
  const next: Family = { ...family, childSlots, categoryIds };
  return {
    ok: true,
    family: next,
    state: {
      ...state,
      families: state.families.map((item) => (item.id === family.id ? next : item)),
    },
  };
}

