import { useGetRoomsQuery } from "@/api/roomsApi";
import { useNavigate } from "react-router-dom";
import { Hash } from "lucide-react";

export function RoomsPage() {
  const { data: rooms, isLoading } = useGetRoomsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading rooms...</div>
    );
  }

  return (
    <div className="flex-1 h-full bg-gray-950 p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Discover Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms?.map((room) => (
          <div
            key={room._id}
            onClick={() => navigate(`/room/${room._id}`)}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-indigo-500 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                <Hash size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100">{room.name}</h3>
                <p className="text-xs text-gray-500">
                  {room.members.length} members
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">
              {room.description || "No description"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
