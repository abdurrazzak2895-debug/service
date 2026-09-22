import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Search,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Users,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/axios";

const USERS_PER_PAGE = 15;

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const AllAffiliateUser = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [activatingUser, setActivatingUser] = useState(null);

  const [commissionData, setCommissionData] = useState({
    gameLossCommission: "",
    depositCommission: "",
    referCommission: "",
    gameWinCommission: "",
  });

  const fetchAffiliateUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/affiliate/admin/affiliate-users");

      if (data?.success) {
        setUsers(data?.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load affiliate users",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliateUsers();
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

  const handleViewDetails = (user) => {
    navigate(`/affiliate-user-details/${user._id}`);
  };

  const handleOpenActivateModal = (user) => {
    setActivatingUser(user);
    setCommissionData({
      gameLossCommission: user?.gameLossCommission ?? "",
      depositCommission: user?.depositCommission ?? "",
      referCommission: user?.referCommission ?? "",
      gameWinCommission: user?.gameWinCommission ?? "",
    });
    setActivateModalOpen(true);
  };

  const handleCloseActivateModal = () => {
    if (actionLoading) return;

    setActivateModalOpen(false);
    setActivatingUser(null);
    setCommissionData({
      gameLossCommission: "",
      depositCommission: "",
      referCommission: "",
      gameWinCommission: "",
    });
  };

  const handleCommissionChange = (e) => {
    const { name, value } = e.target;

    setCommissionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActivateUser = async () => {
    try {
      if (!activatingUser?._id) {
        toast.error("No affiliate user selected");
        return;
      }

      setActionLoading(true);

      const payload = {
        isActive: true,
        gameLossCommission: Number(commissionData.gameLossCommission) || 0,
        depositCommission: Number(commissionData.depositCommission) || 0,
        referCommission: Number(commissionData.referCommission) || 0,
        gameWinCommission: Number(commissionData.gameWinCommission) || 0,
      };

      const { data } = await api.patch(
        `/api/affiliate/admin/affiliate-users/${activatingUser._id}/toggle-active`,
        payload,
      );

      if (data?.success) {
        toast.success(data.message || "Affiliate user activated successfully");
        handleCloseActivateModal();
        fetchAffiliateUsers();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to activate affiliate user",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateUser = async (user) => {
    try {
      if (!user?._id) {
        toast.error("No affiliate user selected");
        return;
      }

      const confirm = window.confirm(
        `Are you sure you want to deactivate ${user.userId}?`,
      );

      if (!confirm) return;

      setActionLoading(true);

      const { data } = await api.patch(
        `/api/affiliate/admin/affiliate-users/${user._id}/toggle-active`,
        { isActive: false },
      );

      if (data?.success) {
        toast.success(
          data.message || "Affiliate user deactivated successfully",
        );
        fetchAffiliateUsers();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to deactivate affiliate user",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.25),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.14),transparent_38%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-2">
                <Sparkles className="h-4 w-4 text-[#1A79D3]" />
                <span className="text-xs font-bold text-[#6fb5f4]">
                  Affiliate Control
                </span>
              </div>

              <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                All Affiliate Users
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Manage affiliate accounts, approve pending users, set
                commissions and monitor status.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[390px]">
              <StatCard label="Total" value={stats.total} icon={Users} />
              <StatCard label="Active" value={stats.active} icon={UserCheck} />
              <StatCard label="Inactive" value={stats.inactive} icon={UserX} />
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
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
              {statusOptions.map((option) => (
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
                onClick={fetchAffiliateUsers}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="block space-y-4 lg:hidden">
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
                      {user.userId}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {user.email || "No email"}
                    </p>
                  </div>

                  <StatusBadge active={user.isActive} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-200">
                  <InfoRow label="Phone" value={user.phone || "N/A"} />
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

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleViewDetails(user)}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10"
                  >
                    <Eye className="h-4 w-4" />
                    Details
                  </button>

                  {user.isActive ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivateUser(user)}
                      disabled={actionLoading}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <UserX className="h-4 w-4" />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenActivateModal(user)}
                      disabled={actionLoading}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/40 bg-[#1A79D3]/10 px-3 py-2.5 text-sm font-bold text-[#6fb5f4] transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <UserCheck className="h-4 w-4" />
                      Activate
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="hidden overflow-hidden rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/40 backdrop-blur-xl lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-[#1A79D3]/20 bg-[#1A79D3]/10 text-left">
                  {[
                    "Username",
                    "Phone",
                    "Email",
                    "Balance",
                    "Referral Code",
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
                    <td colSpan="8" className="px-5 py-12">
                      <LoadingBox />
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-12">
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
                        {user.userId}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-200">
                        {user.phone || "N/A"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-200">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-[#6fb5f4]">
                        ৳{formatMoney(user.balance)}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-100">
                        {user.referralCode || "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={user.isActive} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/single-affiliate-details/${user._id}`}
                            className="group flex cursor-pointer items-center gap-2 rounded-xl border border-[#1A79D3]/15 bg-black/35 px-3 py-2 text-sm font-bold text-white transition-all duration-200 hover:border-[#1A79D3]/50 hover:bg-[#1A79D3]/10 hover:text-[#6fb5f4]"
                          >
                            <Eye className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            <span>View Details</span>
                          </Link>

                          {user.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleDeactivateUser(user)}
                              disabled={actionLoading}
                              className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <UserX className="h-4 w-4" />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenActivateModal(user)}
                              disabled={actionLoading}
                              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#1A79D3]/40 bg-[#1A79D3]/10 px-3 py-2 text-sm font-bold text-[#6fb5f4] transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <UserCheck className="h-4 w-4" />
                              Activate
                            </button>
                          )}
                        </div>
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
      </div>

      <AnimatePresence>
        {activateModalOpen && activatingUser && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#1A79D3]/20 bg-[#050607] shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between border-b border-[#1A79D3]/20 bg-[#1A79D3]/10 px-5 py-4">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Activate Affiliate User
                  </h2>
                  <p className="mt-1 text-xs text-slate-300">
                    Set commission rates before activating this affiliate.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseActivateModal}
                  disabled={actionLoading}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 md:p-6">
                <div className="mb-5 rounded-2xl border border-white/10 bg-black/35 p-4">
                  <p className="text-xs font-bold text-[#6fb5f4]">
                    Selected User
                  </p>
                  <h3 className="mt-1 text-lg font-black text-white">
                    {activatingUser.userId}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {activatingUser.phone || "N/A"}
                    {activatingUser.email ? ` • ${activatingUser.email}` : ""}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CommissionInput
                    label="Game Loss Commission"
                    name="gameLossCommission"
                    value={commissionData.gameLossCommission}
                    onChange={handleCommissionChange}
                  />

                  <CommissionInput
                    label="Deposit Commission"
                    name="depositCommission"
                    value={commissionData.depositCommission}
                    onChange={handleCommissionChange}
                  />

                  <CommissionInput
                    label="Refer Commission"
                    name="referCommission"
                    value={commissionData.referCommission}
                    onChange={handleCommissionChange}
                  />

                  <CommissionInput
                    label="Game Win Commission"
                    name="gameWinCommission"
                    value={commissionData.gameWinCommission}
                    onChange={handleCommissionChange}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 px-5 pb-5 md:flex-row md:justify-end md:px-6 md:pb-6">
                <button
                  type="button"
                  onClick={handleCloseActivateModal}
                  disabled={actionLoading}
                  className="cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-5 py-3 text-sm font-bold text-white transition hover:border-[#1A79D3]/40 hover:bg-[#1A79D3]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleActivateUser}
                  disabled={actionLoading}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      Activate User
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

const CommissionInput = ({ label, name, value, onChange }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-200">
        {label}
      </label>

      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min="0"
        step="0.01"
        placeholder={`Enter ${label}`}
        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]"
      />
    </div>
  );
};

const LoadingBox = () => {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-black/25 p-8 text-slate-300">
      <Loader2 className="h-5 w-5 animate-spin text-[#1A79D3]" />
      Loading affiliate users...
    </div>
  );
};

const EmptyBox = () => {
  return (
    <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/25 p-8 text-center text-slate-300">
      No affiliate users found
    </div>
  );
};

export default AllAffiliateUser;
