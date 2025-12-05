import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChatArea } from "@/components/layout/ChatArea";
import { MessageList } from "@/features/chat/components/MessageList";
import { MessageInput } from "@/features/chat/components/MessageInput";
// import { useConversationSocket } from '@/hooks/useConversationSocket'; // TODO: Create this hook
import type { RootState } from "@/app/store";
import type { UIMessage } from "@/types";
import { User } from "lucide-react";

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [replyingTo, setReplyingTo] = useState<UIMessage | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const conversation = useSelector((state: RootState) =>
    state.conversations.conversations.find((c) => c._id === conversationId)
  );

  // TODO: Use specific selector for conversation messages
  const messages = useSelector(
    (state: RootState) => state.chat.messages[conversationId || ""] || []
  );

  // TODO: Implement typing indicators for DMs
  const typingUsers: string[] = [];
  const typingUserNames = {};

  // TODO: Connect to socket for this conversation
  // useConversationSocket({ conversationId });

  const otherParticipant = conversation?.participants.find(
    (p) => p._id !== user?.id
  );

  return (
    <ChatArea
      header={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            {otherParticipant?.avatarUrl ? (
              <img
                src={otherParticipant.avatarUrl}
                alt={otherParticipant.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} className="text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-100">
              {otherParticipant?.displayName || "Unknown User"}
            </h2>
            {/* Online status could go here */}
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            typingUserIds={typingUsers}
            typingUserNames={typingUserNames}
            isLoading={false} // TODO: Add loading state
            onReply={setReplyingTo}
          />
        </div>
        <MessageInput
          roomId={conversationId || ""} // MessageInput might need refactoring to support conversationId vs roomId
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          isDm={true} // Add this prop to MessageInput if needed, or just handle it internally
        />
      </div>
    </ChatArea>
  );
}
