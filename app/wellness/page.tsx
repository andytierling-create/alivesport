import type { Metadata } from "next";
import { Suspense } from "react";
import { ClubsExplorer } from "@/components/ClubsExplorer";
import { wellness } from "@/data/wellness";

export const metadata: Metadata = {
  title: "Wellness",
};

export default function WellnessPage() {
  return (
    <div className="page-shell">
      <Suspense fallback={<div className="clubs-header">Loading wellness…</div>}>
        <ClubsExplorer
          listings={wellness}
          heading="Find your passion near"
          noun="venue"
          detailBasePath="/wellness"
          suggestNoun="gym or class"
        />
      </Suspense>
    </div>
  );
}
