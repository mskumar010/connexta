import { useParams, Link } from "react-router-dom";
import { useGetUsersQuery } from "@/api/usersApi";
import { Avatar } from "@/components/common/Avatar";
import {
  MessageSquare,
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Globe,
  Mail,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { format } from "date-fns";

export function PublicProfilePage() {
  const { userId } = useParams();
  const { data: users, isLoading } = useGetUsersQuery();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 gap-2">
        <Loader2 className="animate-spin text-[var(--color-brand-primary)]" />
        <span className="font-medium">Loading profile...</span>
      </div>
    );
  }

  const user = users?.find((u) => u._id === userId);

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-6">
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
          <UserX size={32} />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">User not found</h1>
          <p className="text-sm text-gray-500 mt-1">
            The user you are looking for does not exist or has been removed.
          </p>
        </div>
        <Link
          to="/"
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const isMe = user._id === currentUser?._id;

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-primary)] overflow-y-auto w-full">
      {/* Hero / Cover */}
      <div className="h-64 w-full relative shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-accent)] opacity-20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        <div className="absolute top-0 left-0 w-full p-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-8 pb-12 -mt-20 relative max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left Column: Avatar & Actions */}
          <div className="flex flex-col items-center md:items-start gap-6 shrink-0 md:w-72">
            <div className="w-40 h-40 p-1.5 bg-[var(--color-bg-primary)] rounded-full shadow-2xl relative">
              <Avatar
                src={user.avatarUrl}
                name={user.displayName}
                className="w-full h-full text-5xl"
                style={{
                  borderColor: user.profileColor || "transparent",
                  borderWidth: user.profileColor ? "4px" : "0",
                }}
              />
              {user.lastLocation && (
                <div
                  className="absolute bottom-3 right-3 w-6 h-6 bg-green-500 border-4 border-[var(--color-bg-primary)] rounded-full"
                  title="Online"
                />
              )}
            </div>

            <div className="text-center md:text-left space-y-1">
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
                {user.displayName}
              </h1>
              <p className="text-[var(--color-text-secondary)] font-medium">
                @
                {(user as any).username ||
                  user.displayName.toLowerCase().replace(/\s/g, "")}
              </p>
              {isMe && (
                <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold mt-1">
                  That's You!
                </span>
              )}
            </div>

            {!isMe && (
              <Link
                to={`/chat/new?userId=${user._id}`}
                className="w-full py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white rounded-xl font-bold shadow-lg shadow-[var(--color-brand-primary)]/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
              >
                <MessageSquare size={20} />
                Send Message
              </Link>
            )}
          </div>

          {/* Right Column: Details Cards */}
          <div className="flex-1 w-full space-y-6 pt-0 md:pt-20">
            {/* Status / Bio Card */}
            <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                About
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {(user as any).bio || "This user hasn't written a bio yet."}
              </p>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--color-text-tertiary)]">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{(user as any).location || "Unknown Location"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Joined {format(new Date(), "MMMM yyyy")}</span>
                  {/* (Using mock join date if not in schema) */}
                </div>
              </div>
            </div>

            {/* Connection Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 border border-[var(--color-border)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-bold">
                    Network
                  </p>
                  <p className="text-[var(--color-text-primary)] font-semibold">
                    Connexta User
                  </p>
                </div>
              </div>

              <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-4 border border-[var(--color-border)] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-tertiary)] uppercase font-bold">
                    Connection ID
                  </p>
                  <p className="text-[var(--color-text-primary)] font-mono text-sm">
                    {user.connectionId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserX({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-500"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <line x1="8" y1="2" x2="14" y2="8" />
      <line x1="14" y1="2" x2="8" y2="8" />
    </svg>
  );
}
