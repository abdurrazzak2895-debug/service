// src/pages/Reward/WhileOfFortune.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import {
  FaAngleLeft,
  FaAngleRight,
  FaCheckCircle,
  FaClock,
  FaCoins,
  FaGift,
  FaHistory,
  FaLock,
  FaSyncAlt,
  FaTimes,
  FaTrophy,
  FaUsers,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth } from "../../features/auth/authSelectors";
import LoginModal from "../../components/LoginModal/LoginModal";
import SiteLoader from "../../components/SiteLoader/SiteLoader";

const SPIN_DURATION = 5200;

const SPIN_BUTTON_IMAGE =
  "https://jiliwin.9terawolf.com/images/babu/wof/spinbutton.png";

const COIN_FRAME_IMAGE =
  "https://jiliwin.9terawolf.com/images/wof/Coin_Frame.png";

const WhileOfFortune = () => {
  const spinTimerRef = useRef(null);

  const { isBangla } = useLanguage();
  const t = (bn, en) => (isBangla ? bn : en);

  const isAuthenticated = useSelector(selectIsAuth);

  const [wheels, setWheels] = useState([]);

  const [selectedWheelId, setSelectedWheelId] = useState("");

  const [wheel, setWheel] = useState(null);

  const [eligibility, setEligibility] = useState(null);

  const [userWallet, setUserWallet] = useState({
    balance: 0,
    rewardCoin: 0,
    currency: "BDT",
  });

  const [myHistory, setMyHistory] = useState([]);

  const [winnerList, setWinnerList] = useState([]);

  const [resultTab, setResultTab] = useState("winners");

  const [loading, setLoading] = useState(true);

  const [wheelLoading, setWheelLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [spinning, setSpinning] = useState(false);

  const [rotation, setRotation] = useState(0);

  const [congratulation, setCongratulation] = useState(null);

  const [loginOpen, setLoginOpen] = useState(false);

  const resolveImage = (image = "") => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const baseUrl = String(
      import.meta.env.VITE_API_URL || api.defaults.baseURL || "",
    ).replace(/\/+$/, "");

    return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const getText = (value) => {
    return (isBangla ? value?.bn : value?.en) || value?.en || value?.bn || "";
  };

  const formatAmount = (amount, prizeType) => {
    const formatted = Number(amount || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD",
    );

    if (prizeType === "reward_coin") {
      return `${formatted} ${t("কয়েন", "Coins")}`;
    }

    if (prizeType === "no_prize") {
      return t("আবার চেষ্টা করুন", "Try Again");
    }

    return `৳${formatted}`;
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString(isBangla ? "bn-BD" : "en-BD", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maskUsername = (username = "") => {
    const value = String(username);

    if (!value) return "User";

    if (value.length <= 3) {
      return `${value.slice(0, 1)}***`;
    }

    return `${value.slice(0, 4)}${"*".repeat(Math.min(value.length - 4, 5))}`;
  };

  const loadWheels = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/wheels");

      const wheelList = [...(data?.wheels || [])].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      setWheels(wheelList);

      setUserWallet({
        balance: Number(data?.user?.balance || 0),

        rewardCoin: Number(data?.user?.rewardCoin || 0),

        currency: data?.user?.currency || "BDT",
      });

      if (wheelList.length > 0 && !selectedWheelId) {
        setSelectedWheelId(wheelList[0]._id);
      }

      if (
        selectedWheelId &&
        !wheelList.some((item) => item._id === selectedWheelId)
      ) {
        setSelectedWheelId(wheelList[0]?._id || "");
      }
    } catch (error) {
      setWheels([]);

      toast.error(
        error?.response?.data?.message ||
          t("হুইল লোড করা যায়নি", "Failed to load Wheels"),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedWheelId, isBangla]);

  const loadSelectedWheel = useCallback(async () => {
    if (!selectedWheelId) {
      setWheel(null);
      return;
    }

    try {
      setWheelLoading(true);

      const { data } = await api.get(`/api/wheels/${selectedWheelId}`);

      setWheel(data?.wheel || null);

      setEligibility(data?.eligibility || null);

      setUserWallet({
        balance: Number(data?.user?.balance || 0),

        rewardCoin: Number(data?.user?.rewardCoin || 0),

        currency: data?.user?.currency || "BDT",
      });

      setRotation(0);
    } catch (error) {
      setWheel(null);

      toast.error(
        error?.response?.data?.message ||
          t("হুইলের তথ্য পাওয়া যায়নি", "Failed to load Wheel details"),
      );
    } finally {
      setWheelLoading(false);
    }
  }, [selectedWheelId, isBangla]);

  const loadMyHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setMyHistory([]);
      return;
    }

    try {
      setHistoryLoading(true);

      const { data } = await api.get("/api/wheels/my/history", {
        params: {
          page: 1,
          limit: 30,
          status: "completed",
        },
      });

      setMyHistory(data?.history || []);
    } catch {
      setMyHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  const loadWinnerList = useCallback(async () => {
    try {
      const { data } = await api.get("/api/wheels/winners", {
        params: {
          limit: 30,
        },
      });

      setWinnerList(data?.winners || data?.history || []);
    } catch {
      setWinnerList([]);
    }
  }, []);

  useEffect(() => {
    loadWheels();
    loadMyHistory();
    loadWinnerList();
  }, [loadWheels, loadMyHistory, loadWinnerList]);

  useEffect(() => {
    loadSelectedWheel();
  }, [loadSelectedWheel]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  const sortedSegments = useMemo(
    () =>
      [...(wheel?.segments || [])].sort(
        (a, b) => Number(a.position) - Number(b.position),
      ),
    [wheel?.segments],
  );

  const wheelGradient = useMemo(() => {
    if (!sortedSegments.length) {
      return "#ffc800";
    }

    const degree = 360 / sortedSegments.length;

    const parts = sortedSegments.map((segment, index) => {
      const start = index * degree;

      const end = (index + 1) * degree;

      return `${segment.backgroundColor || "#ffc800"} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from -22.5deg, ${parts.join(", ")})`;
  }, [sortedSegments]);

  const selectedWheelIndex = wheels.findIndex(
    (item) => item._id === selectedWheelId,
  );

  const canGoPrevious =
    wheels.length > 1 && selectedWheelIndex > 0 && !spinning;

  const canGoNext =
    wheels.length > 1 && selectedWheelIndex < wheels.length - 1 && !spinning;

  const selectPreviousWheel = () => {
    if (!canGoPrevious) return;

    setSelectedWheelId(wheels[selectedWheelIndex - 1]._id);
  };

  const selectNextWheel = () => {
    if (!canGoNext) return;

    setSelectedWheelId(wheels[selectedWheelIndex + 1]._id);
  };

  const generateRequestId = () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return `spin-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const handleSpin = async () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }

    if (!wheel || spinning) return;

    if (Number(userWallet.rewardCoin) < Number(wheel.spinCost || 0)) {
      toast.error(t("পর্যাপ্ত রিওয়ার্ড কয়েন নেই", "Insufficient Reward Coins"));

      return;
    }

    if (!wheel.isActive) {
      toast.error(
        t("এই হুইলটি বর্তমানে বন্ধ আছে", "This Wheel is currently inactive"),
      );

      return;
    }

    if (!eligibility?.eligible) {
      toast.error(
        eligibility?.message ||
          t(
            "আপনি এই হুইল স্পিনের শর্ত পূর্ণ করেননি",
            "You have not completed the Wheel requirements",
          ),
      );

      return;
    }

    try {
      setSpinning(true);
      setCongratulation(null);

      const { data } = await api.post(`/api/wheels/${wheel._id}/spin`, {
        requestId: generateRequestId(),
      });

      const position = Number(data?.selectedPosition || 1);

      const segmentCount = sortedSegments.length || 8;

      const segmentDegree = 360 / segmentCount;

      const currentRotation = ((rotation % 360) + 360) % 360;

      const targetRotation = (360 - (position - 1) * segmentDegree) % 360;

      const difference = (targetRotation - currentRotation + 360) % 360;

      setRotation(rotation + 360 * 8 + difference);

      setUserWallet((previous) => ({
        ...previous,

        balance: Number(data?.user?.balance ?? previous.balance),

        rewardCoin: Number(data?.user?.rewardCoin ?? previous.rewardCoin),
      }));

      window.dispatchEvent(
        new CustomEvent("reward-coin-updated", {
          detail: {
            rewardCoin: data?.user?.rewardCoin,
          },
        }),
      );

      spinTimerRef.current = setTimeout(async () => {
        setSpinning(false);
        setCongratulation(data);

        await Promise.all([loadMyHistory(), loadWinnerList()]);
      }, SPIN_DURATION);
    } catch (error) {
      setSpinning(false);

      toast.error(
        error?.response?.data?.message ||
          t("স্পিন সম্পন্ন করা যায়নি", "Wheel Spin failed"),
      );
    }
  };

  if (loading) {
    return <SiteLoader />;
  }

  if (!wheels.length) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#570052] p-5">
        <div className="text-center text-white">
          <FaGift className="mx-auto text-6xl text-[#ffc800]" />

          <h2 className="mt-4 text-xl font-black">
            {t("কোনো সক্রিয় হুইল পাওয়া যায়নি", "No active Wheel available")}
          </h2>
        </div>
      </div>
    );
  }

  const design = {
    pageBackgroundColor: wheel?.design?.pageBackgroundColor || "#66005f",

    wheelBorderColor: wheel?.design?.wheelBorderColor || "#d89d00",

    wheelBorderWidth: Number(wheel?.design?.wheelBorderWidth || 8),

    pointerColor: wheel?.design?.pointerColor || "#ffc800",

    titleColor: wheel?.design?.titleColor || "#ffffff",

    descriptionColor: wheel?.design?.descriptionColor || "#ffffff",

    costBoxColor: wheel?.design?.costBoxColor || "#ffc800",

    costTextColor: wheel?.design?.costTextColor || "#000000",
  };

  const pageBackground = wheel?.backgroundImage
    ? `url("${resolveImage(wheel.backgroundImage)}")`
    : "radial-gradient(circle at center, #b100a5, #550052 55%, #220021)";

  return (
    <>
      <style>{`
        @keyframes glass-shine-sequence {
          0% {
            transform: translateX(-260%) skewX(-22deg);
            opacity: 0;
          }
          6% {
            opacity: 1;
          }
          25% {
            opacity: 1;
          }
          41% {
            transform: translateX(360%) skewX(-22deg);
            opacity: 1;
          }
          48%, 100% {
            transform: translateX(360%) skewX(-22deg);
            opacity: 0;
          }
        }

        @keyframes glass-bling-sequence {
          0%, 7% {
            opacity: 0;
            transform: scale(.3) rotate(0deg);
          }
          18% {
            opacity: 1;
            transform: scale(1.15) rotate(90deg);
          }
          31% {
            opacity: .45;
            transform: scale(.72) rotate(180deg);
          }
          43%, 100% {
            opacity: 0;
            transform: scale(.3) rotate(270deg);
          }
        }

        .coin-frame-shine,
        .spin-glass-shine {
          animation: glass-shine-sequence 6s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
          will-change: transform, opacity;
        }

        .coin-frame-bling,
        .spin-bling {
          animation: glass-bling-sequence 6s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .spin-glass-shine,
        .spin-bling {
          animation-delay: 3s;
        }

        @media (prefers-reduced-motion: reduce) {
          .coin-frame-shine,
          .coin-frame-bling,
          .spin-glass-shine,
          .spin-bling {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>

      <div
        className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat px-3 py-5 sm:px-5 lg:px-8"
        style={{
          backgroundColor: design.pageBackgroundColor,

          backgroundImage: pageBackground,

          backgroundAttachment: "fixed",
        }}
      >
        <FloatingDecorations />

        <div className="relative z-10 mx-auto max-w-[1500px]">
          {/* Header */}
          <div className="mb-5 flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-between">
            <div className="text-center lg:text-left">
              <h1
                className="text-2xl font-black drop-shadow-[0_3px_3px_rgba(0,0,0,.9)] sm:text-3xl"
                style={{
                  color: design.titleColor,
                }}
              >
                {getText(wheel?.title) ||
                  t("হুইল অফ ফরচুন", "Wheel of Fortune")}
              </h1>
            </div>

            {isAuthenticated && (
              <CoinBalanceFrame
                amount={userWallet.rewardCoin}
                isBangla={isBangla}
              />
            )}
          </div>

          {/* Desktop main layout */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[270px_minmax(0,1fr)_315px]">
            <PrizeList
              segments={sortedSegments}
              getText={getText}
              formatAmount={formatAmount}
              title={t("প্রস্কারের তালিকা", "Prize Pool")}
            />

            {/* Center Wheel */}
            <div className="order-1 flex min-w-0 flex-col items-center justify-center xl:order-2">
              {wheelLoading ? (
                <div className="flex h-[400px] items-center justify-center text-white">
                  <FaSyncAlt className="animate-spin text-5xl text-yellow-400" />
                </div>
              ) : (
                <>
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="mb-6 rounded-xl px-6 py-2 text-center text-sm font-extrabold shadow-[0_5px_15px_rgba(0,0,0,.5)]"
                    style={{
                      backgroundColor: design.costBoxColor,

                      color: design.costTextColor,
                    }}
                  >
                    <FaCoins className="mr-2 inline" />
                    {wheel?.spinCost} {t("কয়েন / স্পিন", "Coins / Spin")}
                  </motion.div>

                  <div className="relative">
                    {/* Pointer */}
                    <motion.div
                      animate={{
                        y: [0, 4, 0],
                      }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                      }}
                      className="absolute left-1/2 top-[-31px] z-50 -translate-x-1/2 border-x-[23px] border-t-[43px] border-x-transparent drop-shadow-xl"
                      style={{
                        borderTopColor: design.pointerColor,
                      }}
                    />

                    {/* Outer ring */}
                    <div className="pointer-events-none absolute -inset-4 rounded-full border-[7px] border-[#b87b14] bg-[#8a4d0b] shadow-[0_0_40px_rgba(255,205,0,.9)]" />

                    {/* Outer lights */}
                    {Array.from({ length: 20 }, (_, index) => {
                      const angle = (index / 20) * 360;

                      return (
                        <motion.span
                          key={index}
                          animate={{
                            opacity: [0.45, 1, 0.45],

                            scale: [0.8, 1.25, 0.8],
                          }}
                          transition={{
                            duration: 1,
                            delay: index * 0.05,
                            repeat: Infinity,
                          }}
                          className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-3.5 w-3.5 rounded-full bg-yellow-100 shadow-[0_0_12px_#fff600]"
                          style={{
                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(min(82vw, 500px) / -2 - 8px))`,
                          }}
                        />
                      );
                    })}

                    {/* Rotating Wheel */}
                    <div
                      className="relative h-[min(82vw,500px)] w-[min(82vw,500px)] overflow-hidden rounded-full"
                      style={{
                        background: wheelGradient,

                        border: `${design.wheelBorderWidth}px solid ${design.wheelBorderColor}`,

                        transform: `rotate(${rotation}deg)`,

                        transition: spinning
                          ? `transform ${SPIN_DURATION}ms cubic-bezier(.12,.58,.08,1)`
                          : "none",

                        boxShadow:
                          "inset 0 0 0 5px rgba(255,255,255,.28), 0 0 35px rgba(255,200,0,.75)",
                      }}
                    >
                      {sortedSegments.map((_, index) => (
                        <span
                          key={`divider-${index}`}
                          className="absolute left-1/2 top-1/2 h-1/2 w-[2px] origin-bottom bg-white/60"
                          style={{
                            transform: `translate(-50%, -100%) rotate(${
                              index * 45 - 22.5
                            }deg)`,
                          }}
                        />
                      ))}

                      {sortedSegments.map((segment, index) => (
                        <div
                          key={segment._id || segment.position}
                          className="pointer-events-none absolute inset-0"
                          style={{
                            transform: `rotate(${index * 45}deg)`,
                          }}
                        >
                          <div
                            className="absolute left-1/2 top-[7%] w-[32%] -translate-x-1/2 text-center font-black leading-tight drop-shadow-[0_2px_1px_rgba(0,0,0,.4)]"
                            style={{
                              color: segment.textColor || "#ffffff",

                              fontSize: `clamp(11px, 2.7vw, ${
                                Number(segment.textSize || 14) + 4
                              }px)`,

                              fontWeight: 900,
                            }}
                          >
                            <p>{getText(segment.text)}</p>

                            <p className="mt-1 text-[0.82em]">
                              {formatAmount(segment.amount, segment.prizeType)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Glass Spin button */}
                    <button
                      type="button"
                      disabled={spinning}
                      onClick={handleSpin}
                      aria-label={t("স্পিন করুন", "Spin")}
                      className={`absolute left-1/2 top-1/2 z-[60] h-[29%] w-[29%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full transition-transform duration-200 ${
                        spinning
                          ? "cursor-wait"
                          : "cursor-pointer hover:scale-105 active:scale-95"
                      }`}
                    >
                      <motion.img
                        animate={
                          spinning
                            ? {
                                scale: [1, 1.07, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                        }}
                        src={SPIN_BUTTON_IMAGE}
                        alt={t("স্পিন করুন", "Spin")}
                        draggable="false"
                        className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,.65)]"
                      />

                      {/* Glass sweep every 2 seconds */}
                      {!spinning && (
                        <>
                          <span className="spin-glass-shine pointer-events-none absolute -bottom-[30%] -top-[30%] left-0 w-[38%] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[2px]" />

                          <span className="spin-bling pointer-events-none absolute right-[13%] top-[8%] h-6 w-6">
                            <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white shadow-[0_0_8px_white]" />

                            <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white shadow-[0_0_8px_white]" />
                          </span>

                          <span
                            className="spin-bling pointer-events-none absolute bottom-[12%] left-[10%] h-4 w-4"
                            style={{
                              animationDelay: "3.35s",
                            }}
                          >
                            <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-yellow-100 shadow-[0_0_8px_white]" />

                            <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-yellow-100 shadow-[0_0_8px_white]" />
                          </span>
                        </>
                      )}

                      {spinning && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                          <FaSyncAlt className="animate-spin text-2xl text-white sm:text-3xl" />
                        </span>
                      )}
                    </button>
                  </div>

                  {isAuthenticated && !eligibility?.eligible && (
                    <div className="mt-7 w-full max-w-lg rounded-xl border border-red-300/50 bg-red-950/80 p-3 text-center text-xs text-red-100">
                      <FaLock className="mr-2 inline" />

                      {t(
                        "এই হুইল স্পিনের প্রয়োজনীয় শর্ত এখনো পূর্ণ হননি।",
                        "You have not completed the requirements for this Wheel.",
                      )}
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="mt-7 w-full max-w-lg rounded-xl border border-white/20 bg-black/60 p-3 text-center text-xs text-white/80">
                      {t(
                        "স্পিন করতে প্রথমে লগইন করুন।",
                        "Log in first to Spin the Wheel.",
                      )}
                    </div>
                  )}

                  {/* Mobile: Wheel selector directly under Spin */}
                  <div className="mt-8 w-full xl:hidden">
                    <WheelSelector
                      wheels={wheels}
                      selectedWheelId={selectedWheelId}
                      spinning={spinning}
                      canGoPrevious={canGoPrevious}
                      canGoNext={canGoNext}
                      selectPreviousWheel={selectPreviousWheel}
                      selectNextWheel={selectNextWheel}
                      setSelectedWheelId={setSelectedWheelId}
                      resolveImage={resolveImage}
                      getText={getText}
                      t={t}
                      mobile
                    />
                  </div>
                </>
              )}
            </div>

            <ResultPanel
              activeTab={resultTab}
              setActiveTab={setResultTab}
              myHistory={myHistory}
              winnerList={winnerList}
              loading={historyLoading}
              getText={getText}
              formatAmount={formatAmount}
              formatDate={formatDate}
              maskUsername={maskUsername}
              t={t}
            />
          </div>

          {/* Desktop Wheel selector */}
          <div className="mt-10 hidden xl:block">
            <WheelSelector
              wheels={wheels}
              selectedWheelId={selectedWheelId}
              spinning={spinning}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              selectPreviousWheel={selectPreviousWheel}
              selectNextWheel={selectNextWheel}
              setSelectedWheelId={setSelectedWheelId}
              resolveImage={resolveImage}
              getText={getText}
              t={t}
            />
          </div>
        </div>

        <AnimatePresence>
          {congratulation && (
            <SpinResultModal
              result={congratulation}
              isBangla={isBangla}
              getText={getText}
              formatAmount={formatAmount}
              onClose={() => setCongratulation(null)}
            />
          )}
        </AnimatePresence>

        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </>
  );
};

/* ======================================================
   REWARD COIN FRAME
====================================================== */

const CoinBalanceFrame = ({ amount, isBangla }) => (
  <motion.div
    initial={{
      opacity: 0,
      scale: 0.85,
    }}
    animate={{
      opacity: 1,
      scale: 1,
    }}
    className="relative h-[76px] w-[165px] overflow-hidden sm:h-[88px] sm:w-[195px]"
  >
    <img
      src={COIN_FRAME_IMAGE}
      alt="Reward Coin"
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
    />

    <div className="absolute inset-0 flex items-center justify-center pb-[2px]">
      <div className="flex items-end gap-1 text-[#ff3b00] drop-shadow-[0_1px_0_#fff]">
        <span className="text-2xl font-black sm:text-3xl">
          {Number(amount || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD")}
        </span>

        <span className="mb-1 text-[9px] font-black sm:text-[10px]">coins</span>
      </div>
    </div>

    <span className="coin-frame-shine pointer-events-none absolute -bottom-[30%] -top-[30%] left-0 w-[32%] bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[2px]" />

    <span className="coin-frame-bling pointer-events-none absolute right-[12%] top-[12%] h-6 w-6">
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white shadow-[0_0_9px_white]" />

      <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white shadow-[0_0_9px_white]" />
    </span>

    <span
      className="coin-frame-bling pointer-events-none absolute bottom-[13%] left-[13%] h-4 w-4"
      style={{
        animationDelay: "0.4s",
      }}
    >
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-yellow-100 shadow-[0_0_8px_white]" />

      <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-yellow-100 shadow-[0_0_8px_white]" />
    </span>
  </motion.div>
);

/* ======================================================
   WHEEL SELECTOR
====================================================== */

const WheelSelector = ({
  wheels,
  selectedWheelId,
  spinning,
  canGoPrevious,
  canGoNext,
  selectPreviousWheel,
  selectNextWheel,
  setSelectedWheelId,
  resolveImage,
  getText,
  t,
  mobile = false,
}) => (
  <div>
    <h2 className="mb-5 text-center text-xl font-black text-white drop-shadow-lg">
      {t("আপনার হুইল নির্বাচন করুন", "Choose Your Wheel")}
    </h2>

    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <button
        type="button"
        disabled={!canGoPrevious}
        onClick={selectPreviousWheel}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/60 text-2xl text-white transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12 sm:text-3xl"
      >
        <FaAngleLeft />
      </button>

      <div
        className={`flex snap-x items-end gap-3 overflow-x-auto px-1 pb-4 [scrollbar-width:none] ${
          mobile ? "max-w-[calc(100vw-110px)]" : "max-w-[1000px]"
        }`}
      >
        {wheels.map((item) => {
          const active = item._id === selectedWheelId;

          return (
            <button
              key={item._id}
              type="button"
              disabled={spinning}
              onClick={() => setSelectedWheelId(item._id)}
              className={`shrink-0 snap-center overflow-hidden rounded-2xl border-[3px] transition-all duration-300 ${
                active
                  ? "z-10 w-[155px] cursor-pointer border-yellow-300 bg-yellow-300/20 shadow-[0_0_30px_rgba(255,210,0,.8)] sm:w-[220px]"
                  : "w-[125px] cursor-pointer border-white/30 bg-black/45 opacity-80 hover:border-yellow-300/70 hover:opacity-100 sm:w-[170px]"
              }`}
            >
              <div
                className={`flex w-full items-center justify-center overflow-hidden ${
                  active ? "h-[145px] sm:h-[210px]" : "h-[115px] sm:h-[165px]"
                }`}
              >
                <img
                  src={resolveImage(item.wheelImage)}
                  alt={getText(item.title)}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="bg-black/75 px-2 py-2.5 text-center">
                <p className="truncate text-[10px] font-extrabold text-white sm:text-sm">
                  {getText(item.title)}
                </p>

                {active && (
                  <p className="mt-1.5 flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-300 sm:text-[10px]">
                    <FaCheckCircle />

                    {t("সক্রিয়", "Active")}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canGoNext}
        onClick={selectNextWheel}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/60 text-2xl text-white transition hover:bg-yellow-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12 sm:text-3xl"
      >
        <FaAngleRight />
      </button>
    </div>
  </div>
);

/* ======================================================
   PRIZE LIST
====================================================== */

const PrizeList = ({ segments, getText, formatAmount, title }) => (
  <div className="order-2 mt-5 rounded-2xl border-2 border-cyan-400/70 bg-[#063b87]/95 p-4 shadow-2xl xl:order-1 xl:mt-0">
    <h2 className="mb-4 flex items-center gap-2 font-extrabold text-yellow-300">
      <FaGift />
      {title}
    </h2>

    <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
      {segments.map((segment) => (
        <motion.div
          key={segment.position}
          whileHover={{
            x: 4,
            scale: 1.02,
          }}
          className="flex items-center gap-2 rounded-full border border-cyan-300/80 bg-[#123d81] px-2.5 py-2 text-white shadow-md"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-black"
            style={{
              backgroundColor: segment.backgroundColor,

              color: segment.textColor,
            }}
          >
            {segment.position}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">
              {getText(segment.text)}
            </p>

            <p className="truncate text-[11px] font-extrabold text-yellow-300">
              {formatAmount(segment.amount, segment.prizeType)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

/* ======================================================
   WINNER AND MY RESULTS
====================================================== */

const ResultPanel = ({
  activeTab,
  setActiveTab,
  myHistory,
  winnerList,
  loading,
  getText,
  formatAmount,
  formatDate,
  maskUsername,
  t,
}) => {
  const list = activeTab === "winners" ? winnerList : myHistory;

  return (
    <div className="order-3 mt-5 overflow-hidden rounded-2xl border-2 border-yellow-400/80 bg-[#063b87]/95 shadow-2xl xl:mt-0">
      <div className="grid grid-cols-2 gap-1 bg-black/20 p-2">
        <button
          type="button"
          onClick={() => setActiveTab("winners")}
          className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-extrabold ${
            activeTab === "winners"
              ? "bg-yellow-400 text-black"
              : "bg-white/10 text-yellow-200"
          }`}
        >
          <FaUsers />

          {t("বিজয়ীর তালিকা", "Winner List")}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my-results")}
          className={`flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-extrabold ${
            activeTab === "my-results"
              ? "bg-yellow-400 text-black"
              : "bg-white/10 text-yellow-200"
          }`}
        >
          <FaHistory />

          {t("আমার ফলাফল", "My Results")}
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto] border-b border-white/10 px-4 py-2 text-[10px] font-bold text-white/50">
        <span>
          {activeTab === "winners"
            ? t("ব্যবহারকারী", "User")
            : t("তারিখ ও প্রস্কার", "Date & Prize")}
        </span>

        <span>{t("প্রস্কার", "Prize")}</span>
      </div>

      {loading && activeTab === "my-results" ? (
        <div className="py-14 text-center text-white/60">
          <FaSyncAlt className="mx-auto animate-spin text-2xl" />
        </div>
      ) : !list.length ? (
        <div className="py-14 text-center text-xs text-white/55">
          <FaClock className="mx-auto mb-2 text-3xl" />

          {activeTab === "winners"
            ? t("এখনো কোনো বিজয়ী নেই", "No Winners yet")
            : t("এখনো কোনো স্পিন নেই", "No Spins yet")}
        </div>
      ) : (
        <div className="max-h-[490px] space-y-1 overflow-y-auto p-2 [scrollbar-width:none]">
          {list.map((item, index) => {
            const prize = item.prizeSnapshot || item.prize || {};

            const username =
              item.username ||
              item.user?.username ||
              item.userSnapshot?.username ||
              "";

            return (
              <motion.div
                key={item._id || `${username}-${index}`}
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: Math.min(index, 10) * 0.04,
                }}
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg px-2 py-2 text-white odd:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold">
                    {activeTab === "winners"
                      ? maskUsername(username)
                      : getText(prize.text) || t("প্রস্কার", "Prize")}
                  </p>

                  <p className="mt-0.5 text-[9px] text-white/45">
                    {formatDate(item.spunAt || item.createdAt)}
                  </p>
                </div>

                <span className="text-[11px] font-extrabold text-yellow-300">
                  {formatAmount(prize.amount, prize.prizeType)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ======================================================
   FLOATING DECORATIONS
====================================================== */

const FloatingDecorations = () => {
  const coins = [
    {
      left: "5%",
      top: "18%",
      size: 52,
      delay: 0,
    },
    {
      left: "27%",
      top: "34%",
      size: 36,
      delay: 0.5,
    },
    {
      left: "68%",
      top: "18%",
      size: 70,
      delay: 1,
    },
    {
      left: "83%",
      top: "49%",
      size: 58,
      delay: 1.5,
    },
    {
      left: "20%",
      top: "82%",
      size: 80,
      delay: 2,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((coin, index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -22, 0],
            rotate: [0, 180, 360],
            opacity: [0.35, 0.8, 0.35],
          }}
          transition={{
            duration: 5 + index,
            delay: coin.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute flex items-center justify-center rounded-full border-4 border-yellow-300 bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-500 font-black text-yellow-900 shadow-[0_0_25px_rgba(255,200,0,.7)]"
          style={{
            left: coin.left,
            top: coin.top,
            width: coin.size,
            height: coin.size,
          }}
        >
          ৳
        </motion.div>
      ))}
    </div>
  );
};

/* ======================================================
   CONGRATULATION MODAL
====================================================== */

const SpinResultModal = ({
  result,
  isBangla,
  getText,
  formatAmount,
  onClose,
}) => {
  const t = (bn, en) => (isBangla ? bn : en);

  const prize = result?.prize || {};

  const wonPrize = prize.prizeType !== "no_prize";

  const confetti = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        id: index,

        left: `${(index * 31) % 100}%`,

        color: ["#ffc800", "#ff3b81", "#1683eb", "#18b84a", "#8b5cf6"][
          index % 5
        ],

        delay: (index % 8) * 0.07,
      })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-black/75 p-4 backdrop-blur-md"
    >
      {wonPrize &&
        confetti.map((item) => (
          <motion.span
            key={item.id}
            initial={{
              y: -70,
              rotate: 0,
            }}
            animate={{
              y: typeof window !== "undefined" ? window.innerHeight + 100 : 900,

              rotate: 720,
            }}
            transition={{
              duration: 2.4 + (item.id % 4) * 0.3,

              delay: item.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute top-0 h-3 w-2 rounded-sm"
            style={{
              left: item.left,

              backgroundColor: item.color,
            }}
          />
        ))}

      <motion.div
        initial={{
          scale: 0.5,
          y: 70,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          y: 0,
          opacity: 1,
        }}
        exit={{
          scale: 0.7,
          opacity: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 15,
        }}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-7 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/5 text-black/50 hover:bg-black/10"
        >
          <FaTimes />
        </button>

        <motion.div
          animate={
            wonPrize
              ? {
                  rotate: [0, -8, 8, -5, 5, 0],

                  scale: [1, 1.12, 1],
                }
              : {}
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-5xl ${
            wonPrize
              ? "bg-gradient-to-br from-yellow-200 to-[#ffc800] text-black shadow-[0_10px_30px_rgba(255,196,0,.4)]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {wonPrize ? <FaTrophy /> : <FaSyncAlt />}
        </motion.div>

        <h2 className="mt-5 text-2xl font-black text-black">
          {wonPrize
            ? t("অভিনন্দন!", "Congratulations!")
            : t("আবার চেষ্টা করুন!", "Try Again!")}
        </h2>

        <p className="mt-2 text-sm text-black/55">{getText(prize.text)}</p>

        <div className="mt-5 rounded-2xl border border-yellow-300 bg-[#fff9dc] p-5">
          <p className="text-xs font-bold uppercase text-black/40">
            {wonPrize
              ? t("আপনি পেয়েছেন", "You Won")
              : t("এইবার কোনো প্রস্কার নেই", "No Prize This Time")}
          </p>

          <p className="mt-2 text-3xl font-black text-[#d49d00]">
            {formatAmount(prize.amount, prize.prizeType)}
          </p>

          {Number(result?.turnoverRequired || 0) > 0 && (
            <p className="mt-2 text-xs font-semibold text-black/50">
              {t("প্রয়োজনীয় টার্নওভার", "Required Turnover")}: ৳
              {Number(result.turnoverRequired).toLocaleString()}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-xl bg-[#ffc800] py-3 font-extrabold text-black hover:bg-[#edb900]"
        >
          {t("ঠিক আছে", "Awesome!")}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default WhileOfFortune;
