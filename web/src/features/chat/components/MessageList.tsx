import { useEffect, useRef, useMemo } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useSelector } from "react-redux";
import { MessageItem } from "@/features/chat/components/MessageItem";
import { TypingIndicator } from "@/features/chat/components/TypingIndicator";
import { MessageListSkeleton } from "@/features/chat/components/MessageListSkeleton";
import type { UIMessage } from "@/types";
import type { RootState } from "@/app/store";

interface MessageListProps {
  messages: UIMessage[];
  typingUserIds: string[];
  typingUserNames: { [userId: string]: string };
  isLoading?: boolean;
  onReply?: (message: UIMessage) => void;
  isDm?: boolean;
}

export function MessageList({
  messages,
  typingUserIds,
  typingUserNames,
  isLoading,
  onReply,
  isDm = false,
}: MessageListProps) {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  // Linearize and sort messages by time
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (virtuosoRef.current && messages.length > 0) {
      // Debounce slightly to ensure rendering is done
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index: sortedMessages.length - 1,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages.length, sortedMessages.length]);

  const typingNames = typingUserIds
    .map((id) => typingUserNames[id])
    .filter(Boolean);

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0 && typingNames.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p style={{ color: "var(--color-text-tertiary)" }}>No messages yet</p>
          <p
            className="text-sm"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Start the conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      <Virtuoso
        ref={virtuosoRef}
        data={sortedMessages}
        itemContent={(_index, message) => {
          const isMe = user?._id === message.sender.id;
          return (
            <MessageItem
              key={message.id}
              message={message}
              isMe={isMe}
              onReply={onReply}
              isDm={isDm}
            />
          );
        }}
        initialTopMostItemIndex={sortedMessages.length - 1}
        alignToBottom
        followOutput="smooth"
        className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        style={{ height: "100%" }}
      />
      {typingNames.length > 0 && <TypingIndicator userNames={typingNames} />}
    </div>
  );
}
