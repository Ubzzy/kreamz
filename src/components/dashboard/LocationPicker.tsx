import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useGoogleMapsKey } from "@/hooks/useGoogleMapsKey";
import { Input } from "@/components/ui/input";

const LIBRARIES: ("places")[] = ["places"];
const LUSAKA = { lat: -15.4167, lng: 28.2833 };
const mapStyle = { width: "100%", height: "260px", borderRadius: "0.5rem" };

interface Props {
  value: string;
  onChange: (loc: { location: string; lat: number | null; lng: number | null }) => void;
  placeholder?: string;
  lat?: number | null;
  lng?: number | null;
}

const LocationPicker = ({ value, onChange, placeholder, lat, lng }: Props) => {
  const { data: apiKey } = useGoogleMapsKey();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
    libraries: LIBRARIES,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null
  );

  useEffect(() => {
    if (!isLoaded || !inputRef.current || acRef.current) return;
    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "zm" },
      fields: ["formatted_address", "geometry", "name"],
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      const next = loc ? { lat: loc.lat(), lng: loc.lng() } : null;
      if (next) setMarker(next);
      onChange({
        location: place.formatted_address || place.name || inputRef.current?.value || "",
        lat: next?.lat ?? null,
        lng: next?.lng ?? null,
      });
    });
    acRef.current = ac;
  }, [isLoaded, onChange]);

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const next = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setMarker(next);
    let address = `${next.lat.toFixed(5)}, ${next.lng.toFixed(5)}`;
    try {
      const geocoder = new google.maps.Geocoder();
      const res = await geocoder.geocode({ location: next });
      if (res.results[0]?.formatted_address) address = res.results[0].formatted_address;
    } catch {
      // keep coord-string fallback
    }
    if (inputRef.current) inputRef.current.value = address;
    onChange({ location: address, lat: next.lat, lng: next.lng });
  };

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        defaultValue={value}
        placeholder={placeholder ?? "Search for a place in Zambia"}
        onChange={(e) => onChange({ location: e.target.value, lat: null, lng: null })}
      />
      {isLoaded ? (
        <>
          <GoogleMap
            mapContainerStyle={mapStyle}
            center={marker ?? LUSAKA}
            zoom={marker ? 14 : 11}
            onClick={handleMapClick}
            options={{ streetViewControl: false, mapTypeControl: false }}
          >
            {marker && <Marker position={marker} draggable onDragEnd={handleMapClick} />}
          </GoogleMap>
          <p className="text-xs text-muted-foreground">
            Tip: search above or click the map to drop a pin.
          </p>
        </>
      ) : (
        <div className="h-[260px] rounded-md bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
          Loading map…
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
