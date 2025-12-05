import { X, Check, CircleHelp } from "lucide-react";
import {
  useAcceptConnectionMutation,
  useRejectConnectionMutation,
} from "@/api/conversationsApi";
import type { Conversation } from "@/types";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

interface PendingRequestsViewProps {
  pendingConversations: Conversation[];
}

export function PendingRequestsView({
  pendingConversations,
}: PendingRequestsViewProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [acceptConnection] = useAcceptConnectionMutation();
  const [rejectConnection] = useRejectConnectionMutation();

  const handleAccept = async (id: string) => {
    try {
      await acceptConnection(id).unwrap();
    } catch (error) {
      console.error("Failed to accept:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectConnection(id).unwrap();
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-900">
        <div className="p-2 bg-gray-800 rounded-lg">
          <CircleHelp className="text-gray-400" size={20} />
        </div>
        <h2 className="text-lg font-bold text-white">Pending Requests</h2>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        {pendingConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending requests
          </div>
        ) : (
          pendingConversations.map((conv) => {
            const otherParticipant = conv.participants.find(
              (p: any) => p._id !== user?._id
            );

            return (
              <div
                key={conv._id}
                className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white overflow-hidden shrink-0">
                    {otherParticipant?.avatarUrl ? (
                      <img
                        src={otherParticipant.avatarUrl}
                        alt={otherParticipant.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold">
                        {otherParticipant?.displayName?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {otherParticipant?.displayName}
                    </div>
                    <div className="text-xs text-indigo-400">
                      @{otherParticipant?.connectionId}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(conv._id)}
                    className="p-2 bg-green-600/20 text-green-400 rounded-full hover:bg-green-600/30 transition-colors"
                    title="Accept"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleReject(conv._id)}
                    className="p-2 bg-red-600/20 text-red-400 rounded-full hover:bg-red-600/30 transition-colors"
                    title="Reject"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
