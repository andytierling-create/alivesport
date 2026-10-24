export const SUGGEST_STORAGE_KEY = "alive-sport-suggestions-v1";

export type ClubSuggestion = {
  id: string;
  name: string;
  area: string;
  contact: string;
  savedAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readSuggestions(): ClubSuggestion[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(SUGGEST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClubSuggestion[]) : [];
  } catch {
    return [];
  }
}

export function saveSuggestion(input: { name: string; area: string; contact: string }) {
  const next: ClubSuggestion[] = [
    ...readSuggestions(),
    {
      id: `sug-${Date.now()}`,
      name: input.name.trim(),
      area: input.area.trim(),
      contact: input.contact.trim(),
      savedAt: new Date().toISOString(),
    },
  ];
  if (canUseStorage()) {
    window.localStorage.setItem(SUGGEST_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}
