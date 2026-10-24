import type { ActivityCategory } from "@/lib/platform/types";

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
