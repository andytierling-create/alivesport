# Family accounts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two adults can share a family (invite + accept by email), record child age-band and gender only, pick configurable activity categories, and see the same saved searches.

**Architecture:** Extend the Neon JSON `platform_state` with `families`, `familyInvites`, and `activityCategories`. Pure store functions in `lib/platform/family.ts` own invite/accept/leave/slots/categories. Website APIs and Play UI sit on those functions. Expo You reads the same `/api/me` and patches family; magic links always open the website.

**Tech Stack:** Next.js App Router, existing `node:test` + `tsx`, Resend HTTP API (no new package unless already present), Expo app as API client.

**Spec:** `docs/superpowers/specs/2026-10-24-family-accounts-design.md`

## Global Constraints

- UK English. Adult-only accounts. Child slots are not accounts and cannot sign in.
- Reject `CHILD_SHAPED_KEYS` (`children`, `child`, `dateOfBirth`, `school`) on register, adult patch, family patch, and save-search. New field is `childSlots`.
- A child slot is only `{ id, ageBand: "3-10" | "10-18", gender: "men" | "women" | "mixed" }`. No name, DOB, school, or photo.
- At most two adults per family. One family per adult. At most eight child slots.
- Invite by email magic link; they must accept. 7 days, one use, one pending invite per family.
- Existing saved searches carry onto the family at create and at accept. After that, saves from either adult are family searches.
- Last adult leave deletes the family, voids the invite, and returns family searches to that adult as personal.
- Either linked adult can change child slots and family `categoryIds`.
- Seed categories: Netball, Wheelchair basketball, Walking football, Running, Court sports, Swim.
- Andy adds categories at `/ops/categories` when signed in with an email in `ADMIN_EMAILS`.
- Mail sends only with `RESEND_API_KEY`. Missing key in production is an error, not a fake “sent.” Dev may return the link in JSON and say the mail could not be sent.
- Magic-link landing is the website. Expo does not store family locally.
- Do not print demo passwords. Do not email session notices.

## Review Focus

- Invite to an adult already in a family — 409, not a second family.
- `PATCH /api/family` with `children` or `dateOfBirth` — 400, same copy style as adult patch.
- Accept with an expired or reused token — 400, family still one adult.
- Last adult leave — family gone, child slots gone, searches back on that adult with no `familyId`.
- Non-admin `POST /api/categories` — 403.

---

### Task 1: Types, seed categories, persist defaults

**Files:**
- Modify: `lib/platform/types.ts`
- Modify: `lib/platform/persist.ts`
- Modify: `lib/platform/persist.test.ts`
- Modify: `lib/platform/store.ts` (`seedPlatform`, `Adult` construction)
- Create: `lib/platform/family.ts` (constants + `seedCategories` only in this task)

**Interfaces:**
- Consumes: existing `PlatformState`, `Adult`, `SavedSearch`, `AgeBand`, `Gender`
- Produces:
  - `ChildSlot = { id: string; ageBand: "3-10" | "10-18"; gender: Gender }`
  - `Family = { id: string; adultIds: string[]; childSlots: ChildSlot[]; categoryIds: string[] }`
  - `FamilyInvite = { id: string; familyId: string; email: string; token: string; invitedByAdultId: string; createdAt: string; expiresAt: string }`
  - `ActivityCategory = { id: string; slug: string; label: string }`
  - `Adult.categoryIds: string[]`
  - `SavedSearch.familyId?: string`
  - `PlatformState.families`, `.familyInvites`, `.activityCategories`
  - `SEED_CATEGORY_LABELS = ["Netball", "Wheelchair basketball", "Walking football", "Running", "Court sports", "Swim"]`
  - `seedCategories(): ActivityCategory[]` — slug via existing `slugify`
  - `INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000`
  - `MAX_CHILD_SLOTS = 8`

- [ ] **Step 1: Write the failing test**

In `lib/platform/persist.test.ts` (or a new `lib/platform/family.test.ts` if persist tests are a poor fit): `test("normaliseState fills empty family collections and seed categories match the spec labels")`.

