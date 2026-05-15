import { useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
  Libraries,
} from "@react-google-maps/api";
import { useGoogleMapsKey } from "@/hooks/useGoogleMapsKey";
import { useState } from "react";
import StaticMap from "@/components/StaticMap";
import vanPng from "@/assets/van.png";

interface MapSchedule {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  latitude: number | null;
  longitude: number | null;
  van_name: string;
}

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "0.75rem",
};
const LIBRARIES: Libraries = ["places"];
const LUSAKA = { lat: -15.4167, lng: 28.2833 };

const VanLocationsMap = ({ schedules }: { schedules: MapSchedule[] }) => {
  const { data: apiKey, isLoading } = useGoogleMapsKey();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
    libraries: LIBRARIES,
  });
  const preferStatic = import.meta.env.VITE_PREFER_STATIC_MAP === "true";
  const [selected, setSelected] = useState<string | null>(null);

  const points = useMemo(
    () => schedules.filter((s) => s.latitude != null && s.longitude != null),
    [schedules],
  );

  const center = points[0]
    ? { lat: Number(points[0].latitude), lng: Number(points[0].longitude) }
    : LUSAKA;

  if (isLoading || !isLoaded) {
    return (
      <div className="h-[500px] rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground">
        Loading map…
      </div>
    );
  }

  if (points.length === 0) {
    console.log("sample schedule:", schedules?.[0]);
    console.log("No valid map points found. Schedules:", schedules);
    return (
      <div className="h-[500px] rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground p-6 text-center">
        No mapped locations yet. The owner can add coordinates from the
        dashboard.
      </div>
    );
  }
  if (preferStatic) {
    const markers = points.map((s) => ({
      lat: Number(s.latitude),
      lng: Number(s.longitude),
      label: s.van_name,
    }));
    // prefer google.maps.LatLngLiteral; fallback to a plain {lat,lng} shape if types not available
    const mapCenter: google.maps.LatLngLiteral = {
      lat: Number(center.lat),
      lng: Number(center.lng),
    };
    return (
      <div style={{ height: 500 }}>
        <StaticMap
          center={mapCenter}
          markers={markers}
          width={1200}
          height={500}
        />
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
      {points.map((s) => {
        // Prefer a scaled icon so the van markers aren't huge. Build an
        // `Icon`-shaped object at runtime; cast to `google.maps.Icon` to
        // satisfy the Marker prop types. We avoid `any` casts to keep lint
        // happy.
        const mapsGlobal =
          typeof window !== "undefined"
            ? (window as unknown as { google?: { maps?: unknown } }).google?.maps || null
            : null;

        let icon: string | google.maps.Icon = vanPng;
        if (mapsGlobal) {
          // Use plain object shapes for scaledSize/anchor and cast — this
          // works at runtime and keeps TypeScript happy without `any`.
          icon = {
            url: vanPng,
            scaledSize: { width: 56, height: 56 },
            anchor: { x: 24, y: 24 },
          } as unknown as google.maps.Icon;
        }

        return (
          <Marker
            key={s.id}
            position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
            onClick={() => setSelected(s.id)}
            icon={icon}
          >
          {selected === s.id && (
            <InfoWindow onCloseClick={() => setSelected(null)}>
              <div style={{ minWidth: 180 }}>
                <strong>{s.van_name}</strong>
                <div>{s.location}</div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {s.start_time} – {s.end_time}
                </div>
                <a
                  style={{ color: "#2563eb", fontSize: 12 }}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </a>
              </div>
            </InfoWindow>
          )}
        </Marker>
      );
      })}
    </GoogleMap>
  );
};

export default VanLocationsMap;
