import type { Metadata } from "next";
import { SuggestForm } from "@/components/SuggestForm";

export const metadata: Metadata = {
  title: "Suggest a club",
};

export default function SuggestPage() {
  return (
    <div className="page-shell">
      <section className="indent" style={{ paddingTop: 74, paddingBottom: 120, maxWidth: 720 }}>
        <div className="eyebrow">One line is enough</div>
        <h1 className="display h1-clubs">Know a club that should be on here?</h1>
        <p className="hero-sub">
          Tell us the name and the area. We&apos;ll do the chasing. No account,
          and we won&apos;t add a listing until someone at the club says yes.
        </p>
        <SuggestForm />
      </section>
    </div>
  );
}
