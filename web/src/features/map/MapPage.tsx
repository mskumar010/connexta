import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl,
} from "react-leaflet";
import { useGetUsersQuery, useUpdateLocationMutation } from "@/api/usersApi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RootState } from "@/app/store";
import { MapPin, Loader2, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

// Use same icon fix as LocationMessage
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
}) as any;

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Hook to fly to location
function LocationFlyTo({
  coords,
}: {
  coords: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo([coords.latitude, coords.longitude], 13, {
        duration: 1.5,
      });
    }
  }, [coords, map]);
  return null;
}

export const MapPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: users, isLoading } = useGetUsersQuery();
  const [updateLocation, { isLoading: isUpdating }] =
    useUpdateLocationMutation();
  const [searchParams] = useSearchParams();
  const focusedUserId = searchParams.get("focus");
  const { actualTheme } = useTheme();

  const [myCoords, setMyCoords] = useState<{ lat: number; lng: number } | null>(
    user?.lastLocation
      ? { lat: user.lastLocation.latitude, lng: user.lastLocation.longitude }
      : null
  );

  const cartoUrl =
    actualTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const handlePinMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.loading("Getting location...", { id: "geo" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMyCoords({ lat: latitude, lng: longitude });

        try {
          await updateLocation({ latitude, longitude }).unwrap();
          toast.success("Location pinned!", { id: "geo" });
        } catch (error) {
          console.error("Failed to update location", error);
          toast.error("Failed to save location", { id: "geo" });
        }
      },
      (error) => {
        console.error("Geo error", error);
        toast.error("Unable to retrieve your location", { id: "geo" });
      }
    );
  };

  const defaultCenter = { lat: 20, lng: 0 }; // World view
  const center = myCoords || defaultCenter;

  return (
    <div className="flex h-full w-full bg-[var(--color-bg-primary)] relative">
      {/* Map Area */}
      <div className="flex-1 relative z-0 h-full w-full">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={myCoords ? 13 : 3}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <LayersControl position="topright">
            {/* Adaptive Layer (Default) */}
            <LayersControl.BaseLayer checked name="Adaptive (Theme)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={cartoUrl}
              />
            </LayersControl.BaseLayer>

            {/* Satellite */}
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            {/* Explicit Light */}
            <LayersControl.BaseLayer name="Light (Clean)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>

            {/* Explicit Dark */}
            <LayersControl.BaseLayer name="Dark (Clean)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Render Markers */}
          {users?.map((u) => {
            if (!u.lastLocation) return null;
            const isMe = u._id === user?._id;

            return (
              <Marker
                key={u._id}
                position={[u.lastLocation.latitude, u.lastLocation.longitude]}
                zIndexOffset={isMe ? 1000 : 0}
              >
                <Popup className="glass-popup">
                  <div className="text-center min-w-[120px]">
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 overflow-hidden border-2 border-[var(--color-brand-primary)]">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white font-bold">
                          {u.displayName[0]}
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-gray-800">
                      {u.displayName} {isMe && "(You)"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(u.lastLocation.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Fly to selected user */}
          <MapController selectedUserId={focusedUserId} users={users} />

          {/* Fly to me initially if coords exist and no focus */}
          {myCoords && !focusedUserId && (
            <LocationFlyTo
              coords={{ latitude: myCoords.lat, longitude: myCoords.lng }}
            />
          )}
        </MapContainer>

        {/* FAB: Pin Me - Floating Action Button */}
        <div className="absolute bottom-8 right-8 z-[1000]">
          <button
            onClick={handlePinMe}
            disabled={isUpdating}
            className="w-14 h-14 bg-[var(--color-brand-primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-4 border-black/20"
            title="Pin My Location"
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <MapPin size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component to handle map movements
function MapController({
  selectedUserId,
  users,
}: {
  selectedUserId: string | null;
  users: any[] | undefined;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedUserId && users) {
      const user = users.find((u) => u._id === selectedUserId);
      if (user?.lastLocation) {
        map.flyTo(
          [user.lastLocation.latitude, user.lastLocation.longitude],
          15,
          { duration: 1.5 }
        );
      }
    }
  }, [selectedUserId, users, map]);

  return null;
}
