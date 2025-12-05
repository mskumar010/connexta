import { useState, Fragment } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { useSelector } from "react-redux";
import { ChatArea } from "@/components/layout/ChatArea";
import { MessageList } from "@/features/chat/components/MessageList";
import { MessageInput } from "@/features/chat/components/MessageInput";
import type { RootState } from "@/app/store";
import type { UIMessage } from "@/types";
import {
  User,
  Loader2,
  UserPlus,
  Check,
  X,
  ShieldAlert,
  UserMinus,
  MoreVertical,
} from "lucide-react";
import {
  useGetConversationQuery,
  useAcceptConnectionMutation,
  useRejectConnectionMutation,
  useDeleteConversationMutation,
} from "@/api/conversationsApi";
import { useDmSocket } from "@/hooks/useDmSocket";

const EMPTY_MESSAGES: UIMessage[] = [];

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [replyingTo, setReplyingTo] = useState<UIMessage | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  const { data: conversation, isLoading } = useGetConversationQuery(
    conversationId!
  );

  const [acceptConnection, { isLoading: isAccepting }] =
    useAcceptConnectionMutation();
  const [rejectConnection, { isLoading: isRejecting }] =
    useRejectConnectionMutation();

  // Optimized selector with stable reference
  const messages = useSelector(
    (state: RootState) =>
      state.chat.messages[conversationId || ""] || EMPTY_MESSAGES
  );

  // Connect to socket for real-time messages (Dedicated DM Logic)
  useDmSocket({
    conversationId: conversationId || "",
    userId: user?._id || "",
  });

  const [deleteConversation, { isLoading: isDeleting }] =
    useDeleteConversationMutation();
  const navigate = useNavigate();

  const handleDisconnect = async () => {
    if (
      confirm(
        "Are you sure you want to disconnect? This will delete the conversation for both parties."
      )
    ) {
      try {
        await deleteConversation(conversationId!).unwrap();
        navigate("/");
      } catch (err) {
        console.error("Failed to disconnect", err);
      }
    }
  };

  const typingUsers: string[] = [];
  const typingUserNames = {};

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 border-l border-gray-800">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 bg-gray-900 border-l border-gray-800">
        Conversation not found
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(
    (p) => p._id !== user?._id
  );

  // Connection Logic
  const isPending = conversation.status === "pending";
  const isRejected = conversation.status === "rejected";
  const amIInitiator = conversation.initiatorId === user?._id;

  // Show Accept/Reject if it's pending and I am NOT the one who started it
  const showAcceptReject = isPending && !amIInitiator;

  // Show "Waiting" if it's pending and I AM the one who started it
  const showPendingMessage = isPending && amIInitiator;

  const handleAccept = async () => {
    try {
      await acceptConnection(conversationId!).unwrap();
    } catch (err) {
      console.error("Failed to accept", err);
    }
  };

  const handleReject = async () => {
    try {
      await rejectConnection(conversationId!).unwrap();
    } catch (err) {
      console.error("Failed to reject", err);
    }
  };

  // Rejected View
  if (isRejected) {
    return (
      <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
        <header className="flex h-16 items-center border-b px-6 border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">
            {otherParticipant?.displayName}
          </h2>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
          <ShieldAlert size={48} className="mb-4 text-red-500/50" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">
            Connection Rejected
          </h3>
          <p>This user does not want to connect at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <ChatArea
      header={
        <div className="flex items-center justify-between w-full pr-4">
          <button
            onClick={() => navigate(`/profile/${otherParticipant?._id}`)}
            className="flex items-center gap-3 hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden shrink-0 border border-gray-600">
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
            <div>
              <h2 className="text-base font-semibold text-gray-100 leading-tight">
                {otherParticipant?.displayName || "Unknown User"}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                <p className="text-xs text-gray-400 font-mono">
                  @{otherParticipant?.connectionId || "..."}
                </p>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {!isPending && !isRejected && (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical size={20} />
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-700 rounded-xl bg-[var(--color-bg-secondary)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 backdrop-blur-xl border border-white/5">
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              navigate(`/profile/${otherParticipant?._id}`)
                            }
                            className={`${
                              active
                                ? "bg-[var(--color-brand-primary)] text-white"
                                : "text-gray-300"
                            } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                          >
                            <User size={16} className="mr-2" />
                            View Profile
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleDisconnect}
                            className={`${
                              active
                                ? "bg-red-500/10 text-red-400"
                                : "text-red-400"
                            } group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors`}
                          >
                            {isDeleting ? (
                              <Loader2
                                className="animate-spin mr-2"
                                size={16}
                              />
                            ) : (
                              <UserMinus size={16} className="mr-2" />
                            )}
                            Disconnect
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col relative">
        {/* Pending Request Banner */}
        {showAcceptReject && (
          <div className="bg-indigo-900/40 border-b border-indigo-500/30 p-4 absolute top-0 left-0 right-0 z-10 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-full">
                  <UserPlus size={20} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-100">
                    Connection Request
                  </p>
                  <p className="text-xs text-indigo-300">
                    Accept to start messaging.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isAccepting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Check size={14} />
                  )}
                  Accept
                </button>
                <button
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isRejecting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <X size={14} />
                  )}
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {showPendingMessage && (
          <div className="bg-gray-800/80 border-b border-gray-700 p-2 text-center text-xs text-gray-400 absolute top-0 left-0 right-0 z-10 backdrop-blur-sm">
            Request sent. Waiting for approval...
          </div>
        )}

        <div className="flex-1 overflow-hidden pt-0">
          {/* Add padding top if banner is shown to avoid overlap, or let it overlay? 
               Overlay is better for scroll, but might hide top messages. 
               Let's add some spacer logic or just accept overlay for now. 
           */}
          <MessageList
            messages={messages}
            typingUserIds={typingUsers}
            typingUserNames={typingUserNames}
            isLoading={false}
            onReply={setReplyingTo}
            isDm={true}
          />
        </div>

        {/* Disable Input if Pending */}
        {isPending ? (
          <div className="p-4 border-t border-gray-800 bg-gray-900 text-center text-gray-500 text-sm italic">
            {amIInitiator
              ? "Waiting for connection approval..."
              : "Accept the request to reply."}
          </div>
        ) : (
          <MessageInput
            roomId={conversationId || ""}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            isDm={true}
          />
        )}
      </div>
    </ChatArea>
  );
}