Assert: `normaliseState({})` has `families: []`, `familyInvites: []`, `activityCategories: []`. Assert `seedCategories().map(c => c.label)` equals `SEED_CATEGORY_LABELS` in that order.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/persist.test.ts lib/platform/family.test.ts`

Expected: FAIL — missing keys / `seedCategories` not defined.

- [ ] **Step 3: Implement types, `normaliseState` defaults, `seedCategories`, and empty `categoryIds` on seeded Alex**

`seedPlatform` sets `families: []`, `familyInvites: []`, `activityCategories: seedCategories()`.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/persist.test.ts lib/platform/family.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/platform/types.ts lib/platform/persist.ts lib/platform/persist.test.ts lib/platform/store.ts lib/platform/family.ts lib/platform/family.test.ts
git commit -m "Add family, invite, and category types to platform state."
```

---

### Task 2: Invite, accept, leave, child slots

**Files:**
- Modify: `lib/platform/family.ts`
- Modify: `lib/platform/family.test.ts`

**Interfaces:**
- Consumes: Task 1 types; `registerAdultOn` from `store.ts` for new-adult accept
- Produces (all `On` functions take `state: PlatformState` and return `{ ok: true; ...; state } | { ok: false; status: number; error: string }`):
  - `inviteAdultOn(state, inviter: Adult, email: string, now?: Date)`
  - `acceptInviteOn(state, token: string, input: { displayName?: string; password?: string }, now?: Date)`
  - `leaveFamilyOn(state, adult: Adult)`
  - `patchFamilyOn(state, adult: Adult, body: Record<string, unknown>)`
  - `familyForAdult(adult: Adult, state: PlatformState): Family | null`
  - `pendingInviteForFamily(familyId: string, state: PlatformState): FamilyInvite | null`
  - `incomingInviteForEmail(email: string, state: PlatformState): FamilyInvite | null`

- [ ] **Step 1: Write the failing tests**

`test("invite then accept links two adults")` — after accept, `family.adultIds` has both ids, invite is gone.

`test("invite to an adult already in a family is rejected")` — status 409.

`test("accept expired token fails and leaves one adult")` — status 400.

`test("accept reused token fails")` — status 400.

`test("new adult accept creates an account and joins")` — credential exists; family has two ids.

`test("patchFamilyOn rejects child-shaped keys")` — body `{ children: [] }` → 400, error matches `/do not store/i`.

`test("patchFamilyOn accepts childSlots age band and gender only")` — slot `{ ageBand: "3-10", gender: "mixed" }`; stored slot has `id` and those two fields only.

`test("ninth child slot is rejected")` — status 400.

`test("either adult can patch childSlots")` — second adult’s patch succeeds.

`test("one adult leave keeps family for the other")`.

`test("last adult leave deletes family and voids invite")`.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/family.test.ts`

Expected: FAIL — functions missing.

- [ ] **Step 3: Implement the functions in `lib/platform/family.ts`**

Invite: create family if inviter has none; attach their searches (Task 3 can no-op if `attachSearchesToFamily` is a stub you fill next — prefer implementing attach in Task 3 and calling it from invite/accept here once that function exists; if you implement invite first, leave a `// Task 3` call site `attachSearchesToFamily(state, familyId, adultId)` exported from this file as identity until Task 3). Token prefix `inv_`. `expiresAt = now + INVITE_TTL_MS`. Replace unused pending invite for that family. Reject if email is the inviter, invalid, already in a family, or family already has two adults.

Accept: find unused unexpired invite by token; if adult exists, join (must not already be in a family); if not, require `displayName` and `password`, then `registerAdultOn`. Remove invite.

Leave: remove adult id; if none left, drop family, its invites, and (Task 3) detach searches.

