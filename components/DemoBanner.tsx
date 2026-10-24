"use client";

import { useDemo } from "./DemoProvider";

export function DemoBanner() {
  const { resetDemo } = useDemo();

  return (
    <div className="demo-ribbon">
      <span>
        Local mock — accounts and events live in this browser only. Nothing is
        sent to a server.
      </span>
      <button type="button" className="demo-reset" onClick={resetDemo}>
        Reset demo
      </button>
    </div>
  );
}
