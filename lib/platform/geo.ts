import { postcodeDistrict } from "@/lib/search";

export type GeoPoint = { lat: number; lng: number };

export type GeoLocate = GeoPoint & {
  postcode: string;
  district: string;
  source: "lookup" | "district";
};

const DISTRICT_CENTROIDS: Record<string, GeoPoint> = {
  SO14: { lat: 50.902, lng: -1.404 },
  SO15: { lat: 50.913, lng: -1.427 },
  SO16: { lat: 50.934, lng: -1.445 },
  SO17: { lat: 50.927, lng: -1.396 },
  SO18: { lat: 50.917, lng: -1.351 },
  SO19: { lat: 50.896, lng: -1.376 },
  SO30: { lat: 50.917, lng: -1.3 },
  SO31: { lat: 50.87, lng: -1.3 },
  SO40: { lat: 50.92, lng: -1.48 },
  SO45: { lat: 50.82, lng: -1.4 },
  SO50: { lat: 50.967, lng: -1.35 },
  SO53: { lat: 50.98, lng: -1.38 },
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function milesBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const earthMiles = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function districtCentroid(postcode: string) {
  return DISTRICT_CENTROIDS[postcodeDistrict(postcode)] ?? null;
}

export function normalisePostcode(postcode: string) {
  return postcode.trim().toUpperCase().replace(/\s+/g, " ");
}

export function formatMiles(miles: number) {
  const rounded = Math.round(miles * 10) / 10;
  if (rounded === 1) return "1 mile";
  if (Number.isInteger(rounded)) return `${rounded} miles`;
  return `${rounded.toFixed(1)} miles`;
}

export function withDistances<T extends GeoPoint & { distanceMiles: number }>(
  listings: T[],
  origin: GeoPoint,
): T[] {
  return listings.map((item) => ({
    ...item,
    distanceMiles: Math.round(milesBetween(origin, item) * 10) / 10,
  }));
}

const locateCache = new Map<string, GeoLocate | null>();

function pointFromLookup(body: unknown): GeoPoint | null {
  if (!body || typeof body !== "object") return null;
  const result = (body as { result?: { latitude?: unknown; longitude?: unknown } }).result;
  if (typeof result?.latitude !== "number" || typeof result?.longitude !== "number") {
    return null;
  }
  return { lat: result.latitude, lng: result.longitude };
}

export async function locatePostcode(
  postcode: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GeoLocate | null> {
  const compact = normalisePostcode(postcode);
  if (compact.length < 2) return null;
  if (locateCache.has(compact)) return locateCache.get(compact) ?? null;

  const district = postcodeDistrict(compact);
  const unit = compact.replace(/\s+/g, "");

  try {
    const unitResponse = await fetchImpl(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(unit)}`,
    );
    const unitPoint = unitResponse.ok ? pointFromLookup(await unitResponse.json()) : null;
    if (unitPoint) {
      const located: GeoLocate = {
        ...unitPoint,
        postcode: compact,
        district,
        source: "lookup",
      };
      locateCache.set(compact, located);
      return located;
    }

    if (district) {
      const outcodeResponse = await fetchImpl(
        `https://api.postcodes.io/outcodes/${encodeURIComponent(district)}`,
      );
      const outPoint = outcodeResponse.ok ? pointFromLookup(await outcodeResponse.json()) : null;
      if (outPoint) {
        const located: GeoLocate = {
          ...outPoint,
          postcode: compact,
          district,
          source: "lookup",
        };
        locateCache.set(compact, located);
        return located;
      }
    }
  } catch {
    // Fall through to the Hampshire district table when the lookup is offline.
  }

  const fallback = districtCentroid(compact);
  if (fallback) {
    const located: GeoLocate = {
      ...fallback,
      postcode: compact,
      district,
      source: "district",
    };
    locateCache.set(compact, located);
    return located;
  }

  locateCache.set(compact, null);
  return null;
}

export function adultInNotifyRadius(
  postcode: string,
  org: { lat: number; lng: number; notifyRadiusMiles?: number },
) {
  const point =
    locateCache.get(normalisePostcode(postcode)) ?? districtCentroid(postcode);
  if (!point) return false;
  const radius = org.notifyRadiusMiles ?? 5;
  return milesBetween(point, org) <= radius;
}
