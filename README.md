# Alive Sport

A Southampton & Hampshire club finder. People look for a place to play; clubs get found. It is not a booking or payments app.

Live marketing site: [alive-sport-website.vercel.app](https://alive-sport-website.vercel.app)  
Repo: [github.com/andytierling-create/alivesport](https://github.com/andytierling-create/alivesport)

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — turns on the local player/club mock
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The local platform mock (Alex shortcuts, reset) is **on in `npm run dev`** and **off in a production build**. Do not set `NEXT_PUBLIC_ALIVE_DEMO=1` on Vercel.

If `DATABASE_URL` is set (Neon pooled URI), the store uses Postgres and the **API stays on in production**. If it is missing, the store uses `.data/platform.json` and production API routes 404. `POST /api/auth/reset` is always off in production.

Seeded logins (httpOnly session cookie **and** a bearer token, store in `.data/platform.json`):

- Adult: `alex@demo.alivesport` / `play`
- Club: `clubs@demo.alivesport` / `list`

## Local API

Desk, Play, Find a club, What’s on, the `/embed` snippet, and a future Expo Go app all use the same Next.js routes. The file store is gitignored.

| Route | Who | Does |
| --- | --- | --- |
| `POST /api/auth/sign-in` | adult or org | Sets the session cookie and returns `{ token, role, subjectId }` |
| `POST /api/auth/register` | adult or org | Same. Child-shaped keys are rejected. |
| `POST /api/auth/sign-out` | session or bearer | Clears the cookie and revokes that token |
| `GET /api/me` · `PATCH /api/me` | cookie or `Authorization: Bearer <token>` | Adult search prefs, or org profile. Org API keys are not a session. |
| `GET /api/events` | public | Published events + orgs. Optional `?postcode=&radius=&q=` measures miles and filters. Invalid postcode is 404. |
| `POST /api/events` | org cookie, session token, or `Authorization: Bearer <apiKey>` | Create an event. Needs the listing SKU. |
| `DELETE /api/events/[id]` | org cookie or session token | Take down |
| `PATCH /api/org` | org cookie or session token | Listing + SKU toggles (stand-in for billing) |
| `POST /api/notify/preview` | org cookie or session token | Count only. Needs the notify-area SKU. Does not send. |
| `GET /api/geo` | public | Places a UK postcode. Used to measure search miles. |
| `POST /api/searches` | public email, or adult session / token | Saves a search. Does not send email. |
| `GET /api/searches` | adult session or token | That adult’s saved searches |

Expo should send `postcode`, `radius`, and `q` on `GET /api/events`, and send the sign-in `token` as `Authorization: Bearer`. The website can keep using the cookie and the unfiltered events dump.

`/api/*` allows CORS (`ALIVE_CORS_ORIGIN`, or `*` in local demo). Do not send cookies with `*`.

### Expo Go

Point the app at `http://<lan-ip>:3000` while `npm run dev` is running. A physical phone cannot use `localhost` — that is the machine, not the phone. A simulator can.

A future WordPress plugin is this HTTP call, not a second data model.

## What is in the tree

| Path | Role |
| --- | --- |
| `data/clubs.ts` | Sample club listings (seeded as orgs + dated events) |
| `data/wellness.ts` | Sample gyms and classes |
| `data/copy.ts` | Mission, aim, group boxes — draft until signed off |
| `lib/catalog.ts` | Read path for search, stats, and What’s on |
| `lib/search.ts` | Filters (age, gender, accessible, evenings) |
| `lib/platform/` | Types, file store, session helpers |
| `app/api/` | The write/read contract |
| `public/photos/` | Drop real listing photos here, then set `photo` on a listing |

Search uses Leaflet + OpenStreetMap. No map API key.

## Andy to confirm

These stay marked PLACEHOLDER in `data/copy.ts` until you lock them:

1. Setup time is written as **10 minutes**. It used to be ~20.
2. Map stays **Leaflet + OSM**, unless you want Mapbox or Google.
3. Mission statement and “Built for everyone” box wording.

## Not building yet

- Sending notifications (preview count only; no email / SMS / push)
- Stripe or a real checkout
- A WordPress plugin repo
- Family or children’s profiles — adult search bands only
- Real photos — add files under `public/photos/` named after the listing slug, e.g. `/photos/bitterne-netball.jpg`, then set `photo: "/photos/bitterne-netball.jpg"` on that club

## Suggest a club

`/suggest` saves the name in this browser (`alive-sport-suggestions-v1`). A live inbox (email or form service) is the next step when you want names to reach you off-device.
