/**
 * Site copy kept in one place so placeholder wording is easy to swap.
 * Values marked PLACEHOLDER are draft until Andy signs them off.
 *
 * Still to confirm:
 * - Setup time 10 vs ~20 minutes (CLUB_SETUP_COPY and the For Clubs price card).
 * - Keep Leaflet + OpenStreetMap, or switch to Mapbox / Google.
 * - Final mission statement and Built for everyone box wording.
 */

/** PLACEHOLDER — homepage hero mission. */
export const MISSION_STATEMENT =
  "We make it easy to discover the sports clubs in your community — so everyone can find a place to play, connect, and belong.";

export const HERO_TAGLINE = "Find your play";

/** Homepage headers — sport / passion / play. Last line is the brand tagline. */
export const HERO_HEADERS = [
  "Find your sport",
  "Find your passion",
  "Find your play",
] as const;

export const TWO_SIDED_PURPOSE =
  "Alive Sport is a service for people looking for a place to play, and for clubs looking to be found.";

/** User-facing note only — no opt-in or sending until a channel is chosen. */
export const USER_NOTIFICATIONS_NOTE =
  "Clubs will be able to send news about events and sessions nearby. We'll always ask first — nothing arrives unless you say yes."

/** PLACEHOLDER — homepage groups heading (replaces “left off / left behind” framing). */
export const GROUPS_HEADING = "Built for everyone";

export const WHY_SPORT_MATTERS = [
  "Playing regularly is one of the simplest ways to look after your body and your head — and to meet people who live near you.",
  "A weekly session is fitness, yes, but it is also a reason to leave the house and a place that starts to feel like yours.",
  "Alive Sport exists so people looking for that, and clubs ready to welcome them, can find each other.",
] as const;

export const AIM_STATEMENT =
  "Our aim is to bring clubs and communities together, encourage participation, and make sport accessible for everyone.";

/**
 * PLACEHOLDER — claimed setup time.
 * Flag to Andy before treating as final: this used to say ~20 minutes.
 */
export const CLUB_SETUP_COPY =
  "A simple 10-minute registration process, and we'll do the rest.";

export const GROUP_CARDS = [
  {
    title: "Children",
    variant: "children" as const,
    body: "Age-banded sessions, so you know a nine-year-old will not be put in with teenagers.",
    benefit: "Clear age bands on every listing, before you travel.",
    tilt: "-1.4deg",
  },
  {
    title: "Women & girls",
    variant: "women" as const,
    body: "Beginner and women-only sessions flagged clearly, including who else usually turns up.",
    benefit: "Beginner and women-only sessions flagged up front.",
    tilt: "1.2deg",
  },
  {
    title: "Disabled people",
    variant: "disabled" as const,
    body: "Step-free access, hoists, changing places and coach training — stated, not implied.",
    benefit: "Verified accessibility info before you arrive.",
    tilt: "-0.8deg",
  },
  {
    title: "Older adults",
    variant: "older" as const,
    body: "Walking versions, daytime slots and sessions where a cup of tea is part of it.",
    benefit: "Daytime and seniors sessions easy to spot.",
    tilt: "1.6deg",
  },
] as const;
