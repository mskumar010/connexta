import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/app/store";
import { setConversations, setActiveConversation } from "./conversationsSlice";
import { formatDistanceToNow } from "date-fns";
import { User, MessageCircle } from "lucide-react";
import { useConversationSocket } from "@/hooks/useConversationSocket";

export const ConversationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, activeConversationId } = useSelector(
    (state: RootState) => state.conversations
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useConversationSocket();

  // Fetch conversations on mount (mock for now, replace with API call)
  useEffect(() => {
    // TODO: Fetch from API
  }, [dispatch]);

  const handleSelectConversation = (id: string) => {
    dispatch(setActiveConversation(id));
    navigate(`/chat/${id}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-100">Chats</h2>
        <button
          onClick={() => {
            /* Open New Chat Modal */
            // This should be handled by parent or context
          }}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-gray-100"
        >
          <MessageCircle size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(
            (p) => p._id !== user?.id
          );
          const isActive = conversation._id === activeConversationId;

          return (
            <div
              key={conversation._id}
              onClick={() => handleSelectConversation(conversation._id)}
              className={`p-3 cursor-pointer hover:bg-gray-800 transition-colors ${
                isActive ? "bg-gray-800" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {otherParticipant?.avatarUrl ? (
                    <img
                      src={otherParticipant.avatarUrl}
                      alt={otherParticipant.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-100 truncate">
                      {otherParticipant?.displayName || "Unknown"}
                    </h3>
                    {conversation.lastMessageAt && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(
                          new Date(conversation.lastMessageAt),
                          {
                            addSuffix: true,
                          }
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {conversation.lastMessage?.text || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