Patch: `childShapedKeysIn` first; only members; `childSlots` replace; `categoryIds` must exist in `state.activityCategories`.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/family.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/platform/family.ts lib/platform/family.test.ts
git commit -m "Add family invite, accept, leave, and child slots."
```

---

### Task 3: Family saved searches

**Files:**
- Modify: `lib/platform/family.ts` (`attachSearchesToFamily`, `detachFamilySearchesToAdult`)
- Modify: `lib/platform/store.ts` (`saveSearchOn`, `searchesFor`)
- Modify: `lib/platform/store.test.ts`
- Modify: `lib/platform/family.test.ts`

**Interfaces:**
- Consumes: `SavedSearch`, `familyForAdult`
- Produces:
  - `attachSearchesToFamily(state, familyId, adultId): PlatformState` — sets `familyId` on that adult’s current searches (`adultId` or matching email).
  - `detachFamilySearchesToAdult(state, familyId, adultId): PlatformState` — clears `familyId` on those searches (used when last adult leaves).
  - `searchesFor(adult, state)` returns family searches if the adult is in a family, else personal (`!familyId` and owned by adult).
  - `saveSearchOn` sets `familyId` when the saver is in a family.

- [ ] **Step 1: Write the failing tests**

`test("creating a family carries that adult's existing searches")`

`test("accepting carries the second adult's existing searches onto the family")`

`test("after link, a new save from either adult is a family search")`

`test("leaver does not keep the family search list")`

`test("last adult leave returns family searches to that adult as personal")` — `familyId` absent; `searchesFor` still returns them.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/family.test.ts lib/platform/store.test.ts`

Expected: FAIL on the new cases.

- [ ] **Step 3: Implement attach/detach and update `saveSearchOn` / `searchesFor`**

Call attach from `inviteAdultOn` (inviter) and `acceptInviteOn` (invitee). Call detach from last-adult `leaveFamilyOn`.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/family.test.ts lib/platform/store.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/platform/family.ts lib/platform/family.test.ts lib/platform/store.ts lib/platform/store.test.ts
git commit -m "Carry saved searches onto the family and back on last leave."
```

---

### Task 4: Categories add + admin gate + mail helper

**Files:**
- Modify: `lib/platform/family.ts`
- Modify: `lib/platform/family.test.ts`
- Create: `lib/platform/mail.ts`
- Create: `lib/platform/mail.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `slugify`, `ActivityCategory`
- Produces:
  - `addCategoryOn(state, label: string): { ok: true; category: ActivityCategory; state } | { ok: false; status: number; error: string }`
  - `isCategoryAdmin(email: string, adminEmails = process.env.ADMIN_EMAILS): boolean` — comma-separated, case-insensitive.
  - `inviteLink(origin: string, token: string): string` → `${origin}/join/family?token=${token}`
  - `sendInviteEmail(input: { to: string; link: string; fromName: string }): Promise<{ sent: true } | { sent: false; error: string }>`
  - Copy: subject `Join this family on Alive Sport`. Body is one sentence plus the link. No session list.

- [ ] **Step 1: Write the failing tests**

`test("addCategoryOn appends a label Andy can add")` — "Martial arts" → slug `martial-arts`.

`test("addCategoryOn rejects a blank label")` — 400.

`test("isCategoryAdmin matches ADMIN_EMAILS")` — `isCategoryAdmin("andy@example.com", "andy@example.com, other@x.com")` true; other false.

`test("inviteLink points at /join/family")`.

`test("sendInviteEmail without RESEND_API_KEY does not claim sent")` — `{ sent: false }`.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/family.test.ts lib/platform/mail.test.ts`

Expected: FAIL

- [ ] **Step 3: Implement `addCategoryOn`, `isCategoryAdmin`, `inviteLink`, `sendInviteEmail`**

`sendInviteEmail`: if no `RESEND_API_KEY`, return `{ sent: false, error: "Email is not configured." }`. If set, `POST https://api.resend.com/emails` with `Authorization: Bearer …`, `from` = `process.env.RESEND_FROM || "Alive Sport <hello@alivesport.co.uk>"`. Do not add a Resend SDK unless you must.

