const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function parseClock(time: string) {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return { hours: 18, minutes: 0 };
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  return { hours, minutes };
}

export function thisWeekStartsAt(dayName: string, time: string, from = new Date()) {
  const target = WEEKDAYS.findIndex(
    (day) => day.toLowerCase() === dayName.trim().toLowerCase(),
  );
  const day = target === -1 ? from.getDay() : target;
  const { hours, minutes } = parseClock(time);
  const date = new Date(from);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay() + day);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function weekdayName(iso: string) {
  return WEEKDAYS[new Date(iso).getDay()];
}

export function formatClock(iso: string) {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12}:00${meridiem}` : `${hour12}:${String(minutes).padStart(2, "0")}${meridiem}`;
}

export function formatEventWhen(iso: string) {
  const date = new Date(iso);
  const day = weekdayName(iso);
  const time = formatClock(iso);
  const month = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { day, time, label: `${day} ${month} · ${time}` };
}

export function isEveningIso(iso: string) {
  return new Date(iso).getHours() >= 17;
}
