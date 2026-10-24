import { isPlatformEnabled } from "@/lib/demo-flag";
import { jsonError } from "@/lib/platform/http";

export function demoApiGuard() {
  if (!isPlatformEnabled()) return jsonError("Not found.", 404);
  return null;
}
