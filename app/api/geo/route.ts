import { type NextRequest } from "next/server";
import { locatePostcode } from "@/lib/platform/geo";
import { corsPreflight, jsonError, jsonOk } from "@/lib/platform/http";

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get("postcode") ?? "";
  const located = await locatePostcode(postcode);
  if (!located) {
    return jsonError("We couldn't place that postcode.", 404);
  }
  return jsonOk(located);
}

export function OPTIONS() {
  return corsPreflight();
}
