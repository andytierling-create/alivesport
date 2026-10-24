import { redirect } from "next/navigation";
import { isPlatformEnabled } from "@/lib/demo-flag";

export function requireDemo() {
  if (!isPlatformEnabled()) redirect("/");
}
