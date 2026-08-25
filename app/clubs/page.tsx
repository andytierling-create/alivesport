import type { Metadata } from "next";
import { Suspense } from "react";
import { ClubsExplorer } from "@/components/ClubsExplorer";

export const metadata: Metadata = {
  title: "Find a club",
};

export default function ClubsPage() {
  return (
    <div className="page-shell">
      <Suspense fallback={<div className="clubs-header">Loading clubs…</div>}>
        <ClubsExplorer />
      </Suspense>
    </div>
  );
}
