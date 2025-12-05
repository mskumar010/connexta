import { useState } from "react";
import { useGetRoomsQuery, useJoinRoomMutation } from "@/api/roomsApi";
import { Search, Hash, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";

export function RoomDiscoveryView() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: rooms, isLoading } = useGetRoomsQuery();
  const [joinRoom, { isLoading: isJoining }] = useJoinRoomMutation();

  // Filter out already joined rooms
  const discoverableRooms =
    rooms?.filter((room) => !room.members.includes(user?._id || "")) || [];

  const filteredRooms = discoverableRooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If no search, show top 2 (or all if few).
  // User requested "by default show 2 channels".
  const displayRooms = searchTerm ? filteredRooms : filteredRooms.slice(0, 2);

  const handleJoin = async (roomId: string) => {
    try {
      await joinRoom(roomId).unwrap();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-secondary)]">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Find communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayRooms.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            <p>No rooms found.</p>
          </div>
        ) : (
          displayRooms.map((room) => (
            <div
              key={room._id}
              className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 flex items-center justify-between hover:border-gray-700 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Hash size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-100 mb-0.5">
                    {room.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {room.members.length} members
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleJoin(room._id)}
                disabled={isJoining}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-indigo-600 text-white rounded-lg transition-colors opacity-80 group-hover:opacity-100"
              >
                Join
              </button>
            </div>
          ))
        )}

        {!searchTerm && discoverableRooms.length > 2 && (
          <div className="text-center pt-2">
            <button
              onClick={() => setSearchTerm(" ")} // Hack to show all? Or just text saying "Search to see more"
              className="text-xs text-indigo-400 hover:underline"
            >
              Search to see more rooms...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
