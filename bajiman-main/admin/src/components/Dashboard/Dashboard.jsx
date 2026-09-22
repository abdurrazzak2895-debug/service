import React, { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserFriends,
  FaGamepad,
  FaWallet,
  FaHourglassHalf,
  FaArrowCircleDown,
  FaArrowCircleUp,
  FaChartPie,
  FaChartBar,
  FaCalendarAlt,
  FaClock,
  FaSyncAlt,
  FaCalendarDay,
} from "react-icons/fa";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const money = (value) => {
  const num = Number(value || 0);
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const pad2 = (value) => String(value).padStart(2, "0");

const toDateStr = (date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const emptyTodayCards = {
  allUsers: 0,
  activeUsers: 0,
  allAffiliateUsers: 0,
  allDepositBalances: 0,
  pendingDepositRequest: 0,
  allWithdrawBalances: 0,
  pendingWithdrawRequest: 0,
  allGames: 0,
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(() => toDateStr(new Date()));
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayCards, setTodayCards] = useState(emptyTodayCards);

  // Decoupled from `now` (the live-ticking clock) so browsing the
  // calendar to another month/year doesn't get reset every second.
  const [calendarViewYear, setCalendarViewYear] = useState(
    () => new Date().getFullYear(),
  );
  const [calendarViewMonth, setCalendarViewMonth] = useState(
    () => new Date().getMonth(),
  );

  const [summary, setSummary] = useState({
    cards: {
      allUsers: 0,
      activeUsers: 0,
      allAffiliateUsers: 0,
      allDepositBalances: 0,
      pendingDepositRequest: 0,
      allWithdrawBalances: 0,
      pendingWithdrawRequest: 0,
      allGames: 0,
      activeGames: 0,
    },
    chart: {
      users: { active: 0, inactive: 0 },
      requests: {
        pendingDeposit: 0,
        pendingWithdraw: 0,
        approvedDepositAmount: 0,
        approvedWithdrawAmount: 0,
      },
    },
    latest: {
      users: [],
      deposits: [],
      withdraws: [],
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/summary");
      setSummary(res?.data?.data || {});
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchTodaySummary = async (dateStr) => {
    try {
      setTodayLoading(true);
      const res = await api.get("/api/dashboard/today", {
        params: { date: dateStr },
      });
      setTodayCards(res?.data?.data?.cards || emptyTodayCards);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load today's summary",
      );
    } finally {
      setTodayLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySummary(selectedDate);
  }, [selectedDate]);

  const cards = useMemo(() => {
    const c = summary?.cards || {};

    return [
      {
        title: "All Users",
        value: c.allUsers || 0,
        icon: <FaUsers />,
        to: "/all-users",
      },
      {
        title: "Active Users",
        value: c.activeUsers || 0,
        icon: <FaUserCheck />,
        to: "/all-users",
      },
      {
        title: "All Affiliate Users",
        value: c.allAffiliateUsers || 0,
        icon: <FaUserFriends />,
        to: "/all-affiliate-users",
      },
      {
        title: "All Deposit Balances",
        value: money(c.allDepositBalances),
        icon: <FaArrowCircleDown />,
        to: "/auto-deposit-history",
      },
      {
        title: "Pending Deposit Request",
        value: c.pendingDepositRequest || 0,
        icon: <FaHourglassHalf />,
        to: "/deposit-requests",
      },
      {
        title: "All Withdraw Balance",
        value: money(c.allWithdrawBalances),
        icon: <FaArrowCircleUp />,
        to: "/withdraw-requests",
      },
      {
        title: "Pending Withdraw Request",
        value: c.pendingWithdrawRequest || 0,
        icon: <FaWallet />,
        to: "/withdraw-requests",
      },
      {
        title: "All Games",
        value: c.allGames || 0,
        icon: <FaGamepad />,
        to: "/add-game",
      },
    ];
  }, [summary]);

  // Same 8 metrics as above, scoped to whichever date is selected on the
  // calendar (defaults to today) — a fresh fetch every date change, since
  // this is inherently a "figures reset each day" view.
  const todayCardsList = useMemo(() => {
    const c = todayCards || {};

    return [
      { title: "All Users", value: c.allUsers || 0, icon: <FaUsers />, to: "/all-users" },
      { title: "Active Users", value: c.activeUsers || 0, icon: <FaUserCheck />, to: "/all-users" },
      { title: "All Affiliate Users", value: c.allAffiliateUsers || 0, icon: <FaUserFriends />, to: "/all-affiliate-users" },
      { title: "All Deposit Balances", value: money(c.allDepositBalances), icon: <FaArrowCircleDown />, to: "/auto-deposit-history" },
      { title: "Pending Deposit Request", value: c.pendingDepositRequest || 0, icon: <FaHourglassHalf />, to: "/deposit-requests" },
      { title: "All Withdraw Balance", value: money(c.allWithdrawBalances), icon: <FaArrowCircleUp />, to: "/withdraw-requests" },
      { title: "Pending Withdraw Request", value: c.pendingWithdrawRequest || 0, icon: <FaWallet />, to: "/withdraw-requests" },
      { title: "All Games", value: c.allGames || 0, icon: <FaGamepad />, to: "/add-game" },
    ];
  }, [todayCards]);

  const todayStr = toDateStr(new Date());
  const isSelectedToday = selectedDate === todayStr;

  const activeUsers = Number(summary?.chart?.users?.active || 0);
  const inactiveUsers = Number(summary?.chart?.users?.inactive || 0);
  const totalUsersForPie = activeUsers + inactiveUsers;

  const activePercent = totalUsersForPie
    ? Math.round((activeUsers / totalUsersForPie) * 100)
    : 0;

  const inactivePercent = totalUsersForPie ? 100 - activePercent : 0;

  const requestBars = useMemo(() => {
    const req = summary?.chart?.requests || {};

    const data = [
      { label: "Pending Deposit", value: Number(req.pendingDeposit || 0) },
      { label: "Pending Withdraw", value: Number(req.pendingWithdraw || 0) },
      {
        label: "Deposit Amount",
        value: Number(req.approvedDepositAmount || 0),
      },
      {
        label: "Withdraw Amount",
        value: Number(req.approvedWithdrawAmount || 0),
      },
    ];

    const max = Math.max(...data.map((item) => item.value), 1);

    return data.map((item) => ({
      ...item,
      height: `${Math.max((item.value / max) * 100, item.value > 0 ? 12 : 4)}%`,
    }));
  }, [summary]);

  const calendarData = useMemo(() => {
    const year = calendarViewYear;
    const month = calendarViewMonth;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const realToday = new Date();

    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ day: d, dateStr: `${year}-${pad2(month + 1)}-${pad2(d)}` });
    }

    const isCurrentMonth =
      realToday.getFullYear() === year && realToday.getMonth() === month;

    return {
      monthLabel: firstDay.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      today: isCurrentMonth ? realToday.getDate() : null,
      days,
    };
  }, [calendarViewYear, calendarViewMonth]);

  const goToPrevMonth = () => {
    setCalendarViewMonth((prev) => {
      if (prev === 0) {
        setCalendarViewYear((year) => year - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCalendarViewMonth((prev) => {
      if (prev === 11) {
        setCalendarViewYear((year) => year + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const goToCurrentMonth = () => {
    const current = new Date();
    setCalendarViewYear(current.getFullYear());
    setCalendarViewMonth(current.getMonth());
    setSelectedDate(toDateStr(current));
  };

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-full overflow-hidden text-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.08),transparent_38%)]" />

      <div className="relative z-10 rounded-[32px] border border-[#1A79D3]/20 bg-white shadow-2xl shadow-black/10 backdrop-blur-xl overflow-hidden">
        <div className="border-b border-[#1A79D3]/20 bg-[#1A79D3]/5 px-4 sm:px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl border border-[#1A79D3]/30 bg-[#1A79D3]/10 flex items-center justify-center shadow-[0_0_45px_rgba(26,121,211,0.25)]">
                <FaChartBar className="text-2xl text-[#3ea0ff]" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl md:text-3xl font-black text-transparent">
                  Dashboard Overview
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Admin panel summary, charts, calendar and recent activity
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 font-bold text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
            {cards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => navigate(card.to)}
                className="cursor-pointer text-left rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#1A79D3]/70 hover:shadow-[0_0_35px_rgba(26,121,211,0.22)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">
                      {card.title}
                    </p>
                    <h3 className="mt-3 text-2xl md:text-3xl font-black text-slate-800 break-words">
                      {card.value}
                    </h3>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] flex items-center justify-center text-white text-2xl shadow-[0_12px_35px_rgba(26,121,211,0.28)]">
                    {card.icon}
                  </div>
                </div>

                <div className="mt-5 text-xs text-[#6fb5f4]">Click to open</div>
              </button>
            ))}
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1A79D3]/15 flex items-center justify-center">
                  <FaCalendarDay className="text-lg text-[#3ea0ff]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {isSelectedToday ? "Today's Summary" : "Selected Day Summary"}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {selectedDate}
                    {isSelectedToday ? " (আজকে)" : ""} — প্রতিদিন নতুন করে হিসাব
                    হয়
                  </p>
                </div>
              </div>

              {!isSelectedToday ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2 text-sm font-semibold text-[#1A79D3] transition hover:bg-[#1A79D3]/20"
                >
                  Back to Today
                </button>
              ) : null}
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 transition-opacity ${todayLoading ? "opacity-60" : "opacity-100"}`}
            >
              {todayCardsList.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => navigate(card.to)}
                  className="cursor-pointer text-left rounded-[28px] border border-[#1A79D3]/15 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#1A79D3]/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">
                        {card.title}
                      </p>
                      <h3 className="mt-3 text-xl md:text-2xl font-black text-slate-800 break-words">
                        {card.value}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#1A79D3]/10 flex items-center justify-center text-[#1A79D3] text-xl">
                      {card.icon}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#1A79D3]/20 flex items-center justify-center">
                  <FaChartPie className="text-xl text-[#3ea0ff]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    User Status Chart
                  </h2>
                  <p className="text-sm text-slate-600">
                    Active vs inactive users
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div
                  className="relative w-52 h-52 rounded-full border border-[#1A79D3]/20 shadow-inner"
                  style={{
                    background: `conic-gradient(#1A79D3 0% ${activePercent}%, #ef4444 ${activePercent}% 100%)`,
                  }}
                >
                  <div className="absolute inset-[22px] rounded-full bg-white border border-[#1A79D3]/20 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">
                      {totalUsersForPie}
                    </span>
                    <span className="text-sm text-slate-600">Total Users</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <StatusRow
                    label="Active Users"
                    value={activeUsers}
                    percent={activePercent}
                    color="from-[#3ea0ff] to-[#1A79D3]"
                  />

                  <StatusRow
                    label="Inactive Users"
                    value={inactiveUsers}
                    percent={inactivePercent}
                    color="from-red-400 to-rose-500"
                    red
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 md:p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#1A79D3]/20 flex items-center justify-center">
                  <FaChartBar className="text-xl text-[#3ea0ff]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Requests & Amount Chart
                  </h2>
                  <p className="text-sm text-slate-600">
                    Deposit / withdraw overview
                  </p>
                </div>
              </div>

              <div className="h-[320px] rounded-[28px] border border-[#1A79D3]/15 bg-slate-50 p-4">
                <div className="h-full flex items-end justify-between gap-3">
                  {requestBars.map((bar) => (
                    <div
                      key={bar.label}
                      className="flex-1 h-full flex flex-col items-center justify-end gap-3"
                    >
                      <div className="text-[11px] md:text-xs text-slate-800 font-semibold text-center break-words">
                        {bar.value.toLocaleString("en-US")}
                      </div>

                      <div className="w-full flex items-end justify-center h-[220px]">
                        <div
                          className="w-full max-w-[70px] rounded-t-2xl bg-gradient-to-t from-[#0d5fa8] via-[#1A79D3] to-[#6fb5f4] shadow-[0_12px_35px_rgba(26,121,211,0.25)] transition-all duration-500"
                          style={{ height: bar.height }}
                        />
                      </div>

                      <div className="text-[10px] md:text-xs text-slate-600 text-center leading-tight min-h-[30px]">
                        {bar.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 md:p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A79D3]/20 flex items-center justify-center">
                    <FaCalendarAlt className="text-xl text-[#3ea0ff]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Calendar
                    </h2>
                    <p className="text-sm text-slate-600">
                      {calendarData.monthLabel}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevMonth}
                    className="cursor-pointer w-9 h-9 rounded-xl border border-[#1A79D3]/25 bg-white text-[#1A79D3] font-bold hover:bg-[#1A79D3]/10 transition"
                    aria-label="Previous month"
                  >
                    ‹
                  </button>

                  <select
                    value={calendarViewMonth}
                    onChange={(e) => setCalendarViewMonth(Number(e.target.value))}
                    className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-white px-2 py-2 text-sm font-semibold text-slate-800"
                  >
                    {Array.from({ length: 12 }).map((_, monthIndex) => (
                      <option key={monthIndex} value={monthIndex}>
                        {new Date(2000, monthIndex, 1).toLocaleString("en-US", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={calendarViewYear}
                    onChange={(e) =>
                      setCalendarViewYear(
                        Number(e.target.value) || calendarViewYear,
                      )
                    }
                    className="w-24 rounded-xl border border-[#1A79D3]/25 bg-white px-2 py-2 text-sm font-semibold text-slate-800"
                  />

                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className="cursor-pointer w-9 h-9 rounded-xl border border-[#1A79D3]/25 bg-white text-[#1A79D3] font-bold hover:bg-[#1A79D3]/10 transition"
                    aria-label="Next month"
                  >
                    ›
                  </button>

                  <button
                    type="button"
                    onClick={goToCurrentMonth}
                    className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-3 py-2 text-sm font-semibold text-[#1A79D3] hover:bg-[#1A79D3]/20 transition"
                  >
                    Today
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-3">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs md:text-sm font-semibold text-[#6fb5f4] py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarData.days.map((item, index) => {
                  if (!item) {
                    return (
                      <div key={index} className="h-12 sm:h-16 border border-transparent bg-transparent" />
                    );
                  }

                  const isToday = item.day === calendarData.today;
                  const isSelected = item.dateStr === selectedDate;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`h-12 sm:h-16 cursor-pointer rounded-2xl border flex items-center justify-center text-sm md:text-base font-semibold transition ${
                        isSelected
                          ? "border-[#3ea0ff] bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white shadow-[0_0_30px_rgba(26,121,211,0.30)]"
                          : isToday
                            ? "border-[#3ea0ff]/60 bg-[#1A79D3]/10 text-[#1A79D3]"
                            : "border-[#1A79D3]/20 bg-slate-50 text-slate-800 hover:border-[#1A79D3]/50"
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-slate-500">
                একটা তারিখে ক্লিক করলে নিচের "Today's Summary" কার্ডগুলো ওই
                দিনের হিসাব দেখাবে
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 md:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A79D3]/20 flex items-center justify-center">
                    <FaClock className="text-xl text-[#3ea0ff]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Current Time
                    </h2>
                    <p className="text-sm text-slate-600">Live date & time</p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 text-center">
                  <div className="text-3xl md:text-4xl font-black tracking-wide text-slate-800">
                    {time}
                  </div>
                  <div className="mt-3 text-sm md:text-base text-slate-600 leading-relaxed">
                    {date}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 md:p-6 shadow-xl">
                <h2 className="text-xl font-bold text-slate-800 mb-5">
                  Dashboard Summary
                </h2>

                <div className="space-y-3">
                  {[
                    ["Total Users", summary?.cards?.allUsers || 0],
                    ["Affiliate Users", summary?.cards?.allAffiliateUsers || 0],
                    ["Total Games", summary?.cards?.allGames || 0],
                    ["Active Games", summary?.cards?.activeGames || 0],
                    [
                      "Pending Deposits",
                      summary?.cards?.pendingDepositRequest || 0,
                    ],
                    [
                      "Pending Withdraws",
                      summary?.cards?.pendingWithdrawRequest || 0,
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-[#1A79D3]/20 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <span className="text-slate-600">{label}</span>
                      <span className="font-bold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <LatestCard
              title="Latest Users"
              emptyText="No user found"
              items={summary?.latest?.users || []}
              render={(user) => (
                <>
                  <div className="font-semibold text-slate-800">
                    {user?.userId || "N/A"}
                  </div>
                  <div className="text-sm text-slate-600 mt-1 break-all">
                    {user?.phone || "No phone"} • {user?.role || "N/A"}
                  </div>
                  <div className="text-xs text-[#6fb5f4] mt-1">
                    {user?.isActive ? "Active" : "Inactive"} •{" "}
                    {money(user?.balance)}
                  </div>
                </>
              )}
            />

            <LatestCard
              title="Latest Deposit Requests"
              emptyText="No deposit found"
              items={summary?.latest?.deposits || []}
              render={(item) => (
                <>
                  <div className="font-semibold text-slate-800">
                    {item?.user?.userId || item?.userIdentity || "Unknown User"}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Amount: {money(item?.amount)}
                  </div>
                  <div className="text-xs text-[#6fb5f4] mt-1 uppercase">
                    Status: {item?.status || "N/A"}
                  </div>
                </>
              )}
            />

            <LatestCard
              title="Latest Withdraw Requests"
              emptyText="No withdraw found"
              items={summary?.latest?.withdraws || []}
              render={(item) => (
                <>
                  <div className="font-semibold text-slate-800">
                    {item?.user?.userId || "Unknown User"}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Amount: {money(item?.amount)}
                  </div>
                  <div className="text-xs text-[#6fb5f4] mt-1 uppercase">
                    Status: {item?.status || "N/A"}
                  </div>
                </>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, value, percent, color, red = false }) => {
  return (
    <div className="rounded-2xl border border-[#1A79D3]/20 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <span
          className={`${red ? "text-red-300" : "text-[#6fb5f4]"} font-medium`}
        >
          {label}
        </span>
        <span className="text-slate-800 font-bold">{value}</span>
      </div>

      <div className="mt-3 h-3 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">{percent}% of total</div>
    </div>
  );
};

const LatestCard = ({ title, emptyText, items, render }) => {
  return (
    <div className="rounded-[28px] border border-[#1A79D3]/20 bg-slate-50 p-5 md:p-6 shadow-xl">
      <h2 className="text-xl font-bold text-slate-800 mb-5">{title}</h2>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#1A79D3]/15 bg-slate-50 p-4 text-slate-500 text-sm">
            {emptyText}
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item?._id || index}
              className="rounded-2xl border border-[#1A79D3]/15 bg-slate-50 p-4 transition-all hover:border-[#1A79D3]/60"
            >
              {render(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
