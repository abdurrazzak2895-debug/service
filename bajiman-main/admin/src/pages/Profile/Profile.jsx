import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import { api } from "../../api/axios";
import { logout, setCredentials } from "../../features/auth/authSlice";

const Profile = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(null);

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/profile");
      const admin = data?.data?.admin || data?.admin;

      if (!admin?.email) {
        toast.error("Profile response invalid");
        return;
      }

      setProfile(admin);
      setEmail(admin.email || "");

      const token = localStorage.getItem("token");
      if (token) {
        dispatch(setCredentials({ admin, token }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      return toast.error("Current password is required");
    }

    if (!email.trim()) {
      return toast.error("Email is required");
    }

    if (newPassword.trim() && newPassword.trim().length < 6) {
      return toast.error("New password must be at least 6 characters");
    }

    try {
      setSaving(true);

      await api.put("/api/admin/profile", {
        email: email.trim().toLowerCase(),
        currentPassword,
        newPassword: newPassword.trim(),
      });

      toast.success("Profile updated successfully. Please login again.");

      dispatch(logout());
      window.location.href = "/login";
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = profile?.role === "mother" ? "Mother Admin" : "Sub Admin";

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-[#3ea0ff]" />
            <span className="text-sm font-bold text-blue-100">
              Admin Security
            </span>
          </div>

          <h1 className="mt-4 bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Manage your admin email and password securely.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#1A79D3]/30 bg-[#1A79D3]/10 shadow-[0_0_45px_rgba(26,121,211,0.25)]">
                <User className="h-12 w-12 text-[#3ea0ff]" />
              </div>

              <h2 className="mt-5 text-xl font-black text-white">
                {profile?.email || "Admin Profile"}
              </h2>

              <p className="mt-2 rounded-full border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-1.5 text-sm font-bold text-blue-100">
                {roleLabel}
              </p>

              <div className="mt-6 w-full space-y-3 rounded-2xl border border-[#1A79D3]/15 bg-black/25 p-4 text-left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Admin ID
                  </p>
                  <p className="mt-1 break-all text-sm text-slate-300">
                    {profile?.id || profile?._id || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Permissions
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {profile?.role === "mother"
                      ? "All permissions"
                      : Array.isArray(profile?.permissions) &&
                          profile.permissions.length > 0
                        ? profile.permissions.join(", ")
                        : "No permissions"}
                  </p>
                </div>
              </div>

              <button
                onClick={loadProfile}
                disabled={loading}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-blue-100 transition hover:bg-[#1A79D3]/20 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh Profile
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/30">
                <Save className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  Update Profile
                </h2>
                <p className="text-sm text-slate-400">
                  Current password is required for any update.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/70 focus-within:ring-2 focus-within:ring-[#1A79D3]/20">
                  <Mail className="h-5 w-5 text-[#3ea0ff]" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@crickex.com"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Current Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/70 focus-within:ring-2 focus-within:ring-[#1A79D3]/20">
                  <Lock className="h-5 w-5 text-[#3ea0ff]" />

                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="cursor-pointer text-slate-300 hover:text-white"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  New Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/70 focus-within:ring-2 focus-within:ring-[#1A79D3]/20">
                  <Lock className="h-5 w-5 text-[#3ea0ff]" />

                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave empty if you only change email"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="cursor-pointer text-slate-300 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Update Profile
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-[#1A79D3]/15 bg-[#1A79D3]/10 p-4">
              <p className="text-sm text-slate-300">
                After changing email or password, you will be logged out and
                must login again for security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
