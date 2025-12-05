import { useState } from "react";
import { useSelector } from "react-redux";
import { useUpdateProfileMutation } from "@/api/authApi";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { toast } from "react-hot-toast";
import type { RootState } from "@/app/store";
import QRCode from "react-qr-code";
import { Copy, Check, Palette } from "lucide-react";

export function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [profileColor, setProfileColor] = useState(
    user?.profileColor || "#0D7377"
  );
  const [copied, setCopied] = useState(false);

  const PRESET_COLORS = [
    "#0D7377", // Brand Primary
    "#14FFEC", // Brand Accent
    "#EF476F", // Red/Pink
    "#FFD166", // Yellow
    "#06D6A0", // Green
    "#118AB2", // Blue
    "#7B2CBF", // Purple
    "#FFFFFF", // White
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ displayName, avatarUrl, profileColor }).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const handleCopy = () => {
    if (user?.connectionId) {
      navigator.clipboard.writeText(user.connectionId);
      setCopied(true);
      toast.success("ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full flex-col p-6 overflow-y-auto bg-[var(--color-bg-primary)]">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--color-text-primary)" }}
      >
        Profile Settings
      </h1>

      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Form */}
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-white/5">
            <div
              className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-lg border-4"
              style={{
                backgroundColor: profileColor,
                borderColor: profileColor,
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.displayName?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {user?.displayName}
              </h2>
              <p className="text-gray-400 text-sm font-mono mb-2">
                @{user?.connectionId}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: profileColor }}
                />
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  {profileColor}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Profile Accent Color
              </label>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                {/* Preset Grid */}
                <div className="grid grid-cols-8 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProfileColor(color)}
                      className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                        profileColor === color
                          ? "border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.3)] ring-2 ring-white/20"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                {/* Custom Input & Preview */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div
                    className="h-10 w-10 rounded-lg shadow-inner border border-white/10"
                    style={{ backgroundColor: profileColor }}
                  />

                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Palette className="text-gray-500" size={16} />
                    </div>
                    <input
                      type="text"
                      value={profileColor}
                      onChange={(e) => setProfileColor(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border-0 bg-gray-900/50 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 sm:text-sm font-mono tracking-wider"
                      placeholder="#000000"
                    />
                  </div>

                  <div className="relative overflow-hidden w-10 h-10 rounded-lg cursor-pointer hover:ring-2 ring-indigo-500 transition-all">
                    <input
                      type="color"
                      value={profileColor}
                      onChange={(e) => setProfileColor(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 p-0 border-0 cursor-pointer opacity-0"
                    />
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <Palette
                        size={18}
                        className="text-white drop-shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Avatar URL (Optional)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />

            <div className="relative">
              <Input
                label="Connection ID (Read Only)"
                value={user?.connectionId || ""}
                readOnly
                className="bg-gray-800/50 text-gray-500 cursor-not-allowed"
                required
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full py-3 text-lg"
              >
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Connection ID Card */}
        <div className="bg-[var(--color-bg-secondary)]/50 backdrop-blur-md p-8 rounded-3xl border border-white/5 h-fit space-y-8 flex flex-col items-center text-center shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Share Profile</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Scannable code for instant connection.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl shadow-inner">
            <div
              style={{
                height: "auto",
                margin: "0 auto",
                maxWidth: 180,
                width: "100%",
              }}
            >
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={user?.connectionId || "loading"}
                viewBox={`0 0 256 256`}
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
              Connection ID
            </label>
            <div
              onClick={handleCopy}
              className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-black/60 hover:border-[var(--color-brand-accent)] transition-all group"
            >
              <span className="text-2xl font-mono font-bold text-[var(--color-brand-accent)] tracking-wider">
                {user?.connectionId || "..."}
              </span>
              <div className="text-gray-500 group-hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 animate-pulse">
              Tap to copy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
