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

The player/club mock is **on in `npm run dev`** and **off in a production build**. Do not set `NEXT_PUBLIC_ALIVE_DEMO=1` on Vercel unless you want the mock on that deployment.

Seeded mock logins (browser only, localStorage `alive-sport-demo-v1`):

- Player: `alex@demo.alivesport` / `play`
- Club: `clubs@demo.alivesport` / `list`

## What is in the tree

| Path | Role |
| --- | --- |
| `data/clubs.ts` | Sample club listings |
| `data/wellness.ts` | Sample gyms and classes |
| `data/copy.ts` | Mission, aim, group boxes — draft until signed off |
| `lib/catalog.ts` | Read path for search, stats, and What’s on |
| `lib/search.ts` | Filters (age, gender, accessible, evenings) |
| `lib/demo-store.ts` | Local mock accounts and posted sessions |
| `public/photos/` | Drop real listing photos here, then set `photo` on a listing |

Search uses Leaflet + OpenStreetMap. No map API key.

## Andy to confirm

These stay marked PLACEHOLDER in `data/copy.ts` until you lock them:

1. Setup time is written as **10 minutes**. It used to be ~20.
2. Map stays **Leaflet + OSM**, unless you want Mapbox or Google.
3. Mission statement and “Built for everyone” box wording.

## Not building yet

- Sending notifications (copy only; no email / SMS / push)
- Family or children’s profiles (needs a legal/tech review first)
- Real photos — add files under `public/photos/` named after the listing slug, e.g. `/photos/bitterne-netball.jpg`, then set `photo: "/photos/bitterne-netball.jpg"` on that club

## Suggest a club

`/suggest` saves the name in this browser (`alive-sport-suggestions-v1`). A live inbox (email or form service) is the next step when you want names to reach you off-device.

## Next product step

`lib/catalog.ts` is the shared read API. A real database should return the same `Club` shape so Find a club, Wellness, and What’s on do not change. Still no live notifications, still no children’s data.
