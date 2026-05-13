import { useMemo } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";
import { useGoogleMapsKey } from "@/hooks/useGoogleMapsKey";
import { useState } from "react";

interface MapSchedule {
  id: string;
  location: string;
  start_time: string;
  end_time: string;
  latitude: number | null;
  longitude: number | null;
  van_name: string;
}

const containerStyle = { width: "100%", height: "500px", borderRadius: "0.75rem" };
const LUSAKA = { lat: -15.4167, lng: 28.2833 };

const VanLocationsMap = ({ schedules }: { schedules: MapSchedule[] }) => {
  const { data: apiKey, isLoading } = useGoogleMapsKey();
  const { isLoaded } = useLoadScript({ googleMapsApiKey: apiKey ?? "" });
  const [selected, setSelected] = useState<string | null>(null);

  const points = useMemo(
    () => schedules.filter((s) => s.latitude != null && s.longitude != null),
    [schedules]
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
    return (
      <div className="h-[500px] rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground p-6 text-center">
        No mapped locations yet. The owner can add coordinates from the dashboard.
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
      {points.map((s) => (
        <Marker
          key={s.id}
          position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
          onClick={() => setSelected(s.id)}
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
      ))}
    </GoogleMap>
  );
};

export default VanLocationsMap;