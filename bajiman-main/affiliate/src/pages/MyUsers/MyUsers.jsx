import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Users,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Phone,
  Mail,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/axios";

const USERS_PER_PAGE = 15;

const filterOptions = [
  { label: "All Users", value: "all" },
  { label: "Active Users", value: "active" },
  { label: "Inactive Users", value: "inactive" },
];

const MyUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nextStatus, setNextStatus] = useState(false);

  const fetchMyUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/affiliate/my-users");

      if (data?.success) {
        setUsers(data?.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load referred users",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let updatedUsers = [...users];

    if (statusFilter === "active") {
      updatedUsers = updatedUsers.filter((user) => user.isActive);
    }

    if (statusFilter === "inactive") {
      updatedUsers = updatedUsers.filter((user) => !user.isActive);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();

      updatedUsers = updatedUsers.filter((user) => {
        const userId = String(user?.userId || "").toLowerCase();
        const phone = String(user?.phone || "").toLowerCase();
        const email = String(user?.email || "").toLowerCase();
        const referralCode = String(user?.referralCode || "").toLowerCase();

        return (
          userId.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          referralCode.includes(q)
        );
      });
    }

    return updatedUsers;
  }, [users, searchText, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length,
    }),
    [users],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const openConfirmModal = (user, status) => {
    setSelectedUser(user);
    setNextStatus(status);
    setConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    if (toggleLoading) return;
    setConfirmOpen(false);
    setSelectedUser(null);
    setNextStatus(false);
  };

  const handleToggleStatus = async () => {
    try {
      if (!selectedUser?._id) {
        toast.error("No user selected");
        return;
      }

      setToggleLoading(true);

      const { data } = await api.patch(
        `/api/affiliate/my-users/${selectedUser._id}/toggle-status`,
        {
          isActive: nextStatus,
        },
      );

      if (data?.success) {
        toast.success(data?.message || "User status updated successfully");

        setUsers((prev) =>
          prev.map((item) =>
            item._id === selectedUser._id
              ? { ...item, isActive: nextStatus }
              : item,
          ),
        );

        closeConfirmModal();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update user status",
      );
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative overflow-hidden rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.10),transparent_38%)]" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-[#1A79D3]" />
              <span className="text-xs font-bold text-[#6fb5f4]">
                Affiliate Users
              </span>
            </div>

            <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              My Users
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              View and manage all users registered with your referral code.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[390px]">
            <StatCard label="Total" value={stats.total} icon={Users} />
            <StatCard label="Active" value={stats.active} icon={UserCheck} />
            <StatCard label="Inactive" value={stats.inactive} icon={UserX} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1A79D3]" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by username, phone, email or referral code"
              className="w-full rounded-2xl border border-white/10 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`cursor-pointer rounded-2xl border px-5 py-3 text-sm font-bold transition ${
                  statusFilter === option.value
                    ? "border-[#1A79D3]/60 bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)]"
                    : "border-white/10 bg-black/35 text-slate-200 hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10"
                }`}
              >
                {option.label}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchMyUsers}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 block space-y-4 lg:hidden">
        {loading ? (
          <LoadingBox />
        ) : paginatedUsers.length === 0 ? (
          <EmptyBox />
        ) : (
          paginatedUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[24px] border border-[#1A79D3]/20 bg-white/[0.07] p-4 shadow-xl shadow-black/30 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white">
                    {user.userId || "N/A"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {user.email || "No email"}
                  </p>
                </div>

                <StatusBadge active={user.isActive} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-200">
                <InfoRow label="Phone" value={user.phone || "N/A"} />
                <InfoRow label="Email" value={user.email || "N/A"} />
                <InfoRow
                  label="Balance"
                  value={`৳${formatMoney(user.balance)}`}
                />
                <InfoRow
                  label="Referral Code"
                  value={user.referralCode || "N/A"}
                />
                <InfoRow label="Joined" value={formatDate(user.createdAt)} />
              </div>

              <div className="mt-4">
                {user.isActive ? (
                  <button
                    type="button"
                    onClick={() => openConfirmModal(user, false)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
                  >
                    <UserX className="h-4 w-4" />
                    Deactivate User
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openConfirmModal(user, true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/40 bg-[#1A79D3]/10 px-3 py-2.5 text-sm font-bold text-[#6fb5f4] transition hover:bg-[#1A79D3]/20"
                  >
                    <UserCheck className="h-4 w-4" />
                    Activate User
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-[#1A79D3]/20 bg-[#1A79D3]/10 text-left">
                {[
                  "Username",
                  "Phone",
                  "Email",
                  "Balance",
                  "Status",
                  "Joined",
                  "Action",
                ].map((item) => (
                  <th
                    key={item}
                    className="px-5 py-4 text-sm font-black text-slate-100"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12">
                    <LoadingBox />
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12">
                    <EmptyBox />
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`border-b border-white/5 transition hover:bg-[#1A79D3]/10 ${
                      index % 2 === 0 ? "bg-black/15" : "bg-transparent"
                    }`}
                  >
                    <td className="px-5 py-4 text-sm font-bold text-white">
                      {user.userId || "N/A"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-200">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#6fb5f4]" />
                        {user.phone || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-200">
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#6fb5f4]" />
                        {user.email || "N/A"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-[#6fb5f4]">
                      <span className="inline-flex items-center gap-2">
                        <Wallet className="h-4 w-4" />৳
                        {formatMoney(user.balance)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge active={user.isActive} />
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-300">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      {user.isActive ? (
                        <button
                          type="button"
                          onClick={() => openConfirmModal(user, false)}
                          className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
                        >
                          <UserX className="h-4 w-4" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openConfirmModal(user, true)}
                          className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#1A79D3]/40 bg-[#1A79D3]/10 px-3 py-2 text-sm font-bold text-[#6fb5f4] transition hover:bg-[#1A79D3]/20"
                        >
                          <UserCheck className="h-4 w-4" />
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-slate-300 md:text-left">
            Showing{" "}
            <span className="font-black text-white">
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * USERS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-black text-white">
              {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)}
            </span>{" "}
            of{" "}
            <span className="font-black text-white">
              {filteredUsers.length}
            </span>{" "}
            users
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <div className="rounded-2xl border border-[#1A79D3]/30 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-[#6fb5f4]">
              Page {currentPage} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && selectedUser && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#1A79D3]/20 bg-[#050607] shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between border-b border-[#1A79D3]/20 bg-[#1A79D3]/10 px-5 py-4">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Confirm User Status
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Please confirm before updating this referred user.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeConfirmModal}
                  disabled={toggleLoading}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      nextStatus
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-300">
                      Are you sure you want to{" "}
                      <span
                        className={`font-black ${
                          nextStatus ? "text-emerald-300" : "text-red-300"
                        }`}
                      >
                        {nextStatus ? "activate" : "deactivate"}
                      </span>{" "}
                      this user?
                    </p>

                    <h3 className="mt-2 text-lg font-black text-white">
                      {selectedUser.userId || "N/A"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {selectedUser.phone || "N/A"}
                      {selectedUser.email ? ` • ${selectedUser.email}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  disabled={toggleLoading}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={toggleLoading}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${
                    nextStatus
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {toggleLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : nextStatus ? (
                    <>
                      <UserCheck className="h-5 w-5" />
                      Activate User
                    </>
                  ) : (
                    <>
                      <UserX className="h-5 w-5" />
                      Deactivate User
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/35 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black text-white">{value}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1A79D3]/15 text-[#6fb5f4]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-black/25 px-3 py-2">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <span className="text-right text-xs font-bold text-white">{value}</span>
    </div>
  );
};

const StatusBadge = ({ active }) => {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
        active
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/40 bg-red-500/10 text-red-300"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
};

const LoadingBox = () => {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-black/25 p-8 text-slate-300">
      <Loader2 className="h-5 w-5 animate-spin text-[#1A79D3]" />
      Loading referred users...
    </div>
  );
};

const EmptyBox = () => {
  return (
    <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/25 p-8 text-center text-slate-300">
      No referred users found
    </div>
  );
};

export default MyUsers;
