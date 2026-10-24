import { DemoBanner } from "@/components/DemoBanner";
import { isCategoryAdmin } from "@/lib/platform/family";
import { sessionActor } from "@/lib/platform/session";
import { readPlatform } from "@/lib/platform/store";
import { AddCategoryForm } from "@/components/AddCategoryForm";

export default async function OpsCategoriesPage() {
  const actor = await sessionActor();
  const admin = actor?.role === "adult" && isCategoryAdmin(actor.adult.email);
  const state = await readPlatform();

  return (
    <div className="page-shell">
      <DemoBanner />
      <section className="indent account-hero" style={{ maxWidth: 640 }}>
        <div className="eyebrow">Ops</div>
        <h1 className="display h1-clubs">Activity categories</h1>
        <p className="hero-sub">
          Seeded labels plus any you add. Families and adults pick from this
          list.
        </p>
        {admin ? (
          <AddCategoryForm />
        ) : (
          <p className="form-error">You cannot add categories.</p>
        )}
        <ul className="event-sheet">
          {state.activityCategories.map((category) => (
            <li key={category.id} className="event-row">
              <div>
                <strong>{category.label}</strong>
                <p className="event-notes">{category.slug}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
