"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Club } from "@/data/clubs";
import { offerColor } from "@/lib/search";

const SOUTHAMPTON: L.LatLngExpression = [50.9097, -1.4044];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default function ClubsMap({
  listings,
  selectedSlug,
  detailBasePath,
  onSelect,
}: {
  listings: Club[];
  selectedSlug?: string | null;
  detailBasePath: string;
  onSelect?: (slug: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
    }).setView(SOUTHAMPTON, 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const resize = () => map.invalidateSize();
    requestAnimationFrame(resize);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;

    group.clearLayers();

    for (const listing of listings) {
      const selected = listing.slug === selectedSlug;
      const color = offerColor(listing.offer);
      const marker = L.circleMarker([listing.lat, listing.lng], {
        radius: selected ? 12 : 9,
        color,
        fillColor: color,
        fillOpacity: selected ? 1 : 0.88,
        weight: selected ? 3 : 2,
      });

      marker.bindPopup(
        `<strong>${escapeHtml(listing.name)}</strong><br/>${escapeHtml(listing.venue)}<br/><a href="${detailBasePath}/${listing.slug}">View listing</a>`,
      );
      marker.on("click", () => onSelectRef.current?.(listing.slug));
      marker.addTo(group);
    }

    if (listings.length === 0) {
      map.setView(SOUTHAMPTON, 12);
    } else if (listings.length === 1) {
      map.setView([listings[0].lat, listings[0].lng], 14);
    } else {
      map.fitBounds(
        L.latLngBounds(listings.map((listing) => [listing.lat, listing.lng])),
        { padding: [36, 36], maxZoom: 14 },
      );
    }

    requestAnimationFrame(() => map.invalidateSize());
  }, [listings, selectedSlug, detailBasePath]);

  return <div ref={containerRef} className="leaflet-host" />;
}
