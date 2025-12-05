import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { User, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
// TODO: Import API for searching users and creating conversation

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal = ({ isOpen, onClose }: NewChatModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]); // Replace any with User type
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      // TODO: Implement search API call
      // For now, mock it
      setIsLoading(true);
      setTimeout(() => {
        setSearchResults([
          { _id: "1", displayName: "Alice", email: "alice@example.com" },
          { _id: "2", displayName: "Bob", email: "bob@example.com" },
        ]);
        setIsLoading(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleStartChat = async (userId: string) => {
    // TODO: Implement create conversation API call
    console.log("Starting chat with:", userId);
    // const conversation = await createConversation(userId);
    // dispatch(addConversation(conversation));
    // navigate(`/chat/${conversation._id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-100">New Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => handleStartChat(user._id)}
                className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-100">
                    {user.displayName}
                  </h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ))
          ) : searchQuery.length > 2 ? (
            <div className="p-4 text-center text-gray-500">No users found</div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Type to search for people
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
