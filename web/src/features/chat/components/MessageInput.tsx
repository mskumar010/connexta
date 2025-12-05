import { useState, useRef, useEffect, Fragment } from "react";
import {
  Send,
  X,
  MapPin,
  Paperclip,
  Image,
  Mic,
  BarChart2,
  Video,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/common/Button";
import { useSocket } from "@/hooks/useSocket";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { addMessage } from "@/features/chat/chatSlice";
import { useDispatch } from "react-redux";
import { generateTempId } from "@/lib/utils";
import type { AppDispatch } from "@/app/store";
import type { UIMessage } from "@/types";
import { Menu, Transition } from "@headlessui/react";

interface MessageInputProps {
  roomId: string;
  replyingTo?: UIMessage | null;
  onCancelReply?: () => void;
  isDm?: boolean;
}

export function MessageInput({
  roomId,
  replyingTo,
  onCancelReply,
  isDm,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const socket = useSocket();

  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    if (!socket && roomId !== "welcome") {
      toast.error("Connection lost. Reconnecting...");
      return;
    }

    setIsSharingLocation(true);
    // Expand attachments automatically closes on selection usually, or we can close it
    setShowAttachments(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const tempId = generateTempId();

        // Optimistic update
        const optimisticMessage: any = {
          id: tempId,
          roomId,
          sender: {
            id: user?._id || "unknown",
            displayName: user?.displayName || "Unknown",
            avatarUrl: user?.avatarUrl,
          },
          text: "Shared a location",
          type: "location" as const,
          location: { latitude, longitude },
          createdAt: new Date().toISOString(),
          isMine: true,
          isOptimistic: true,
        };

        dispatch(addMessage({ roomId, message: optimisticMessage }));

        // Send via socket
        if (roomId !== "welcome") {
          // @ts-ignore
          socket?.emit("message:send", {
            roomId,
            text: "Shared a location",
            type: "location",
            location: { latitude, longitude },
            tempId,
          });
        }

        setIsSharingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get location");
        setIsSharingLocation(false);
      }
    );
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Typing indicator
    if (value.trim() && !isTyping && roomId !== "welcome") {
      setIsTyping(true);
      if (isDm) {
        socket?.emit("conversation:typing", {
          conversationId: roomId,
          isTyping: true,
        });
      } else {
        socket?.emit("typing:start", { roomId });
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (roomId !== "welcome") {
        socket?.emit("typing:stop", { roomId });
      }
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    if (!socket && roomId !== "welcome") {
      toast.error("Connection lost. Reconnecting...");
      return;
    }

    if (!user) return;

    const tempId = generateTempId();
    const messageText = text.trim();

    // Optimistic update
    const optimisticMessage = {
      id: tempId,
      roomId,
      sender: {
        id: user._id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      text: messageText,
      type: "text" as const,
      createdAt: new Date().toISOString(),
      isMine: true,
      isOptimistic: true,
      parentId: replyingTo?.id,
    };

    dispatch(addMessage({ roomId, message: optimisticMessage }));

    // Send via socket
    if (roomId !== "welcome") {
      if (isDm) {
        socket?.emit("message:dm", {
          conversationId: roomId,
          text: messageText,
          tempId,
        });
      } else {
        socket?.emit("message:send", {
          roomId,
          text: messageText,
          tempId,
          parentId: replyingTo?.id,
        });
      }
    }

    // Clear input and reply state
    setText("");
    if (onCancelReply) onCancelReply();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      if (roomId !== "welcome") {
        if (isDm) {
          socket?.emit("conversation:typing", {
            conversationId: roomId,
            isTyping: false,
          });
        } else {
          socket?.emit("typing:stop", { roomId });
        }
      }
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && replyingTo && onCancelReply) {
      onCancelReply();
    }
  };

  return (
    <div
      className="border-t bg-[var(--color-bg-secondary)]"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Attachments Horizontal Bar - Redesigned Card Style */}
      <Transition
        show={showAttachments}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 -translate-y-2"
        enterTo="transform opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 translate-y-0"
        leaveTo="transform opacity-0 -translate-y-2"
      >
        <div className="absolute bottom-20 left-4 z-40 bg-[var(--color-bg-secondary)] border border-white/10 shadow-2xl rounded-2xl p-2 flex gap-2">
          {/* Card Items */}
          <button
            onClick={handleSendLocation}
            disabled={isSharingLocation}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white/5 transition-colors gap-1"
          >
            <div className="p-2 rounded-full bg-green-500/20 text-green-500">
              {isSharingLocation ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <MapPin size={20} />
              )}
            </div>
            <span className="text-[10px] font-medium text-gray-400">
              Location
            </span>
          </button>

          <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white/5 transition-colors gap-1">
            <div className="p-2 rounded-full bg-purple-500/20 text-purple-500">
              <Image size={20} />
            </div>
            <span className="text-[10px] font-medium text-gray-400">Photo</span>
          </button>

          <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white/5 transition-colors gap-1">
            <div className="p-2 rounded-full bg-pink-500/20 text-pink-500">
              <Video size={20} />
            </div>
            <span className="text-[10px] font-medium text-gray-400">Video</span>
          </button>

          <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white/5 transition-colors gap-1">
            <div className="p-2 rounded-full bg-orange-500/20 text-orange-500">
              <Mic size={20} />
            </div>
            <span className="text-[10px] font-medium text-gray-400">Audio</span>
          </button>

          <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white/5 transition-colors gap-1">
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
              <BarChart2 size={20} />
            </div>
            <span className="text-[10px] font-medium text-gray-400">Poll</span>
          </button>
        </div>
      </Transition>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 text-sm border-l-4 border-[var(--color-brand-primary)] bg-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-2 overflow-hidden">
            <span style={{ color: "var(--color-text-secondary)" }}>
              Replying to
            </span>
            <span
              className="font-medium truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {replyingTo.sender.displayName}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 rounded hover:bg-white/10"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Input Area */}
      <div className="p-4 flex items-end gap-2">
        {/* Clip Button (Replacing Map Marker position per req) */}
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className={`p-2 transition-transform duration-200 ${
            showAttachments
              ? "text-[var(--color-brand-accent)] rotate-45"
              : "text-gray-400 hover:text-gray-200"
          }`}
          title="Attachments"
        >
          <Paperclip size={24} />
        </button>

        <div className="flex-1 relative bg-[var(--color-bg-tertiary)] rounded-2xl border border-[var(--color-border)] focus-within:border-[var(--color-brand-primary)] focus-within:ring-1 focus-within:ring-[var(--color-brand-primary)]/50 transition-all flex items-center pr-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              replyingTo ? "Type your reply..." : "Type a message..."
            }
            rows={1}
            className="w-full bg-transparent px-4 py-3 focus:outline-none resize-none max-h-32 text-gray-100 placeholder-gray-500 leading-relaxed"
            style={{
              minHeight: "48px",
            }}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!text.trim()}
          className="rounded-full aspect-square p-0 w-12 h-12 flex items-center justify-center bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white shadow-lg shadow-cyan-900/20"
        >
          <Send className="h-5 w-5 ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
