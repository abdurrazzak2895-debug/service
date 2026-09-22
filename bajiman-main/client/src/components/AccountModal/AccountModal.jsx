import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCw,
  Eye,
  EyeOff,
  Wallet,
  User,
  Lock,
  Inbox,
  MessageCircle,
  Send,
  LogOut,
  X,
  Landmark,
  ReceiptText,
  ClipboardList,
  TrendingUp,
  Gift,
  BarChart3,
  AlertCircle,
  ChevronRight,
  Loader2,
  FileText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useLanguage } from "../../Context/LanguageProvider";
import api from "../../api/axios";
import { logout, updateUser } from "../../features/auth/authSlice";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import {
  selectHomePageContentColorSetting,
  selectTransactionHistoryColorSetting,
} from "../../features/global/globalSelectors";

import AutoDepositModal from "../AutoDepositModal/AutoDepositModal";
import DepositFundsModal from "../DepositFundsModal/DepositFundsModal";
import DepositHistoryModal from "../DepositHistoryModal/DepositHistoryModal";
import AutoDepositModalHistory from "../AutoDepositModalHistory/AutoDepositModalHistory";
import WithdrawHistoryModal from "../WithdrawHistoryModal/WithdrawHistoryModal";
import TurnoverHistoryModal from "../TurnoverHistoryModal/TurnoverHistoryModal";
import BetHistoryModal from "../BetHistoryModal/BetHistoryModal";
import ReferAndRedeemModal from "../ReferAndRedeemModal/ReferAndRedeemModal";
import PersonalInfoModal from "../PersonalInfoModal/PersonalInfoModal";
import PasswordChangeModal from "../PasswordChangeModal/PasswordChangeModal";
import ComingSoonHistoryModal from "../ComingSoonHistoryModal/ComingSoonHistoryModal";

const API_URL = import.meta.env.VITE_API_URL;

const defaults = {
  isEnabled: true,
  showBalanceCard: true,
  showFundsSection: true,
  showPLSection: true,
  showHistorySection: true,
  showProfileSection: true,
  showContactSection: true,
  showLogoutButton: true,
  showDepositButton: true,
  showWithdrawButton: true,
  showRefreshBalance: true,
  showHideBalance: true,
  pageTitleEn: "Account",
  pageTitleBn: "অ্যাকাউন্ট",
  depositTextEn: "Deposit",
  depositTextBn: "ডিপোজিট",
  withdrawTextEn: "Withdraw",
  withdrawTextBn: "উইথড্র",
  logoutTextEn: "Log out",
  logoutTextBn: "লগ আউট",
  whatsappLink: "https://whatsapp.com/",
  emailLink: "https://mail.google.com/",
  telegramLink: "",
  headerBackgroundImage: "",
  accountAvatar: "",
};

const defaultContentColors = {
  accountOverlayBg: "rgba(0,0,0,0.45)",
  accountModalBg: "#ffffff",
  accountHeaderBg: "#0865a9",
  accountHeaderText: "#ffffff",
  accountHeaderCardBg: "rgba(255,255,255,0.10)",
  accountAvatarBg: "#e9b20d",
  accountAvatarText: "#ffffff",
  accountMutedText: "rgba(255,255,255,0.80)",
  accountBalanceBg: "#eef4ff",
  accountBalanceBorder: "#97b6e9",
  accountBalanceText: "#0865a9",
  accountBalanceMutedText: "#2451cc",
  accountPrimaryButtonBg: "#0865a9",
  accountPrimaryButtonText: "#ffffff",
  accountDangerButtonBg: "#ef4444",
  accountDangerButtonText: "#ffffff",
  accountSectionBg: "#ffffff",
  accountSectionBorder: "#dce8f5",
  accountSectionHeaderBg: "#eef4ff",
  accountSectionTitleText: "#0865a9",
  accountSectionBarBg: "#0865a9",
  accountIconBoxBg: "#eaf4ff",
  accountIconBoxText: "#0865a9",
  accountMenuText: "#333333",
  accountMenuHoverBg: "#f7fbff",
  accountLogoutBg: "#e9b20d",
  accountLogoutText: "#ffffff",
  accountLoadingBg: "#eef4ff",
  accountLoadingText: "#0865a9",
};

