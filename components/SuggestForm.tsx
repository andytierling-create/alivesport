"use client";

import { useState } from "react";
import { saveSuggestion } from "@/lib/suggestions";

export function SuggestForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="hero-sub" style={{ marginTop: 0 }}>
        Thanks. That name is saved in this browser for now. When the live inbox
        is ready, we&apos;ll chase them. If they&apos;re already on a list we
        haven&apos;t published yet, this bumps them up.
      </p>
    );
  }

  return (
    <form
      className="search-bar"
      style={{ flexDirection: "column", transform: "none", maxWidth: 560 }}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        saveSuggestion({
          name: String(form.get("name") || ""),
          area: String(form.get("area") || ""),
          contact: String(form.get("contact") || ""),
        });
        setSent(true);
      }}
    >
      <label className="search-field" style={{ borderRight: 0 }}>
        <span className="field-label">Club name</span>
        <input name="name" required placeholder="Solent Netball" />
      </label>
      <label className="search-field" style={{ borderRight: 0 }}>
        <span className="field-label">Area</span>
        <input name="area" required placeholder="Woolston, SO19" />
      </label>
      <label className="search-field" style={{ borderRight: 0 }}>
        <span className="field-label">Optional contact</span>
        <input name="contact" placeholder="A phone, email or Facebook page" />
      </label>
      <button className="btn-gradient" type="submit" style={{ alignSelf: "flex-start" }}>
        Send the name
      </button>
    </form>
  );
}
