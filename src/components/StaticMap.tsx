import React from "react";
import { useGoogleMapsKey } from "@/hooks/useGoogleMapsKey";

interface Marker {
  lat: number | null;
  lng: number | null;
  label?: string;
}

const StaticMap = ({ center, markers, width = 600, height = 300 }: { center?: { lat: number; lng: number }; markers?: Marker[]; width?: number; height?: number }) => {
  const { data: apiKey } = useGoogleMapsKey();
  const key = apiKey ?? "";
  const base = "https://maps.googleapis.com/maps/api/staticmap";
  const params: string[] = [];
  if (center) params.push(`center=${center.lat},${center.lng}`);
  params.push("zoom=12");
  params.push(`size=${width}x${height}`);
  params.push("scale=2");
  const markerParams = (markers ?? [])
    .filter((m) => m.lat != null && m.lng != null)
    .map((m) => `markers=${encodeURIComponent(`${m.lat},${m.lng}`)}`);
  const url = `${base}?${params.concat(markerParams).join("&")}&key=${encodeURIComponent(key)}`;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <img src={url} alt="Map snapshot" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

export default StaticMap;
