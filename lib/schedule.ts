import type { Club } from "@/data/clubs";
import { thisWeekStartsAt } from "@/lib/platform/dates";

export function nextStartsAt(day: string, time: string, from = new Date()) {
  const first = new Date(thisWeekStartsAt(day, time, from));
  if (Number.isNaN(first.getTime())) return null;
  if (first.getTime() > from.getTime()) return first;
  const next = new Date(first);
  next.setDate(next.getDate() + 7);
  return next;
}

export function minutesUntilNextSession(
  sessions: Club["sessions"],
  from = new Date(),
) {
  let soonest = Number.POSITIVE_INFINITY;
  for (const session of sessions) {
    if (!/^\d{1,2}(?::\d{2})?\s*(am|pm)$/i.test(session.time.trim())) continue;
    const next = nextStartsAt(session.day, session.time, from);
    if (!next) continue;
    const minutes = Math.round((next.getTime() - from.getTime()) / 60000);
    if (minutes < soonest) soonest = minutes;
  }
  return soonest;
}

export function withSchedule<T extends Club>(listings: T[], from = new Date()): T[] {
  return listings.map((listing) => {
    const sessions = listing.sessions;
    return {
      ...listing,
      days:
        sessions.length === 0
          ? "Times from the venue"
          : sessions
              .slice(0, 3)
              .map((session) =>
                /^\d/.test(session.time)
                  ? `${session.day.slice(0, 3)} ${session.time}`
                  : session.title ?? session.day,
              )
              .join(", "),
      soonestMinutes: minutesUntilNextSession(sessions, from),
      evenings: sessions.some((session) => {
        const next = nextStartsAt(session.day, session.time, from);
        return next ? next.getHours() >= 17 : listing.evenings;
      }),
    };
  });
}
