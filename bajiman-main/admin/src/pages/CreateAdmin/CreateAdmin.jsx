import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  ShieldCheck,
  UserCog,
} from "lucide-react";

import { api } from "../../api/axios";

const CreateAdmin = () => {
  const allPerms = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", path: "/" },
      { key: "profile", label: "Profile", path: "/profile" },

      { key: "all-users", label: "Users", path: "/all-users" },
      {
        key: "all-affiliate-users",
        label: "Affiliates",
        path: "/all-affiliate-users",
      },
      {
        key: "single-affiliate-details",
        label: "Single Affiliate Details",
        path: "/single-affiliate-details/:id",
      },
      {
        key: "single-user-details",
        label: "Single User Details",
        path: "/single-user-details/:id",
      },
      {
        key: "bulk-adjustment",
        label: "Bulk Adjustment",
        path: "/bulk-adjustment",
      },
      {
        key: "user-refer-redeem",
        label: "Refer & Redeem",
        path: "/user-refer-redeem",
      },

      {
        key: "add-deposit-method",
        label: "Add Deposit Method",
        path: "/add-deposit-method",
      },
      {
        key: "add-deposit-field",
        label: "Deposit Field",
        path: "/add-deposit-field",
      },
      {
        key: "add-deposit-bonus-turnover",
        label: "Bonus & Turnover",
        path: "/add-deposit-bonus-turnover",
      },
      {
        key: "otp-setting",
        label: "OTP Setting",
        path: "/otp-setting",
      },
      {
        key: "register-bonus-campaign",
        label: "Register Bonus",
        path: "/register-bonus-campaign",
      },
      {
        key: "manual-deposit",
        label: "Manual Deposit",
        path: "/manual-deposit",
      },
      {
        key: "deposit-requests",
        label: "Deposit Requests",
        path: "/deposit-requests",
      },
      {
        key: "deposit-request-details",
        label: "Deposit Request Details",
        path: "/deposit-request-details/:id",
      },
      {
        key: "auto-deposit-settings",
        label: "Auto Deposit",
        path: "/auto-deposit-settings",
      },
      {
        key: "auto-deposit-history",
        label: "Auto Deposit History",
        path: "/auto-deposit-history",
      },
      {
        key: "add-turnover-history",
        label: "All Turnover History",
        path: "/all-turnover-history",
      },

      {
        key: "add-withdraw",
        label: "Add Withdraw",
        path: "/add-withdraw",
      },
      {
        key: "withdraw-requests",
        label: "Withdraw Requests",
        path: "/withdraw-requests",
      },
      {
        key: "add-aff-withdraw-method",
        label: "Add Aff Withdraw",
        path: "/add-aff-withdraw-method",
      },
      {
        key: "aff-withdraw-requests",
        label: "Aff Withdraw Request",
        path: "/aff-withdraw-requests",
      },
      {
        key: "aff-withdraw-requests-details",
        label: "Aff Withdraw Request Details",
        path: "/aff-withdraw-requests-details/:id",
      },

      { key: "add-category", label: "Add Category", path: "/add-category" },
      { key: "add-provider", label: "Add Provider", path: "/add-provider" },
      { key: "add-game", label: "Add Game", path: "/add-game" },
      {
        key: "add-sport-game",
        label: "Add Sport Game",
        path: "/add-sport-game",
      },
      {
        key: "add-popular-game",
        label: "Add Popular Game",
        path: "/add-popular-game",
      },
      { key: "add-hot-game", label: "Add Hot Game", path: "/add-hot-game" },
      {
        key: "add-game-history",
        label: "All Game History",
        path: "/all-game-history",
      },

      {
        key: "add-promotion",
        label: "Add Promotion",
        path: "/add-promotion",
      },

      {
        key: "client-site-identify",
        label: "Site Identify",
        path: "/client-site-identify",
      },
      {
        key: "client-slider-control",
        label: "Slider Control",
        path: "/client-slider-control",
      },
      {
        key: "add-favorite-banner",
        label: "Add Favourite Control",
        path: "/add-favorite-banner",
      },
      {
        key: "add-notice-control",
        label: "Add Notice Control",
        path: "/add-notice-control",
      },
      {
        key: "footer-setting",
        label: "Footer Setting",
        path: "/footer-setting",
      },
      {
        key: "navbar-color-setting",
        label: "Navbar Color Setting",
        path: "/navbar-color-setting",
      },
      {
        key: "sidebar-color-setting",
        label: "Sidebar Color Setting",
        path: "/sidebar-color-setting",
      },
      {
        key: "category-section-setting",
        label: "Category Section Setting",
        path: "/category-section-setting",
      },
      {
        key: "register-modal-setting",
        label: "Register Modal Setting",
        path: "/register-modal-setting",
      },
      {
        key: "login-modal-setting",
        label: "Login Modal Setting",
        path: "/login-modal-setting",
      },
      {
        key: "modal-color-setting",
        label: "Modal Color Setting",
        path: "/modal-color-setting",
      },
      {
        key: "transaction-history-color-setting",
        label: "Transaction History Color Setting",
        path: "/transaction-history-color-setting",
      },
      {
        key: "bottom-navigation-color-setting",
        label: "Bottom Navigation Color Setting",
        path: "/bottom-navigation-color-setting",
      },
      {
        key: "home-page-content-color-setting",
        label: "Home Page Content Color Setting",
        path: "/home-page-content-color-setting",
      },
      {
        key: "forget-password-modal-setting",
        label: "Forget Password Modal Setting",
        path: "/forget-password-modal-setting",
      },
      { key: "social-link", label: "Social Link", path: "/social-link" },
      {
        key: "download-header",
        label: "Download App",
        path: "/download-header",
      },
      {
        key: "check-in-reward",
        label: "Check-In Reward",
        path: "/check-in-reward",
      },
      {
        key: "wheel-of-fortune-reward",
        label: "Wheel Of Fortune Reward",
        path: "/wheel-of-fortune-reward",
      },
      {
        key: "wheel-terms-condition",
        label: "Wheel Terms & Conditions",
        path: "/wheel-terms-condition",
      },
      {
        key: "reward-history",
        label: "Reward History",
        path: "/reward-history",
      },

      {
        key: "client-aff-site-identify",
        label: "Aff Site Identify",
        path: "/client-aff-site-identify",
      },
      {
        key: "client-aff-social-link",
        label: "Aff Social Link",
        path: "/client-aff-social-link",
      },
      {
        key: "affiliate-register-setting",
        label: "Affiliate Register Setting",
        path: "/affiliate-register-setting",
      },
      {
        key: "affiliate-login-setting",
        label: "Affiliate Login Setting",
        path: "/affiliate-login-setting",
      },
      {
        key: "affiliate-slider-setting",
        label: "Affiliate Slider Setting",
        path: "/affiliate-slider-setting",
      },
      {
        key: "affiliate-agent-setting",
        label: "Affiliate Agent Setting",
        path: "/affiliate-agent-setting",
      },
      {
        key: "affiliate-about-setting",
        label: "Affiliate About Setting",
        path: "/affiliate-about-setting",
      },
      {
        key: "affiliate-sponsorship-setting",
        label: "Affiliate Sponsorship Setting",
        path: "/affiliate-sponsorship-setting",
      },
      {
        key: "affiliate-commission-setting",
        label: "Affiliate Commission Setting",
        path: "/affiliate-commission-setting",
      },
      {
        key: "affiliate-advantage-setting",
        label: "Affiliate Advantage Setting",
        path: "/affiliate-advantage-setting",
      },
      {
        key: "affiliate-registration-guide-setting",
        label: "Registration Guide Setting",
        path: "/affiliate-registration-guide-setting",
      },
      {
        key: "affiliate-watch-setting",
        label: "Affiliate Watch Setting",
        path: "/affiliate-watch-setting",
      },
      {
        key: "affiliate-review-setting",
        label: "Affiliate Review Setting",
        path: "/affiliate-review-setting",
      },
      {
        key: "affiliate-footer-setting",
        label: "Affiliate Footer Setting",
        path: "/affiliate-footer-setting",
      },
      {
        key: "affiliate-navbar-setting",
        label: "Affiliate Navbar Setting",
        path: "/affiliate-navbar-setting",
      },
    ],
    [],
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sub");
  const [permissions, setPermissions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("sub");
  const [editPermissions, setEditPermissions] = useState([]);
  const [editNewPassword, setEditNewPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const togglePerm = (key) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const toggleEditPerm = (key) => {
    setEditPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const loadAdmins = async () => {
    try {
      setLoadingList(true);

      const { data } = await api.get("/api/admin/admins");

      setAdmins(data?.data?.admins || data?.admins || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load admins");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const resetCreate = () => {
    setEmail("");
    setPassword("");
    setRole("sub");
    setPermissions([]);
    setShowPassword(false);
  };

  const submitCreate = async (e) => {
    e.preventDefault();

    if (!email.trim()) return toast.error("Email is required");
    if (!password.trim()) return toast.error("Password is required");
    if (password.trim().length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setCreating(true);

      await api.post("/api/admin/create-admin", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        permissions: role === "mother" ? [] : permissions,
      });

      toast.success("Admin created successfully");
      resetCreate();
      loadAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Admin create failed");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (admin) => {
    setEditingId(admin._id || admin.id);
    setEditEmail(admin.email || "");
    setEditRole(admin.role || "sub");
    setEditPermissions(
      Array.isArray(admin.permissions) ? admin.permissions : [],
    );
    setEditNewPassword("");
    setShowEditPassword(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditEmail("");
    setEditRole("sub");
    setEditPermissions([]);
    setEditNewPassword("");
    setShowEditPassword(false);
  };

  const submitEdit = async (id) => {
    try {
      const payload = {
        role: editRole,
        permissions: editRole === "mother" ? [] : editPermissions,
      };

      if (editEmail.trim()) {
        payload.email = editEmail.trim().toLowerCase();
      }

      if (editNewPassword.trim()) {
        if (editNewPassword.trim().length < 6) {
          return toast.error("New password must be at least 6 characters");
        }

        payload.newPassword = editNewPassword.trim();
      }

      await api.put(`/api/admin/admins/${id}`, payload);

      toast.success("Admin updated successfully");
      cancelEdit();
      loadAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Admin update failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await api.delete(`/api/admin/admins/${deleteConfirmId}`);
      toast.success("Admin deleted successfully");

      if (editingId === deleteConfirmId) {
        cancelEdit();
      }

      loadAdmins();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Admin delete failed");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-[#3ea0ff]" />
            <span className="text-sm font-bold text-blue-100">
              Mother Admin Control
            </span>
          </div>

          <h1 className="mt-4 bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            Manage Admin Accounts
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Create sub admins and control their route permissions.
          </p>
        </div>

        <div className="mb-10 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/30">
              <Plus className="h-6 w-6 text-white" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                Create New Admin
              </h2>
              <p className="text-sm text-slate-400">
                Mother admin has all access. Sub admin needs permissions.
              </p>
            </div>
          </div>

          <form onSubmit={submitCreate} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@crickex.com"
                  className="w-full rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/70 focus-within:ring-2 focus-within:ring-[#1A79D3]/20">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="cursor-pointer text-slate-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/80 px-4 py-3 text-sm text-white outline-none transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/20"
              >
                <option value="sub">Sub Admin</option>
                <option value="mother">Mother Admin</option>
              </select>
            </div>

            {role !== "mother" && (
              <PermissionGrid
                title="Permissions"
                allPerms={allPerms}
                selected={permissions}
                onToggle={togglePerm}
              />
            )}

            <button
              type="submit"
              disabled={creating}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:px-8"
            >
              {creating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Admin
                </>
              )}
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A79D3]/15">
                <UserCog className="h-6 w-6 text-[#3ea0ff]" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  All Admin Accounts
                </h2>
                <p className="text-sm text-slate-400">
                  View, edit, or delete admins.
                </p>
              </div>
            </div>

            <button
              onClick={loadAdmins}
              disabled={loadingList}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-blue-100 transition hover:bg-[#1A79D3]/20 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loadingList ? (
            <div className="py-12 text-center text-slate-400">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No admin accounts found.
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => {
                const id = admin._id || admin.id;
                const isEditing = editingId === id;

                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-[#1A79D3]/15 bg-black/30 p-5 transition hover:border-[#1A79D3]/35"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-black text-white">
                          {admin.email}
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          Role:{" "}
                          <span className="font-bold text-[#3ea0ff]">
                            {admin.role === "mother"
                              ? "Mother Admin"
                              : "Sub Admin"}
                          </span>
                        </p>

                        {admin.role !== "mother" && (
                          <p className="mt-1 max-w-3xl break-words text-sm text-slate-400">
                            Permissions:{" "}
                            {Array.isArray(admin.permissions) &&
                            admin.permissions.length > 0
                              ? admin.permissions.join(", ")
                              : "None"}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!isEditing ? (
                          <>
                            <button
                              onClick={() => startEdit(admin)}
                              className="cursor-pointer rounded-xl bg-[#1A79D3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d5fa8]"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(id)}
                              className="cursor-pointer rounded-xl bg-red-600/85 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => submitEdit(id)}
                              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-2.5 text-sm font-bold text-white"
                            >
                              <Save size={16} />
                              Save
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-black/30 px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15"
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[#1A79D3]/15 pt-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Email
                          </label>

                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/20"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">
                            Role
                          </label>

                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/80 px-4 py-3 text-sm text-white outline-none transition focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/20"
                          >
                            <option value="sub">Sub Admin</option>
                            <option value="mother">Mother Admin</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-200">
                            New Password
                          </label>

                          <div className="flex items-center rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/70 focus-within:ring-2 focus-within:ring-[#1A79D3]/20">
                            <input
                              type={showEditPassword ? "text" : "password"}
                              value={editNewPassword}
                              onChange={(e) =>
                                setEditNewPassword(e.target.value)
                              }
                              placeholder="Leave empty to keep current password"
                              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowEditPassword((prev) => !prev)
                              }
                              className="cursor-pointer text-slate-300 hover:text-white"
                            >
                              {showEditPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                        </div>

                        {editRole !== "mother" && (
                          <div className="md:col-span-2">
                            <PermissionGrid
                              title="Edit Permissions"
                              allPerms={allPerms}
                              selected={editPermissions}
                              onToggle={toggleEditPerm}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-[#1A79D3]/20 bg-[#050607] p-6 shadow-2xl shadow-[#1A79D3]/20">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>

            <h3 className="text-xl font-black text-white">Confirm Delete</h3>

            <p className="mt-2 text-sm text-slate-300">
              Are you sure you want to delete this admin account?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 cursor-pointer rounded-2xl border border-[#1A79D3]/20 bg-black/30 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 cursor-pointer rounded-2xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-500"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PermissionGrid = ({ title, allPerms, selected, onToggle }) => {
  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-slate-200">
        {title}
      </label>

      <div className="grid max-h-[300px] grid-cols-1 gap-3 overflow-y-auto pr-1 [scrollbar-width:none] sm:grid-cols-2 lg:grid-cols-3">
        {allPerms.map((perm) => (
          <label
            key={perm.key}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#1A79D3]/15 bg-black/30 px-4 py-3 transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10"
          >
            <input
              type="checkbox"
              checked={selected.includes(perm.key)}
              onChange={() => onToggle(perm.key)}
              className="mt-1 h-4 w-4 cursor-pointer accent-[#1A79D3]"
            />

            <span>
              <span className="block text-sm font-bold text-white">
                {perm.label}
              </span>
              <span className="text-xs text-slate-400">{perm.path}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CreateAdmin;
