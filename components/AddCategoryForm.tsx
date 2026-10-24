"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddCategoryForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <form
      className="desk-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formEl = event.currentTarget;
        const form = new FormData(formEl);
        setError("");
        void fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: String(form.get("label") ?? "") }),
        })
          .then(async (response) => {
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
              throw new Error(data.error || "Could not add that category.");
            }
            formEl.reset();
            router.refresh();
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Could not add that category.");
          });
      }}
    >
      <label className="search-field">
        <span className="field-label">New label</span>
        <input name="label" required placeholder="Martial arts" />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn-gradient" type="submit">
        Add category
      </button>
    </form>
  );
}
