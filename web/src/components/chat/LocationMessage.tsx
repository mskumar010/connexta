import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { UIMessage } from "@/types";

// Fix for default marker icon in React Leaflet
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) as any;

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMessageProps {
  message: UIMessage;
}

export function LocationMessage({ message }: LocationMessageProps) {
  if (message.type !== "location" || !message.location) return null;

  const { latitude, longitude } = message.location;

  return (
    <div className="h-64 w-full max-w-sm rounded-lg overflow-hidden border border-gray-700 z-0 relative">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>{message.sender.displayName}'s Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