const defaultHistoryColors = {
  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",
  headerBg: "#0865a9",
  headerText: "#ffffff",
  closeIconColor: "#ffffff",
};

const getFileUrl = (path) => {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (value.startsWith("blob:")) return value;
  if (value.startsWith("http")) return value.replace(/([^:]\/)\/+/g, "$1");

  const base = String(API_URL || "").replace(/\/+$/, "");
  const cleanPath = value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");

  return `${base}/${cleanPath}`;
};

const AccountModal = ({
  open,
  onClose,
  onDepositClick,
  onWithdrawClick,
  onLogoutDone,
}) => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const authUser = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);
  const homePageContentColorSetting = useSelector(
    selectHomePageContentColorSetting,
  );
  const transactionHistoryColorSetting = useSelector(
    selectTransactionHistoryColorSetting,
  );

  const colors = {
    ...defaultContentColors,
    ...(homePageContentColorSetting || {}),
  };

  const historyColors = {
    ...defaultHistoryColors,
    ...(transactionHistoryColorSetting || {}),
  };

  const [setting, setSetting] = useState(defaults);
  const [loadingSetting, setLoadingSetting] = useState(true);
  const [balance, setBalance] = useState(Number(authUser?.balance || 0));
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const [activeModal, setActiveModal] = useState("");
  const [comingSoonTitle, setComingSoonTitle] = useState("");
  const [comingSoonTab, setComingSoonTab] = useState("comingSoon");

  const t = {
    account: isBangla ? setting.pageTitleBn : setting.pageTitleEn,
    userId: isBangla ? "ইউজার আইডি" : "User ID",
    phone: isBangla ? "ফোন" : "Phone",
    guest: isBangla ? "গেস্ট" : "Guest",
    balance: isBangla ? "ব্যালেন্স" : "Balance",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    currency: "TK",

    funds: isBangla ? "ফান্ডস" : "Funds",
    deposit: isBangla ? setting.depositTextBn : setting.depositTextEn,
    withdraw: isBangla ? setting.withdrawTextBn : setting.withdrawTextEn,
    dispute: isBangla ? "ডিসপিউট" : "Dispute",

    autoDepositHistory: isBangla
      ? "অটো ডিপোজিট হিস্টোরি"
      : "Auto Deposit History",
    myPL: isBangla ? "অটো ডিপোজিট হিস্টোরি" : "Auto Deposit History",
    turnover: isBangla ? "টার্নওভার" : "Turnover",
    referBonus: isBangla ? "রেফার বোনাস" : "Refer Bonus",
    pl: isBangla ? "পি&এল" : "P&L",

    history: isBangla ? "হিস্টোরি" : "History",
    betHistory: isBangla ? "বেট হিস্টোরি" : "Bet History",
    withdrawHistory: isBangla ? "উইথড্র হিস্টোরি" : "Withdraw History",
    depositHistory: isBangla ? "ডিপোজিট হিস্টোরি" : "Deposit History",

    profile: isBangla ? "প্রোফাইল" : "Profile",
    personalInfo: isBangla ? "ব্যক্তিগত তথ্য" : "Personal Info",
    resetPassword: isBangla ? "পাসওয়ার্ড রিসেট" : "Reset Password",
    inbox: isBangla ? "ইনবক্স" : "Inbox",

    contact: isBangla ? "যোগাযোগ" : "Contact",
    whatsapp: isBangla ? "হোয়াটসঅ্যাপ" : "WhatsApp",
    telegram: isBangla ? "টেলিগ্রাম" : "Telegram",

    logout: isBangla ? setting.logoutTextBn : setting.logoutTextEn,
    logoutSuccess: isBangla ? "সফলভাবে লগআউট হয়েছে" : "Logged out successfully",
    balanceError: isBangla
      ? "ব্যালেন্স লোড করা যায়নি"
      : "Failed to load balance",
  };

  const formatAmount = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchSetting = async () => {
    try {
      setLoadingSetting(true);

      const res = await api.get("/api/account-page-setting");

      if (res?.data?.success && res?.data?.data) {
        setSetting({
          ...defaults,
          ...res.data.data,
        });
      } else {
        setSetting(defaults);
      }
    } catch (error) {
      console.error("Account setting load error:", error);
      setSetting(defaults);
    } finally {
      setLoadingSetting(false);
    }
  };

  const fetchBalance = async () => {
    if (!isAuth) return;

    try {
      setLoadingBalance(true);

      const res = await api.get("/api/user-info/balance");
      const data = res?.data?.data || {};
      const nextBalance = Number(data.balance || 0);

      setBalance(nextBalance);

      dispatch(
        updateUser({
          balance: nextBalance,
          currency: data.currency || "BDT",
          commissionBalance: Number(data.commissionBalance || 0),
          gameLossCommissionBalance: Number(
            data.gameLossCommissionBalance || 0,
          ),
          depositCommissionBalance: Number(data.depositCommissionBalance || 0),
          referCommissionBalance: Number(data.referCommissionBalance || 0),
          gameWinCommissionBalance: Number(data.gameWinCommissionBalance || 0),
        }),
      );
    } catch (error) {
      console.error("Balance fetch error:", error);
      toast.error(error?.response?.data?.message || t.balanceError);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSetting();
      fetchBalance();
    } else {
      setActiveModal("");
    }
  }, [open]);

  useEffect(() => {
    setBalance(Number(authUser?.balance || 0));
  }, [authUser?.balance]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success(t.logoutSuccess);
    onLogoutDone?.();
  };

  const openComingSoon = (title, tab = "comingSoon") => {
    setComingSoonTitle(title);
    setComingSoonTab(tab);
    setActiveModal("comingSoon");
  };

  const handleWithdrawClick = () => {
    if (onWithdrawClick) {
      onWithdrawClick();
      return;
    }

    openComingSoon(t.withdraw, "withdraw");
  };

  const userId = authUser?.userId || authUser?.username || t.guest;
  const phone =
    authUser?.phone ||
    [authUser?.countryCode, authUser?.phoneNumber].filter(Boolean).join("") ||
    "N/A";

  const headerImage = getFileUrl(setting.headerBackgroundImage);
  const accountAvatar = getFileUrl(setting.accountAvatar);

  const fundsItems = useMemo(
    () => [
      {
        title: t.deposit,
        icon: Wallet,
        action: () => setActiveModal("autoDeposit"),
      },
      {
        title: t.withdraw,
        icon: Landmark,
        action: handleWithdrawClick,
      },
      {
        title: t.dispute,
        icon: AlertCircle,
        action: () => openComingSoon(t.dispute, "dispute"),
      },
    ],
    [t.deposit, t.withdraw, t.dispute, onWithdrawClick],
  );

  const plItems = useMemo(
    () => [
      {
        title: t.autoDepositHistory,
        icon: Wallet,
        action: () => setActiveModal("autoDepositHistory"),
      },
      {
        title: t.turnover,
        icon: TrendingUp,
        action: () => setActiveModal("turnoverHistory"),
      },
      {
        title: t.referBonus,
        icon: Gift,
        action: () => setActiveModal("referBonus"),
      },
    ],
    [t.autoDepositHistory, t.turnover, t.referBonus],
  );

  const historyItems = useMemo(
    () => [
      {
        title: t.betHistory,
        icon: ClipboardList,
        action: () => setActiveModal("betHistory"),
      },
      {
        title: t.withdrawHistory,
        icon: ReceiptText,
        action: () => setActiveModal("withdrawHistory"),
      },
      {
        title: t.depositHistory,
        icon: FileText,
        action: () => setActiveModal("depositHistory"),
      },
    ],
    [t.betHistory, t.withdrawHistory, t.depositHistory],
  );

  const profileItems = useMemo(
    () => [
      {
        title: t.personalInfo,
        icon: User,
        action: () => setActiveModal("personalInfo"),
      },
      {
        title: t.resetPassword,
        icon: Lock,
        action: () => setActiveModal("passwordChange"),
      },
      {
        title: t.inbox,
        icon: Inbox,
        action: () => openComingSoon(t.inbox, "inbox"),
      },
    ],
    [t.personalInfo, t.resetPassword, t.inbox],
  );

  const contactItems = useMemo(
    () => [
      {
        title: t.whatsapp,
        icon: MessageCircle,
        to: "https://wa.me/447311133922",
        external: true,
      },
      {
        title: t.telegram,
        icon: Send,
        to: "https://t.me/+447311133922",
        external: true,
      },
    ],
    [t.whatsapp, t.telegram],
  );

  const Section = ({ title, children }) => (
    <div
      className="overflow-hidden rounded-[4px] border shadow-sm"
      style={{
        backgroundColor: colors.accountSectionBg,
        borderColor: colors.accountSectionBorder,
      }}
    >
      <div
        className="flex h-[42px] items-center gap-2 border-b px-3"
        style={{
          backgroundColor: colors.accountSectionHeaderBg,
          borderColor: colors.accountSectionBorder,
        }}
      >
        <span
          className="h-5 w-[4px] rounded-full"
          style={{ backgroundColor: colors.accountSectionBarBg }}
        />
        <h3
          className="text-[14px] font-bold"
          style={{ color: colors.accountSectionTitleText }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const MenuGrid = ({ items, columns = 3 }) => {
    const gridCols =
      columns === 4
        ? "grid-cols-4"
        : columns === 2
          ? "grid-cols-2"
          : "grid-cols-3";

    return (
      <div className={`grid gap-2 p-3 ${gridCols}`}>
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={index}
              type="button"
              onClick={item.action}
              className="group flex cursor-pointer flex-col items-center justify-start rounded-[4px] p-1 transition"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.accountMenuHoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div
                className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full shadow-sm transition group-hover:scale-105"
                style={{
                  backgroundColor: colors.accountIconBoxBg,
                  color: colors.accountIconBoxText,
                }}
              >
                <Icon size={21} strokeWidth={2.3} />
              </div>

              <span
                className="mt-2 min-h-[30px] text-center text-[11px] font-bold leading-tight"
                style={{ color: colors.accountMenuText }}
              >
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  if (!setting.isEnabled) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-[99990] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
            style={{ background: colors.accountOverlayBg }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-dvh w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
              style={{ backgroundColor: colors.accountModalBg }}
            >
              {loadingSetting ? (
                <div
                  className="flex h-full items-center justify-center"
                  style={{ backgroundColor: colors.accountModalBg }}
                >
                  <div
                    className="flex items-center gap-2 rounded-[6px] px-4 py-3 text-[14px] font-bold shadow-sm"
                    style={{
                      backgroundColor: colors.accountLoadingBg,
                      color: colors.accountLoadingText,
                    }}
                  >
                    <Loader2 size={18} className="animate-spin" />
                    {t.loading}
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: colors.accountHeaderBg,
                      color: colors.accountHeaderText,
                      backgroundImage: headerImage
                        ? `url(${headerImage})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div
                      className="relative flex h-[50px] items-center justify-center"
                      style={{
                        backgroundColor: headerImage
                          ? `${colors.accountHeaderBg}F2`
                          : colors.accountHeaderBg,
                        color: colors.accountHeaderText,
                      }}
                    >
                      <h2 className="text-[18px] font-semibold">{t.account}</h2>

                      <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                        style={{ color: colors.accountHeaderText }}
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="px-4 pb-4">
                      <div
                        className="rounded-[4px] px-4 py-3"
                        style={{
                          backgroundColor: colors.accountHeaderCardBg,
                          color: colors.accountHeaderText,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/70"
                            style={{
                              backgroundColor: colors.accountAvatarBg,
                              color: colors.accountAvatarText,
                            }}
                          >
                            {accountAvatar ? (
                              <img
                                src={accountAvatar}
                                alt="Account"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[28px] font-black leading-none">
                                {String(userId || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-bold">
                              {t.userId}: {userId}
                            </p>
                            <p
                              className="mt-1 truncate text-[12px]"
                              style={{ color: colors.accountMutedText }}
                            >
                              {t.phone}: {phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex-1 overflow-y-auto px-4 pb-5 pt-3"
                    style={{ backgroundColor: colors.accountModalBg }}
                  >
                    {setting.showBalanceCard && (
                      <div
                        className="rounded-[4px] border p-3"
                        style={{
                          backgroundColor: colors.accountBalanceBg,
                          borderColor: colors.accountBalanceBorder,
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div
                              className="flex items-center gap-2"
                              style={{ color: colors.accountBalanceMutedText }}
                            >
                              <Wallet size={18} className="shrink-0" />
                              <h3 className="text-[14px] font-bold">
                                {t.balance}
                              </h3>

                              {setting.showHideBalance && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setHideBalance((prev) => !prev)
                                  }
                                  className="cursor-pointer"
                                  style={{ color: colors.accountBalanceText }}
                                >
                                  {hideBalance ? (
                                    <EyeOff size={16} />
                                  ) : (
                                    <Eye size={16} />
                                  )}
                                </button>
                              )}

                              {setting.showRefreshBalance && (
                                <button
                                  type="button"
                                  onClick={fetchBalance}
                                  disabled={loadingBalance}
                                  className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                                    loadingBalance ? "animate-spin" : ""
                                  }`}
                                  style={{ color: colors.accountBalanceText }}
                                >
                                  <RefreshCw size={16} />
                                </button>
                              )}
                            </div>

                            <p
                              className="mt-2 truncate text-[24px] font-black leading-none"
                              style={{ color: colors.accountBalanceText }}
                            >
                              {loadingBalance
                                ? t.loading
                                : hideBalance
                                  ? `•••••• ${t.currency}`
                                  : `${formatAmount(balance)} ${t.currency}`}
                            </p>
                          </div>

                          <div className="flex w-[105px] shrink-0 flex-col gap-2">
                            {setting.showDepositButton && (
                              <button
                                type="button"
                                onClick={() => setActiveModal("autoDeposit")}
                                className="h-[34px] cursor-pointer rounded-[3px] text-[13px] font-bold"
                                style={{
                                  backgroundColor:
                                    colors.accountPrimaryButtonBg,
                                  color: colors.accountPrimaryButtonText,
                                }}
                              >
                                {t.deposit}
                              </button>
                            )}

                            {setting.showWithdrawButton && (
                              <button
                                type="button"
                                onClick={handleWithdrawClick}
                                className="h-[34px] cursor-pointer rounded-[3px] text-[13px] font-bold"
                                style={{
                                  backgroundColor: colors.accountDangerButtonBg,
                                  color: colors.accountDangerButtonText,
                                }}
                              >
                                {t.withdraw}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 space-y-3">
                      {setting.showFundsSection && (
                        <Section title={t.funds}>
                          <MenuGrid items={fundsItems} columns={3} />
                        </Section>
                      )}

                      {setting.showPLSection && (
                        <Section title={t.myPL}>
                          <MenuGrid items={plItems} columns={3} />
                        </Section>
                      )}

                      {setting.showHistorySection && (
                        <Section title={t.history}>
                          <MenuGrid items={historyItems} columns={3} />
                        </Section>
                      )}

                      {setting.showProfileSection && (
                        <Section title={t.profile}>
                          <MenuGrid items={profileItems} columns={3} />
                        </Section>
                      )}

                      {setting.showContactSection &&
                        contactItems.length > 0 && (
                          <Section title={t.contact}>
                            <div className="grid grid-cols-2 gap-2 p-3">
                              {contactItems.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                  <a
                                    key={index}
                                    href={item.to}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex cursor-pointer flex-col items-center justify-start rounded-[4px] p-1 transition"
                                    style={{ backgroundColor: "transparent" }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        colors.accountMenuHoverBg;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <div
                                      className="mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full shadow-sm transition group-hover:scale-105"
                                      style={{
                                        backgroundColor:
                                          colors.accountIconBoxBg,
                                        color: colors.accountIconBoxText,
                                      }}
                                    >
                                      <Icon size={21} strokeWidth={2.3} />
                                    </div>

                                    <span
                                      className="mt-2 min-h-[30px] text-center text-[11px] font-bold leading-tight"
                                      style={{ color: colors.accountMenuText }}
                                    >
                                      {item.title}
                                    </span>
                                  </a>
                                );
                              })}
                            </div>
                          </Section>
                        )}

                      {setting.showLogoutButton && (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-[3px] text-[14px] font-bold"
                          style={{
                            backgroundColor: colors.accountLogoutBg,
                            color: colors.accountLogoutText,
                          }}
                        >
                          <LogOut size={18} />
                          <span>{t.logout}</span>
                          <ChevronRight size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AutoDepositModal
        open={activeModal === "autoDeposit"}
        onClose={() => setActiveModal("")}
        onDepositClick={() => setActiveModal("depositFunds")}
      />

      <DepositFundsModal
        open={activeModal === "depositFunds"}
        onClose={() => setActiveModal("")}
        onNext={(payload) => {
          setActiveModal("");
          onDepositClick?.(payload);
        }}
      />

      <ReferAndRedeemModal
        open={activeModal === "referBonus"}
        onClose={() => setActiveModal("")}
      />

      <PersonalInfoModal
        open={activeModal === "personalInfo"}
        onClose={() => setActiveModal("")}
        onUpdated={fetchBalance}
      />

      <PasswordChangeModal
        open={activeModal === "passwordChange"}
        onClose={() => setActiveModal("")}
      />

      <HistoryShellModal
        open={activeModal === "autoDepositHistory"}
        title={t.autoDepositHistory}
        onClose={() => setActiveModal("")}
        colors={historyColors}
      >
        <AutoDepositModalHistory
          onBackToDeposit={() => setActiveModal("autoDeposit")}
        />
      </HistoryShellModal>

      <HistoryShellModal
        open={activeModal === "depositHistory"}
        title={t.depositHistory}
        onClose={() => setActiveModal("")}
        colors={historyColors}
      >
        <DepositHistoryModal
          open={activeModal === "depositHistory"}
          onClose={() => setActiveModal("")}
          onBackToDeposit={() => setActiveModal("depositFunds")}
        />
      </HistoryShellModal>

      <HistoryShellModal
        open={activeModal === "withdrawHistory"}
        title={t.withdrawHistory}
        onClose={() => setActiveModal("")}
        colors={historyColors}
      >
        <WithdrawHistoryModal
          onBackToWithdraw={() => {
            setActiveModal("");
            handleWithdrawClick();
          }}
        />
      </HistoryShellModal>

      <HistoryShellModal
        open={activeModal === "turnoverHistory"}
        title={t.turnover}
        onClose={() => setActiveModal("")}
        colors={historyColors}
      >
        <TurnoverHistoryModal
          onBackToDeposit={() => setActiveModal("autoDeposit")}
        />
      </HistoryShellModal>

      <HistoryShellModal
        open={activeModal === "betHistory"}
        title={t.betHistory}
        onClose={() => setActiveModal("")}
        colors={historyColors}
      >
        <BetHistoryModal />
      </HistoryShellModal>

      <ComingSoonHistoryModal
        open={activeModal === "comingSoon"}
        onClose={() => setActiveModal("")}
        activeTab={comingSoonTab}
        onTabChange={setComingSoonTab}
        title={comingSoonTitle || t.history}
        onBackToDeposit={() => setActiveModal("autoDeposit")}
      />
    </>
  );
};

const HistoryShellModal = ({ open, title, onClose, colors, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: colors.pageOverlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-dvh w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
            style={{ backgroundColor: colors.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                style={{ color: colors.closeIconColor }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccountModal;
