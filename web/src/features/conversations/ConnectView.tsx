import { useState } from "react";
import { UserPlus, Loader2, User as UserIcon, X, Check } from "lucide-react";
import { useRequestConnectionMutation } from "@/api/conversationsApi";
import { useLazyLookupUserQuery } from "@/api/usersApi";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types";

export function ConnectView() {
  const [connectionId, setConnectionId] = useState("");
  const [error, setError] = useState("");
  const [foundUser, setFoundUser] = useState<User | null>(null);

  const [lookupUser, { isLoading: isLookingUp }] = useLazyLookupUserQuery();
  const [requestConnection, { isLoading: isConnecting }] =
    useRequestConnectionMutation();

  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFoundUser(null);

    if (!connectionId.trim()) return;

    try {
      const user = await lookupUser(connectionId.trim()).unwrap();
      setFoundUser(user);
    } catch (err: any) {
      console.error("Lookup failed:", err);
      setError(err.data?.message || "User not found");
    }
  };

  const handleConnect = async () => {
    if (!foundUser || !foundUser.connectionId) return;
    try {
      const conversation = await requestConnection({
        targetConnectionId: foundUser.connectionId,
      }).unwrap();

      navigate(`/chat/${conversation._id}`);
      setConnectionId("");
      setFoundUser(null);
    } catch (err: any) {
      console.error("Connection failed:", err);
      setError(err.data?.message || "Failed to connect");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <UserPlus className="text-indigo-500" size={20} />
        </div>
        <h2 className="text-lg font-bold text-white">Add Connection</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!foundUser ? (
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Connection ID
              </label>
              <input
                type="text"
                value={connectionId}
                onChange={(e) => setConnectionId(e.target.value)}
                placeholder="e.g. omnipresent678"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                autoFocus
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLookingUp || !connectionId.trim()}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLookingUp ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Searching...
                </>
              ) : (
                "Search User"
              )}
            </button>
          </form>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg animation-fade-in">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-indigo-500/30">
                {foundUser.avatarUrl ? (
                  <img
                    src={foundUser.avatarUrl}
                    alt={foundUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={40} className="text-gray-400" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {foundUser.displayName}
                </h3>
                <p className="text-sm text-indigo-400 font-mono">
                  @{foundUser.connectionId}
                </p>
              </div>

              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={() => setFoundUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      Connect <Check size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
            )}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          Enter a unique Connection ID to find and add users.
        </div>
      </div>
    </div>
  );
}
