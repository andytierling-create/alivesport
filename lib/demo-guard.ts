import { redirect } from "next/navigation";
import { isDemoEnabled } from "@/lib/demo-flag";

export function requireDemo() {
  if (!isDemoEnabled()) redirect("/");
}
