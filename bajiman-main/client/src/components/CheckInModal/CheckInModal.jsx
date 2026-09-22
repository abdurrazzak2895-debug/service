import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  FaCheck,
  FaClock,
  FaCoins,
  FaGift,
  FaInfoCircle,
  FaLock,
  FaSyncAlt,
  FaTimes,
  FaTrophy,
  FaWallet,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectAuth, selectIsAuth } from "../../features/auth/authSelectors";
import LoginModal from "../LoginModal/LoginModal";

const calculateRemainingSeconds = (nextClaimAt) => {
  if (!nextClaimAt) return 0;

  return Math.max(
    Math.ceil((new Date(nextClaimAt).getTime() - Date.now()) / 1000),
    0,
  );
};

const CheckInModal = ({ open, onClose }) => {
  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const isAuthenticated = useSelector(selectIsAuth);
  const auth = useSelector(selectAuth);
  const token = auth?.token;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [congratulation, setCongratulation] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const loadCheckInStatus = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(
        isAuthenticated && token
          ? "/api/check-in-reward"
          : "/api/check-in-reward/public",
      );

      const result = response?.data;

      setData(result);
      setRemainingSeconds(
        isAuthenticated
          ? calculateRemainingSeconds(result?.progress?.nextClaimAt)
          : 0,
      );
    } catch (error) {
      setData(null);

      toast.error(
        error?.response?.data?.message ||
          t(
            "চেক-ইন তথ্য লোড করা যায়নি",
            "Failed to load Check-In information",
          ),
      );
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (open) {
      loadCheckInStatus();
      setCongratulation(null);
    }
  }, [open, loadCheckInStatus]);

  useEffect(() => {
    if (!open || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open, remainingSeconds > 0]);

  useEffect(() => {
    if (remainingSeconds === 0 && data?.progress?.nextClaimAt) {
      const nextClaimTime = new Date(data.progress.nextClaimAt).getTime();

      if (Date.now() >= nextClaimTime) {
        setData((previous) => {
          if (!previous) return previous;

          return {
            ...previous,

            progress: {
              ...previous.progress,
              canClaim: previous.setting?.isActive === true,
            },

            days: previous.days?.map((day) => ({
              ...day,
              status: day.isCurrent ? "available" : day.status,
              canClaim: day.isCurrent,
            })),
          };
        });
      }
    }
  }, [remainingSeconds, data?.progress?.nextClaimAt, data?.setting?.isActive]);

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(Number(seconds || 0), 0);

    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;

    return [hours, minutes, secs]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const formatAmount = (amount, rewardType) => {
    if (rewardType === "reward_coin") {
      return `${Number(amount || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;
    }

    return `৳${Number(amount || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}`;
  };

  const getDayName = (day) =>
    (isBangla ? day?.dayName?.bn : day?.dayName?.en) ||
    day?.dayName?.en ||
    day?.dayName?.bn ||
    `${t("দিন", "Day")} ${day?.dayNumber || ""}`;

  const claimedCount = useMemo(
    () => (data?.days || []).filter((day) => day.status === "claimed").length,
    [data?.days],
  );

  const totalDays = data?.days?.length || 0;

  const gridDays = useMemo(
    () => (data?.days || []).slice(0, -1),
    [data?.days],
  );

  const lastDay = useMemo(() => {
    const days = data?.days || [];
    return days.length ? days[days.length - 1] : null;
  }, [data?.days]);

  const canClaim =
    isAuthenticated &&
    Boolean(data?.progress?.canClaim) &&
    Boolean(data?.setting?.isActive) &&
    remainingSeconds <= 0 &&
    !claiming;

  const claimButtonDisabled = isAuthenticated
    ? !canClaim
    : !data?.setting?.isActive;

  const handleClaim = async () => {
    if (!isAuthenticated || !token) {
      setLoginOpen(true);
      return;
    }

    if (!canClaim) return;

    try {
      setClaiming(true);

      const response = await api.post("/api/check-in-reward/claim");
      const result = response?.data;

      setCongratulation({
        dayName: result?.claimedDay?.dayName,
        rewards: result?.claimedDay?.rewards || [],
      });

      toast.success(
        result?.message ||
          t("দৈনিক প্রস্কার সফলভাবে পাওয়া গেছে", "Daily reward claimed successfully"),
      );

      await loadCheckInStatus();
    } catch (error) {
      const result = error?.response?.data;

      if (result?.remainingTime) {
        setRemainingSeconds(Number(result.remainingTime.remainingSeconds || 0));
      }

      toast.error(
        result?.message || t("প্রস্কার ক্লেইম করা যায়নি", "Failed to claim reward"),
      );
    } finally {
      setClaiming(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-[#2b2b2b] shadow-2xl"
          >
            {/* Header */}
            <div className="relative flex h-14 shrink-0 items-center justify-center bg-[#1c1c1c]">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-white">
                {(isBangla ? data?.setting?.title?.bn : data?.setting?.title?.en) ||
                  t("দৈনিক চেক ইন", "Daily Check In")}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <ModalLoading />
              ) : !data?.setting ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <FaGift className="text-5xl text-[#ffc800]" />

                  <h3 className="mt-4 text-sm font-extrabold text-white">
                    {t("চেক-ইন রিওয়ার্ড পাওয়া যায়নি", "Check-In reward is not available")}
                  </h3>
                </div>
              ) : (
                <>
                  {!data.setting.isActive && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-xs font-bold text-red-300">
                      {t(
                        "চেক-ইন রিওয়ার্ড বর্তমানে বন্ধ রয়েছে।",
                        "Check-In reward is currently inactive.",
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2.5">
                    {gridDays.map((day) => (
                      <DayTile key={day._id || day.dayNumber} day={day} t={t} dayLabel={getDayName(day)} formatAmount={formatAmount} />
                    ))}
                  </div>

                  {lastDay && (
                    <div className="mt-2.5">
                      <DayTile
                        day={lastDay}
                        t={t}
                        dayLabel={getDayName(lastDay)}
                        formatAmount={formatAmount}
                        wide
                      />
                    </div>
                  )}

                  <div className="mt-4 text-center text-xs font-semibold text-white/60">
                    {t("অগ্রগতি", "Progress")}: {claimedCount}/{totalDays}
                  </div>

                  <div className="relative mt-2 flex items-center justify-center gap-2">
                    {remainingSeconds > 0 && (
                      <>
                        <span className="text-xs font-semibold text-white/60">
                          {t("পরবর্তী লগইন", "Next login")}:
                        </span>
                        <span className="text-sm font-extrabold text-amber-400">
                          {formatTime(remainingSeconds)}
                        </span>

                        <button
                          type="button"
                          onClick={() => setShowInfo((prev) => !prev)}
                          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20"
                        >
                          <FaInfoCircle size={11} />
                        </button>

                        {showInfo && (
                          <div className="absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-lg bg-black/90 p-3 text-center text-[11px] leading-5 text-white/80 shadow-xl">
                            {t(
                              "একবার ক্লেইম করার পর পরবর্তী Day আনলক হতে ২৪ ঘণ্টা সময় লাগবে। শেষ দিনের পর আবার Day 1 শুরু হবে।",
                              "After claiming, the next Day will unlock in 24 hours. After the final day, the cycle restarts from Day 1.",
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!isAuthenticated && data.setting.isActive && (
                    <p className="mt-3 text-center text-[11px] text-white/45">
                      {t(
                        "ক্লেইম করতে প্রথমে লগইন করুন",
                        "Log in first to claim your reward",
                      )}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={claimButtonDisabled}
                    onClick={handleClaim}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-extrabold uppercase tracking-wide transition ${
                      !claimButtonDisabled
                        ? "cursor-pointer bg-gradient-to-r from-emerald-400 to-green-600 text-white shadow-[0_6px_18px_rgba(34,197,94,0.35)] hover:from-emerald-300 hover:to-green-500 active:scale-[0.99]"
                        : "cursor-not-allowed bg-white/10 text-white/35"
                    }`}
                  >
                    {claiming ? (
                      <>
                        <FaSyncAlt className="animate-spin" />
                        {t("ক্লেইম হচ্ছে...", "Claiming...")}
                      </>
                    ) : remainingSeconds > 0 ? (
                      <>
                        <FaClock />
                        {t("অপেক্ষা করুন", "Please Wait")}
                      </>
                    ) : !data.setting.isActive ? (
                      <>
                        <FaLock />
                        {t("বন্ধ আছে", "Inactive")}
                      </>
                    ) : (
                      t("চেক ইন", "Check In")
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {congratulation && (
              <CongratulationOverlay
                data={congratulation}
                isBangla={isBangla}
                formatAmount={formatAmount}
                onClose={() => setCongratulation(null)}
              />
            )}
          </AnimatePresence>

          <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DayTile = ({ day, t, dayLabel, formatAmount, wide }) => {
  const isToday = day.isCurrent;
  const isClaimed = day.status === "claimed";

  return (
    <div
      className={`overflow-hidden rounded-xl ${wide ? "flex items-stretch" : ""}`}
    >
      <div
        className={`${
          wide ? "flex w-full flex-col" : "flex flex-col"
        } w-full overflow-hidden rounded-xl`}
      >
        <div
          className={`flex h-8 items-center justify-center text-[11px] font-extrabold uppercase text-black ${
            isToday ? "bg-[#ffd400]" : "bg-emerald-500 text-white"
          }`}
        >
          {isToday ? t("আজ", "Today") : dayLabel}
        </div>

        <div
          className={`relative flex flex-1 flex-col items-center justify-center gap-2 bg-[#3a3a3a] px-2 py-4 ${
            wide ? "flex-row flex-wrap gap-4 py-5" : ""
          }`}
        >
          {isClaimed && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
              <FaCheck size={8} />
            </span>
          )}

          {(day.rewards || []).map((reward, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#ffe879] to-[#ffc400] text-black shadow-[0_0_12px_rgba(255,196,0,0.35)]">
                {reward.iconUrl ? (
                  <img
                    src={reward.iconUrl}
                    alt="reward"
                    className="h-full w-full object-contain p-1"
                  />
                ) : reward.rewardType === "balance" ? (
                  <FaWallet size={14} />
                ) : (
                  <FaCoins size={14} />
                )}
              </div>

              <span className="text-[11px] font-bold text-white">
                {formatAmount(reward.amount, reward.rewardType)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CongratulationOverlay = ({ data, isBangla, formatAmount, onClose }) => {
  const t = (bn, en) => (isBangla ? bn : en);

  const dayName =
    (isBangla ? data?.dayName?.bn : data?.dayName?.en) ||
    data?.dayName?.en ||
    data?.dayName?.bn ||
    "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.6, y: 60, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl bg-[#2b2b2b] p-6 text-center shadow-2xl sm:p-8"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -5, 5, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 1 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe879] to-[#ffc400] text-5xl text-black shadow-[0_10px_35px_rgba(255,196,0,0.45)]"
        >
          <FaTrophy />
        </motion.div>

        <h2 className="mt-5 text-2xl font-black text-white">
          {t("অভিনন্দন!", "Congratulations!")}
        </h2>

        <p className="mt-2 text-sm text-white/55">
          {t(`${dayName} সফলভাবে ক্লেইম করেছেন`, `You successfully claimed ${dayName}`)}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          {(data?.rewards || []).map((reward, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#ffe879] to-[#ffc400] text-black">
                {reward.iconUrl ? (
                  <img
                    src={reward.iconUrl}
                    alt="reward"
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : reward.rewardType === "balance" ? (
                  <FaWallet size={18} />
                ) : (
                  <FaCoins size={18} />
                )}
              </div>

              <span className="text-lg font-black text-amber-400">
                {formatAmount(reward.amount, reward.rewardType)}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-full bg-gradient-to-r from-emerald-400 to-green-600 py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(34,197,94,0.35)] transition hover:from-emerald-300 hover:to-green-500 active:scale-95"
        >
          {t("ধন্যবাদ", "Awesome!")}
        </button>
      </motion.div>
    </motion.div>
  );
};

const ModalLoading = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-3 gap-2.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-24 rounded-xl bg-white/5" />
      ))}
    </div>

    <div className="mt-2.5 h-20 rounded-xl bg-white/5" />
    <div className="mt-4 h-12 rounded-full bg-white/5" />
  </div>
);

export default CheckInModal;
