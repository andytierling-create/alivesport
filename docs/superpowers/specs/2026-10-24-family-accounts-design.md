# Family accounts, child slots, and activity categories

## Intent

Two adults can share one family so they see the same saved searches, and so a listing can be checked against who they are looking for. A family can record children’s age band and gender only. Adults and families pick activity categories. Andy can add categories. Nothing else about a child is stored.

## Why

A household often has two adults looking for play. Today each adult account is alone. They want one family, an invite the other person must accept, and honest filters — not a child profile.

## Goals

- An adult can invite a second adult by email. The mail has a magic link.
- If the invitee already has an adult account, the link joins them to the family after they accept.
- If they do not, the same link lets them create an adult account and join.
- Until they accept, the family is only the person who sent the invite.
- A family has at most two adults.
- Either linked adult can change child slots and the family’s categories.
- A child slot stores only `ageBand` (`3-10` | `10-18`) and `gender` (`men` | `women` | `mixed`). No name, date of birth, school, or photo.
- Adults can set their own category interests. The family can set shared ones.
- Find can mark listings that fit the family’s child bands and categories. It does not hide the rest unless the adult turns a filter on.
- Both adults see the family’s saved searches.
- Andy can add categories. Everyone then sees the new ones.
- Copy stays honest: this is the first real email Alive Sport sends, and it is only this join link. Session alerts stay unsent.

## Non-goals

- More than two adults in a family.
- Child names, dates of birth, schools, photos, or medical notes.
- Push notifications.
- Club desk using family data.
- Booking or Stripe.
- Pretending an email was sent.

## Anti-goals

- A `children` or `child` payload that looks like a profile (name, DOB, school).
- Auto-searching or guessing a postcode for the family.
- Printing demo passwords.
- Emailing session notices as part of this work.

## Constraints

- UK English. Adult-only accounts. Child slots are not accounts and cannot sign in.
- Existing `CHILD_SHAPED_KEYS` (`children`, `child`, `dateOfBirth`, `school`) stay rejected on register, adult patch, and save-search. The new field is `childSlots`.
- State stays in Neon `platform_state` (same JSON document).
- Expo does not get a separate family store. It uses the website API.
- Magic-link landing is on the website. Expo users open that link in a browser for v1.

## What we decided

- **Linking:** invite, then accept. Not “add their email and they are in.”
- **Invite reach:** email with a magic link. Create-and-join if new; join only if already registered.
- **Categories:** start from current listing sports, Andy can add more. Adults do not invent labels.
- **Edits after link:** either adult can change child slots and family categories.
- **Saved searches:** existing ones carry over. When a family is created, that adult’s current saved searches become the family’s. When the second adult accepts, theirs move onto the family too. After that, a save from either adult is a family search. Both see the same list.
- **Last adult leaves:** the family disappears. Child slots and any pending invite go with it. Family searches become that adult’s personal searches again.

## Calls left to the builder (and my calls)

Marked so Andy can disagree while reading.

- **Where first:** website Play / You for family + invite + accept. Expo You reads `/api/me` and can patch family once the API exists. Magic link always opens the website.
- **Who adds categories:** website page `/ops/categories`, signed in as an adult whose email is in `ADMIN_EMAILS`. No public “add a sport” for players.
- **Seed categories:** Netball, Wheelchair basketball, Walking football, Running, Court sports, Swim. Slugs derived from the label.
- **Email:** send only when `RESEND_API_KEY` (or the provider already in env) is set. If it is missing, the API still creates the invite and returns the link in JSON for Andy in development, and the UI says the mail could not be sent. Production without a key is an error, not a fake “sent.”
- **Invite life:** 7 days, one use, one pending invite per family. Sending again replaces the unused invite.
- **One family per adult.** An adult already in a family cannot accept another.
- **Child slots:** at most 8. Either adult can add or remove. Removing a slot does not keep a history.
- **Unlink:** either adult can leave. If one adult remains, they keep the family, child slots, and family searches. The leaver keeps their own adult categories only — not the family search list. If the last adult leaves, the family is deleted, child slots and a pending invite go, and those searches become that adult’s personal list again.
- **Find:** default list is unchanged. Signed-in family members see a “Fits your family” note on matching orgs. An optional toggle filters to those. Match = org/event age bands overlap a child slot or the adult’s `lookingForAgeBands`, and if the family or adult picked categories, the org sport matches one of them (case-insensitive, or the org sport equals a category label).
- **New adult on the magic-link page:** email is locked to the invite. They set display name and password. No child fields on that form.

## Shape

```
Adult --invites--> FamilyInvite (email, token, expires)
Family
  adultIds[2]
  childSlots[] { id, ageBand, gender }
  categoryIds[]
Adult.categoryIds[]
ActivityCategory { id, slug, label }
```

`GET /api/me` includes `family` (or null), `invite` (outgoing pending, if any), `incomingInvite` (if this email has one), and `categories` (the full list).

Suggested routes (builder may rename if a tighter fit exists):

- `POST /api/family/invite` `{ email }` — signed-in adult. Creates family if needed. Sends mail.
- `POST /api/family/accept` `{ token, displayName?, password? }` — password+name required only when no adult exists for that email.
- `POST /api/family/leave`
- `PATCH /api/family` `{ childSlots?, categoryIds? }` — either member.
- `PATCH /api/me` already exists for adult fields; add `categoryIds`.
- `GET /api/categories`
- `POST /api/categories` `{ label }` — admin only.

Public search may accept `family=1` or read the session to attach `fitsFamily` on orgs/events. Do not require it for guests.

## Screens

- **Website Play / You:** Family card. Invite form. Pending “waiting for them to accept.” Child slots editor (age band + gender only). Own categories. Family categories. Leave.
- **Website `/join/family`:** Accept or create-and-join. Honest copy. No child form.
- **Website `/ops/categories`:** list + add label.
- **Expo You:** same family facts from `/api/me`. Invite and accept can say “open the email link” if in-app mail is awkward; patching slots and categories should work in-app.

## Copy

- Child slots: “Age band and gender only. We do not store a child’s name or date of birth.”
- Invite: “We’ll email them a link. They have to accept. Until then you are the only adult in this family.”
- Mail subject: something like “Join this family on Alive Sport.” Body is the link and one sentence. No session list.

## Out of this document

Push, photos, national directory, EAS store submit, club-side family tools.
