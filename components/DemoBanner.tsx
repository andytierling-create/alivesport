"use client";

import { useDemo } from "./DemoProvider";

export function DemoBanner() {
  const { resetDemo } = useDemo();

  return (
    <div className="demo-ribbon">
      <span>
        Local mock — accounts and events live in the API store on this machine.
        Nothing is emailed.
      </span>
      <button
        type="button"
        className="demo-reset"
        onClick={() => {
          void resetDemo().then(() => window.location.assign("/"));
        }}
      >
        Reset demo
      </button>
    </div>
  );
}
