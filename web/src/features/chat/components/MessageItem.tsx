import { useRef, useState, Fragment, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Check,
  CheckCheck,
  Share2,
  MoreVertical,
  Copy,
  Smile,
} from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { Avatar } from "@/components/common/Avatar";
import { formatMessageTime, cn } from "@/lib/utils";
import type { UIMessage } from "@/types";
import { LocationMessage } from "@/components/chat/LocationMessage";

interface MessageItemProps {
  message: UIMessage;
  isMe: boolean;
  onReply?: (message: UIMessage) => void;
  isDm?: boolean;
}

export const MessageItem = memo(function MessageItem({
  message,
  isMe,
  onReply,
  isDm = false,
}: MessageItemProps) {
  if (message.isSystemMessage) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="rounded-full px-4 py-1.5 bg-gray-800/50 border border-gray-700/50">
          <p className="text-xs text-gray-400 font-medium font-mono tracking-tight">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex w-full mb-1 group px-4 hover:bg-white/[0.02] transition-colors py-1 relative",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[70%] gap-3 relative",
          isMe ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar: Show only for others, and if NOT DM (or maybe always for consistently?) 
            User req: "in dm dont need to show sender name... in room keep sender details"
            Let's hide avatar in DM for me, show for them? Or maybe hide for both in DM if it's strictly 1:1 and we know who it is?
            Usually DMs still show avatar for the other person.
        */}
        {!isMe && !isDm && (
          <Link
            to={`/profile/${message.sender?.id || ""}`}
            className="shrink-0 mt-0.5 hover:opacity-80 transition-opacity"
          >
            <Avatar
              src={message.sender.avatarUrl}
              name={message.sender.displayName}
              size="sm"
              className="w-8 h-8 rounded-full shadow-sm"
            />
          </Link>
        )}

        <div
          className={cn(
            "flex flex-col min-w-0 group/bubble relative",
            isMe ? "items-end" : "items-start"
          )}
        >
          {/* ROOM LAYOUT: Header Line (Name + Timestamp) */}
          {!isMe && !isDm && (
            <div className="flex items-center gap-2 mb-1 ml-1 select-none">
              <span className="text-[13px] font-bold text-gray-300">
                {message.sender.displayName}
              </span>
              <span className="text-[10px] text-gray-500">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
          )}

          {/* Message Bubble + Context Menu Trigger */}
          <Menu as="div" className="relative">
            <Menu.Button
              as="div"
              className={cn(
                "relative px-4 py-2 shadow-sm break-words text-sm leading-relaxed max-w-full cursor-pointer transition-all hover:brightness-110 active:scale-[0.99]",
                isMe
                  ? "bg-[var(--color-brand-primary)] text-white rounded-2xl rounded-tr-sm"
                  : "bg-[#2a2a2a] text-gray-100 rounded-2xl rounded-tl-sm border border-[#333]"
              )}
            >
              {message.type === "location" ? (
                <LocationMessage message={message} />
              ) : (
                <p className="whitespace-pre-wrap">{message.text}</p>
              )}

              {/* DM LAYOUT or MY MESSAGE: Timestamp inside/float */}
              {(isMe || isDm) && (
                <div
                  className={cn(
                    "flex items-center gap-1 mt-1 select-none float-right ml-3 translate-y-0.5",
                    isMe ? "text-white/70" : "text-gray-500"
                  )}
                >
                  <span className="text-[10px] tabular-nums">
                    {formatMessageTime(message.createdAt)}
                  </span>
                  {isMe && (
                    <span>
                      {message.isOptimistic ? (
                        <div className="w-3 h-3 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCheck size={14} />
                      )}
                    </span>
                  )}
                </div>
              )}
            </Menu.Button>

            {/* Click Menu (Reply/Forward) */}
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute top-full mt-1 z-50 w-36 rounded-xl bg-gray-800 border border-white/10 shadow-xl backdrop-blur-md focus:outline-none overflow-hidden">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onReply?.(message)}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm flex items-center gap-2",
                        active ? "bg-white/10 text-white" : "text-gray-300"
                      )}
                    >
                      <MessageSquare size={14} /> Reply
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() =>
                        toast.success("Forwarding not implemented yet")
                      }
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm flex items-center gap-2",
                        active ? "bg-white/10 text-white" : "text-gray-300"
                      )}
                    >
                      <Share2 size={14} /> Forward
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Hover 3-Dots Menu (Copy, React) */}
          <div
            className={cn(
              "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center",
              isMe ? "-left-8" : "-right-8"
            )}
          >
            <Menu as="div" className="relative">
              <Menu.Button className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <MoreVertical size={16} />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className={cn(
                    "absolute top-0 z-50 w-32 rounded-xl bg-gray-800 border border-white/10 shadow-xl backdrop-blur-md focus:outline-none overflow-hidden",
                    isMe ? "right-full mr-2" : "left-full ml-2"
                  )}
                >
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.text);
                          toast.success("Copied!");
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2",
                          active ? "bg-white/10 text-white" : "text-gray-300"
                        )}
                      >
                        <Copy size={12} /> Copy
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          "w-full px-3 py-2 text-left text-xs flex items-center gap-2",
                          active ? "bg-white/10 text-white" : "text-gray-300"
                        )}
                      >
                        <Smile size={12} /> React
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>

        {/* Action/Reply Button (On Hover) - Positioned relative to bubble */}
      </div>
    </motion.div>
  );
});