`.env.example`: `ADMIN_EMAILS`, `RESEND_API_KEY`, `RESEND_FROM`.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/family.test.ts lib/platform/mail.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/platform/family.ts lib/platform/family.test.ts lib/platform/mail.ts lib/platform/mail.test.ts .env.example
git commit -m "Add configurable categories and honest invite mail."
```

---

### Task 5: Family and category API routes

**Files:**
- Modify: `app/api/me/route.ts`
- Modify: `app/api/me` PATCH to allow `categoryIds` via `patchAdultOn`
- Create: `app/api/family/invite/route.ts`
- Create: `app/api/family/accept/route.ts`
- Create: `app/api/family/leave/route.ts`
- Create: `app/api/family/route.ts` (PATCH)
- Create: `app/api/categories/route.ts` (GET, POST)
- Modify: `lib/platform/store.ts` — `patchAdultOn` accepts `categoryIds` (must exist); still rejects child-shaped keys
- Modify: `package.json` `test` script to include `lib/platform/family.test.ts` `lib/platform/mail.test.ts`
- Modify: `lib/platform/store.ts` async wrappers `inviteAdult`, `acceptInvite`, `leaveFamily`, `patchFamily`, `addCategory` that `commit`

**Interfaces:**
- Consumes: Task 2–4 functions; `actorFromRequest`; `demoApiGuard`; `jsonOk` / `jsonError`
- Produces HTTP:
  - `GET /api/me` adult payload adds `family`, `invite` (outgoing pending), `incomingInvite`, `categories`
  - `POST /api/family/invite` `{ email }` → 201 `{ invite, sent, link? }` — include `link` only when `NODE_ENV !== "production"` and `sent` is false
  - Production + `sent: false` → 503 `{ error }` not a fake send
  - `POST /api/family/accept` `{ token, displayName?, password? }` → session + token like register
  - `POST /api/family/leave`
  - `PATCH /api/family` `{ childSlots?, categoryIds? }`
  - `GET /api/categories` `{ categories }`
  - `POST /api/categories` `{ label }` — 403 unless `isCategoryAdmin(actor.adult.email)`

- [ ] **Step 1: Write the failing tests**

Keep route tests out of HTTP if awkward; add store/wrapper tests already covering status codes. Add `test("patchAdultOn rejects children still")` if not present. Add `test("patchAdultOn stores categoryIds")`.

- [ ] **Step 2: Run them to make sure they fail**

Run: `npm test`

Expected: FAIL on new patch cases if not implemented.

- [ ] **Step 3: Implement routes and wrappers**

Use `corsPreflight` + `dynamic = "force-dynamic"` like other API files. Accept issues a bearer token via `issueToken`.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npm test`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/api lib/platform/store.ts package.json
git commit -m "Expose family invite, accept, and categories on the API."
```

---

### Task 6: Fits-your-family on public search

**Files:**
- Modify: `lib/platform/types.ts` — `PublicSearchOrg.fitsFamily?: boolean`, same on `PublicSearchEvent`
- Modify: `lib/platform/public-search.ts`
- Modify: `lib/platform/public-search.test.ts`
- Modify: `app/api/events/route.ts` — if session adult has a family (or adult categories / lookingForAgeBands), stamp `fitsFamily`

**Interfaces:**
- Consumes: `Family`, `Adult`, `ActivityCategory[]`
- Produces: `fitsFamily(orgOrEvent, input: { ageBands: AgeBand[]; categoryLabels: string[] }): boolean`
  - Age: overlap with `item.ageBands` if `ageBands` non-empty; if empty age list, age does not exclude.
  - Category: if `categoryLabels` non-empty, `item.sport` (or org sport for events) case-insensitive equals one label.
  - Combined: age rule AND category rule.

Guest search unchanged (no `fitsFamily` required). Do not hide non-matching orgs by default.

- [ ] **Step 1: Write the failing tests**

`test("fitsFamily is true when a child 3-10 slot matches a 3-10 listing")`

`test("fitsFamily is false when categories are set and the sport is not one of them")`

`test("buildPublicSearch without a family does not require fitsFamily")`

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/public-search.test.ts`

Expected: FAIL

- [ ] **Step 3: Implement `fitsFamily` and stamp on GET `/api/events` when an adult session is present**

