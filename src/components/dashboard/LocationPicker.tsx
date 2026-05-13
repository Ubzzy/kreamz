import { useEffect, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { useGoogleMapsKey } from "@/hooks/useGoogleMapsKey";
import { Input } from "@/components/ui/input";

const LIBRARIES: ("places")[] = ["places"];

interface Props {
  value: string;
  onChange: (loc: { location: string; lat: number | null; lng: number | null }) => void;
  placeholder?: string;
}

const LocationPicker = ({ value, onChange, placeholder }: Props) => {
  const { data: apiKey } = useGoogleMapsKey();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
    libraries: LIBRARIES,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || acRef.current) return;
    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "zm" },
      fields: ["formatted_address", "geometry", "name"],
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      onChange({
        location: place.formatted_address || place.name || inputRef.current?.value || "",
        lat: loc ? loc.lat() : null,
        lng: loc ? loc.lng() : null,
      });
    });
    acRef.current = ac;
  }, [isLoaded, onChange]);

  return (
    <Input
      ref={inputRef}
      defaultValue={value}
      placeholder={placeholder ?? "Search for a place in Zambia"}
      onChange={(e) => onChange({ location: e.target.value, lat: null, lng: null })}
    />
  );
};

export default LocationPicker;
