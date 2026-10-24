import { Suspense } from "react";
import { PlayClient } from "./PlayClient";

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="page-shell clubs-header">Loading play…</div>}>
      <PlayClient />
    </Suspense>
  );
}