Age bands used: family `childSlots` plus adult `lookingForAgeBands`. Category labels: union of family + adult `categoryIds` resolved through `activityCategories`.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `npx tsx --tsconfig tsconfig.json --test lib/platform/public-search.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/platform/types.ts lib/platform/public-search.ts lib/platform/public-search.test.ts app/api/events/route.ts
git commit -m "Mark listings that fit a family's bands and categories."
```

---

### Task 7: Website Play, join link, and ops categories

**Files:**
- Create: `components/FamilyCard.tsx`
- Modify: `app/play/PlayClient.tsx`
- Create: `app/join/family/page.tsx`
- Create: `app/ops/categories/page.tsx`
- Modify: `app/globals.css` only if existing desk/play classes are not enough

**Interfaces:**
- Consumes: `/api/family/*`, `/api/me`, `/api/categories`
- Produces screens with this copy:
  - Child slots: `Age band and gender only. We do not store a child’s name or date of birth.`
  - Invite: `We’ll email them a link. They have to accept. Until then you are the only adult in this family.`
  - No child fields on `/join/family`. Email locked to the invite.

- [ ] **Step 1: Add `FamilyCard` to Play when signed in as an adult**

Invite email field; pending invite state; child slot add/remove (age 3–10 / 10–18, gender men/women/mixed); own category checkboxes; family category checkboxes; Leave. Use existing `desk-form` / `btn-gradient` classes.

- [ ] **Step 2: Build `/join/family`**

Read `token` from the query. If no adult for that email, show name + password + accept. If they exist, accept (sign in first if the session is someone else). After success, go to `/play`.

- [ ] **Step 3: Build `/ops/categories`**

If not admin, show `You cannot add categories.` List labels. Form to add a label.

- [ ] **Step 4: Verify in the browser**

Play: invite form visible, child copy visible, no name/DOB fields. Join page: no child form. Ops: denied without `ADMIN_EMAILS`.

- [ ] **Step 5: Commit**

```bash
git add components/FamilyCard.tsx app/play/PlayClient.tsx app/join/family/page.tsx app/ops/categories/page.tsx app/globals.css
git commit -m "Add family invite, child slots, and category screens on the website."
```

---

### Task 8: Expo You + Find family mark

**Files:**
- Modify: `/Users/andy/Documents/AliveSport/alivesport-app/src/api/types.ts`
- Modify: `/Users/andy/Documents/AliveSport/alivesport-app/src/api/client.ts`
- Modify: `/Users/andy/Documents/AliveSport/alivesport-app/app/(tabs)/you.tsx`
- Modify: `/Users/andy/Documents/AliveSport/alivesport-app/app/(tabs)/find.tsx`

**Interfaces:**
- Consumes: same `/api/me` and `/api/family` contract
- Produces: You shows family members, child slots (band + gender), category picks, leave. Invite says to use the website email link if in-app send is awkward — or call `POST /api/family/invite` if signed in. Find shows “Fits your family” on matching orgs; optional toggle to show only those. Do not auto-search.

- [ ] **Step 1: Extend client types and `fetchMe` / `patchFamily` / `leaveFamily` / `listCategories`**

Mirror `ChildSlot`, `Family`, `ActivityCategory`. Never send `CHILD_SHAPED_KEYS`.

- [ ] **Step 2: You tab family block**

Same copy as the website. No child name field.

- [ ] **Step 3: Find mark + optional filter**

Only when `hasApplied` and `fitsFamily` is present.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit` in `alivesport-app`

Expected: PASS

- [ ] **Step 5: Commit in the app repo**

```bash
git add src/api app/(tabs)/you.tsx app/(tabs)/find.tsx
git commit -m "Show family slots and Fits your family in Expo Go."
```

---

## Self-review

- Spec coverage: invite/accept/leave, childSlots only, categories seed + admin add, search carry-over and last-leave, fitsFamily default not hidden, Expo via API, honest mail — each has a task.
- Review Focus items are tests in Tasks 2, 3, 4, and 5.
- Two repos: website Tasks 1–7, Expo Task 8. Do not put Expo inside the Next tree.
