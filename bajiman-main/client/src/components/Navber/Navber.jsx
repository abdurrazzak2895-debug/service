import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Menu,
  X,
  Check,
  WalletCards,
  RefreshCw,
  UserCircle,
  Gift,
  LogOut,
  Landmark,
  BadgeDollarSign,
  ReceiptText,
  UserRound,
  LockKeyhole,
  Download,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import { logout, updateUser } from "../../features/auth/authSlice";
import {
  selectSiteIdentify,
  selectGlobalLoading,
  selectGlobalLoaded,
  selectNavbarColorSetting,
} from "../../features/global/globalSelectors";
import api from "../../api/axios";

import RegisterModal from "../RegisterModal/RegisterModal";
import LoginModal from "../LoginModal/LoginModal";
import AutoDepositModal from "../AutoDepositModal/AutoDepositModal";
import DepositFundsModal from "../DepositFundsModal/DepositFundsModal";
import DepositConfirmModal from "../DepositConfirmModal/DepositConfirmModal";
import DepositHistoryModal from "../DepositHistoryModal/DepositHistoryModal";
import PersonalInfoModal from "../PersonalInfoModal/PersonalInfoModal";
import PasswordChangeModal from "../PasswordChangeModal/PasswordChangeModal";
import WithdrawModal from "../WithdrawModal/WithdrawModal";
import ForgetPasswordModal from "../ForgetPasswordModal/ForgetPasswordModal";
import ReferAndRedeemModal from "../ReferAndRedeemModal/ReferAndRedeemModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const defaultColors = {
  headerBg: "#0b66a8",
  signupBg: "#5ed51d",
  signupText: "#ffffff",
  signupHoverBg: "#52c719",
  loginBg: "#247ccf",
  loginText: "#ffffff",
  loginHoverBg: "#1f72c0",
  depositBg: "#247ccf",
  depositText: "#ffffff",
  depositHoverBg: "#1f72c0",
  walletBg: "#5ed51d",
  walletText: "#ffffff",
  walletHoverBg: "#52c719",
  profileIconBg: "#ffffff",
  profileIconColor: "#0b66a8",
  dropdownBg: "#ffffff",
  dropdownText: "#333333",
  dropdownHoverBg: "#f7f7f7",
  dropdownIconBg: "#ec4899",
  dropdownIconText: "#ffffff",
  logoutText: "#d93636",
  logoutIconBg: "#d93636",
  logoutHoverBg: "#fff3f3",
  languageModalHeaderBg: "#0b66a8",
  languageModalHeaderText: "#ffffff",
  languageActiveBg: "#0b66a8",
  languageActiveText: "#ffffff",
  languageInactiveBg: "#ffffff",
  languageInactiveText: "#111111",
  mobileMenuIconColor: "#ffffff",
};

const Navber = ({ setOpen, desktopOpen }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { language, changeLanguage, isBangla } = useLanguage();

  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);

  const siteIdentify = useSelector(selectSiteIdentify);
  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const navbarColorSetting = useSelector(selectNavbarColorSetting);

  const colors = {
    ...defaultColors,
    ...(navbarColorSetting || {}),
  };

  const logoUrl = makeImageUrl(
    siteIdentify?.logoImage || siteIdentify?.logo || "",
  );

  const pageLoading = globalLoading || !globalLoaded;

  const [openRegister, setOpenRegister] = useState(false);
  const [openLangModal, setOpenLangModal] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const [openAutoDeposit, setOpenAutoDeposit] = useState(false);
  const [openDepositFunds, setOpenDepositFunds] = useState(false);
  const [openDepositConfirm, setOpenDepositConfirm] = useState(false);
  const [openDepositHistory, setOpenDepositHistory] = useState(false);

  const [openPersonalInfo, setOpenPersonalInfo] = useState(false);
  const [openPasswordChange, setOpenPasswordChange] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openForgetPassword, setOpenForgetPassword] = useState(false);
  const [openReferRedeem, setOpenReferRedeem] = useState(false);

  const [depositData, setDepositData] = useState(null);

  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [referInfoLoading, setReferInfoLoading] = useState(false);
  const [referInfo, setReferInfo] = useState(null);

  const [signupHover, setSignupHover] = useState(false);
  const [loginHover, setLoginHover] = useState(false);
  const [depositHover, setDepositHover] = useState(false);
  const [walletHover, setWalletHover] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState("");

  const profileRef = useRef(null);

  const referPoints = Number(
    referInfo?.calculation?.points ?? user?.referCommissionBalance ?? 0,
  );

  const bonusWallet = Number(
    referInfo?.calculation?.estimatedRedeemAmount || 0,
  );

  const formattedReferPoints = referPoints.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  const formattedBonusWallet = bonusWallet.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref") || params.get("referCode");

    if (ref && !isAuth) {
      setOpenLogin(false);
      setOpenRegister(true);
    }
  }, [location.search, isAuth]);

  const closeAllModals = () => {
    setOpenRegister(false);
    setOpenLogin(false);
    setOpenLangModal(false);

    setOpenAutoDeposit(false);
    setOpenDepositFunds(false);
    setOpenDepositConfirm(false);
    setOpenDepositHistory(false);

    setOpenPersonalInfo(false);
    setOpenPasswordChange(false);
    setOpenWithdraw(false);
    setOpenForgetPassword(false);
    setOpenReferRedeem(false);
  };

  const fetchReferRedeemInfo = async () => {
    if (!isAuth) return;

    try {
      setReferInfoLoading(true);

      const { data } = await api.get("/api/user/refer-redeem/info");
      const payload = data?.data || null;

      setReferInfo(payload);

      if (payload?.user) {
        dispatch(
          updateUser({
            referralCode: payload.user.referralCode,
            referralCount: Number(payload.user.referralCount || 0),
            referCommission: Number(payload.user.referCommission || 0),
            referCommissionBalance: Number(
              payload.user.referCommissionBalance || 0,
            ),
            balance: Number(payload.user.balance || 0),
            currency: payload.user.currency || "BDT",
          }),
        );
      }
    } catch (error) {
      console.error("Refer redeem info load failed:", error);
    } finally {
      setReferInfoLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchReferRedeemInfo();
    } else {
      setReferInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  const openDeposit = () => {
    setOpenProfileMenu(false);

    if (!isAuth) {
      closeAllModals();
      setOpenLogin(true);
      return;
    }

    closeAllModals();
    setOpenDepositFunds(true);
  };

  const openTransaction = () => {
    setOpenProfileMenu(false);

    if (!isAuth) {
      closeAllModals();
      setOpenLogin(true);
      return;
    }

    closeAllModals();
    setOpenDepositHistory(true);
  };

  const openReferRedeemModal = () => {
    setOpenProfileMenu(false);

    if (!isAuth) {
      closeAllModals();
      setOpenLogin(true);
      return;
    }

    closeAllModals();
    setOpenReferRedeem(true);
  };

  const openUserInfo = () => {
    setOpenProfileMenu(false);

    if (!isAuth) {
      closeAllModals();
      setOpenLogin(true);
      return;
    }

    closeAllModals();
    setOpenPersonalInfo(true);
  };

  const openChangePassword = () => {
    setOpenProfileMenu(false);

    if (!isAuth) {
      closeAllModals();
      setOpenLogin(true);
      return;
    }

    closeAllModals();
    setOpenPasswordChange(true);
  };

  const openWithdrawModal = () => {
    setOpenProfileMenu(false);

    if (!isAuth) {
      closeAllModals();
      setOpenLogin(true);
      return;
    }

    closeAllModals();
    setOpenWithdraw(true);
  };

  const texts = {
    signup: isBangla ? "সাইন আপ" : "Sign Up",
    login: isBangla ? "লগইন" : "Login",
    deposit: isBangla ? "ডিপোজিট" : "Deposit",
    mainWallet: isBangla ? "মেইন ওয়ালেট" : "Main Wallet",
    language: isBangla ? "ভাষা নির্বাচন করুন" : "Choose Language",
    subtitle: isBangla
      ? "আপনার পছন্দের ভাষা বেছে নিন"
      : "Select your preferred language",
    vipPoints: isBangla ? "ভিআইপি পয়েন্ট" : "VIP Points",
    bonusWallet: isBangla ? "বোনাস ওয়ালেট" : "Bonus Wallet",
    withdrawal: isBangla ? "উইথড্রয়াল" : "Withdrawal",
    referBonus: isBangla ? "রেফার বোনাস" : "Refer Bonus",
    transaction: isBangla ? "ট্রানজেকশন রেকর্ডস" : "Transaction Records",
    personalInfo: isBangla ? "পার্সোনাল ইনফো" : "Personal Info",
    changePassword: isBangla ? "পাসওয়ার্ড পরিবর্তন" : "Change Password",
    logout: isBangla ? "লগআউট" : "Logout",
    refreshSuccess: isBangla ? "ব্যালেন্স আপডেট হয়েছে" : "Balance updated",
    refreshFailed: isBangla
      ? "ব্যালেন্স আপডেট করা যায়নি"
      : "Failed to refresh balance",
  };

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
  ];

  const balance = Number(user?.balance || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleRefreshBalance = async () => {
    if (refreshingBalance) return;

    try {
      setRefreshingBalance(true);

      const res = await api.get("/api/user-info/balance");
      const data = res?.data?.data || {};

      dispatch(
        updateUser({
          balance: Number(data.balance || 0),
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

      await fetchReferRedeemInfo();

      toast.success(res?.data?.message || texts.refreshSuccess);
    } catch (error) {
      toast.error(error?.response?.data?.message || texts.refreshFailed);
    } finally {
      setRefreshingBalance(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setOpenProfileMenu(false);

    setOpenAutoDeposit(false);
    setOpenDepositFunds(false);
    setOpenDepositConfirm(false);
    setOpenDepositHistory(false);

    setOpenPersonalInfo(false);
    setOpenPasswordChange(false);
    setOpenWithdraw(false);
    setOpenForgetPassword(false);
    setOpenReferRedeem(false);

    setDepositData(null);
    setReferInfo(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: texts.deposit, path: "__deposit_modal__", icon: Landmark },
    {
      label: texts.withdrawal,
      path: "__withdraw_modal__",
      icon: BadgeDollarSign,
    },
    { label: texts.referBonus, path: "__refer_redeem_modal__", icon: Gift },
    {
      label: texts.transaction,
      path: "__transaction_modal__",
      icon: ReceiptText,
    },
    {
      label: texts.personalInfo,
      path: "__personal_info_modal__",
      icon: UserRound,
    },
    {
      label: texts.changePassword,
      path: "__password_change_modal__",
      icon: LockKeyhole,
    },
  ];

  const getMenuClick = (path) => {
    if (path === "__deposit_modal__") return openDeposit;
    if (path === "__transaction_modal__") return openTransaction;
    if (path === "__withdraw_modal__") return openWithdrawModal;
    if (path === "__refer_redeem_modal__") return openReferRedeemModal;
    if (path === "__personal_info_modal__") return openUserInfo;
    if (path === "__password_change_modal__") return openChangePassword;
    return null;
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-30 h-[56px] shadow-sm transition-all duration-300 ease-in-out lg:h-[64px] ${
          desktopOpen ? "lg:pl-[250px]" : ""
        }`}
        style={{ backgroundColor: colors.headerBg }}
      >
        <div className="mx-auto flex h-full max-w-[1230px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="cursor-pointer lg:hidden"
            style={{ color: colors.mobileMenuIconColor }}
          >
            <Menu size={25} />
          </button>

          <Link to="/" className="flex cursor-pointer items-center lg:flex-1">
            {pageLoading ? (
              <div className="h-[24px] w-[120px] animate-pulse rounded bg-white/30 lg:h-[28px] lg:w-[140px]" />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                className="h-[24px] lg:h-[28px]"
              />
            ) : (
              <div className="h-[24px] w-[105px] rounded bg-white/30 lg:h-[28px] lg:w-[125px]" />
            )}
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            {pageLoading ? (
              <>
                <div className="h-[38px] w-[105px] animate-pulse rounded-[5px] bg-white/25" />
                <div className="h-[38px] w-[105px] animate-pulse rounded-[5px] bg-white/25" />
                <div className="h-[34px] w-[34px] animate-pulse rounded-full bg-white/25" />
              </>
            ) : !isAuth ? (
              <>
                <button
                  type="button"
                  onMouseEnter={() => setSignupHover(true)}
                  onMouseLeave={() => setSignupHover(false)}
                  onClick={() => {
                    closeAllModals();
                    setOpenRegister(true);
                  }}
                  className="min-w-[105px] cursor-pointer rounded-[5px] px-6 py-[10px] text-center text-[13px] font-bold transition"
                  style={{
                    backgroundColor: signupHover
                      ? colors.signupHoverBg
                      : colors.signupBg,
                    color: colors.signupText,
                  }}
                >
                  {texts.signup}
                </button>

                <button
                  type="button"
                  onMouseEnter={() => setLoginHover(true)}
                  onMouseLeave={() => setLoginHover(false)}
                  onClick={() => {
                    closeAllModals();
                    setOpenLogin(true);
                  }}
                  className="min-w-[105px] cursor-pointer rounded-[5px] px-6 py-[10px] text-center text-[13px] font-bold transition"
                  style={{
                    backgroundColor: loginHover
                      ? colors.loginHoverBg
                      : colors.loginBg,
                    color: colors.loginText,
                  }}
                >
                  {texts.login}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onMouseEnter={() => setDepositHover(true)}
                  onMouseLeave={() => setDepositHover(false)}
                  onClick={openDeposit}
                  className="flex h-[36px] cursor-pointer items-center gap-2 rounded-[4px] px-3 text-[13px] font-medium transition"
                  style={{
                    backgroundColor: depositHover
                      ? colors.depositHoverBg
                      : colors.depositBg,
                    color: colors.depositText,
                  }}
                >
                  <WalletCards size={18} className="fill-white/20" />
                  <span>{texts.deposit}</span>
                </button>

                <button
                  type="button"
                  onMouseEnter={() => setWalletHover(true)}
                  onMouseLeave={() => setWalletHover(false)}
                  onClick={handleRefreshBalance}
                  disabled={refreshingBalance}
                  className="flex h-[36px] cursor-pointer items-center gap-2 rounded-[5px] px-3 text-[13px] font-bold transition disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    backgroundColor: walletHover
                      ? colors.walletHoverBg
                      : colors.walletBg,
                    color: colors.walletText,
                  }}
                >
                  <RefreshCw
                    size={16}
                    className={refreshingBalance ? "animate-spin" : ""}
                  />
                  <span>{texts.mainWallet}</span>
                  <span>৳{balance}</span>
                </button>

                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenProfileMenu((prev) => !prev);
                      fetchReferRedeemInfo();
                    }}
                    className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full transition hover:scale-105"
                    style={{
                      backgroundColor: colors.profileIconBg,
                      color: colors.profileIconColor,
                    }}
                  >
                    <UserCircle size={25} />
                  </button>

                  <AnimatePresence>
                    {openProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[43px] w-[215px] overflow-hidden rounded-[2px] shadow-xl"
                        style={{
                          backgroundColor: colors.dropdownBg,
                          color: colors.dropdownText,
                        }}
                      >
                        <div className="border-b border-black/10 px-4 py-3">
                          <div className="text-[14px]">{texts.vipPoints}</div>
                          <div className="mt-1 flex items-center gap-2 text-[18px] font-bold">
                            <span>
                              {referInfoLoading ? "..." : formattedReferPoints}
                            </span>
                            <button
                              type="button"
                              onClick={fetchReferRedeemInfo}
                              disabled={referInfoLoading}
                              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <RefreshCw
                                size={13}
                                className={
                                  referInfoLoading ? "animate-spin" : ""
                                }
                              />
                            </button>
                          </div>

                          <div className="mt-3 text-[14px]">
                            {texts.bonusWallet}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[18px] font-bold">
                            <span>
                              ৳{" "}
                              {referInfoLoading ? "..." : formattedBonusWallet}
                            </span>
                            <button
                              type="button"
                              onClick={fetchReferRedeemInfo}
                              disabled={referInfoLoading}
                              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <RefreshCw
                                size={13}
                                className={
                                  referInfoLoading ? "animate-spin" : ""
                                }
                              />
                            </button>
                          </div>
                        </div>

                        <div className="py-2">
                          {menuItems.map((item) => {
                            const Icon = item.icon;
                            const modalClick = getMenuClick(item.path);
                            const isHovered = hoveredMenu === item.path;

                            const content = (
                              <>
                                <span
                                  className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]"
                                  style={{
                                    backgroundColor: colors.dropdownIconBg,
                                    color: colors.dropdownIconText,
                                  }}
                                >
                                  <Icon size={13} />
                                </span>

                                <span className="flex-1 whitespace-pre-line leading-[16px]">
                                  {item.label}
                                </span>
                              </>
                            );

                            const commonStyle = {
                              backgroundColor: isHovered
                                ? colors.dropdownHoverBg
                                : "transparent",
                              color: colors.dropdownText,
                            };

                            const commonClass =
                              "flex min-h-[47px] w-full cursor-pointer items-center gap-3 px-4 text-left text-[16px] font-bold transition";

                            if (modalClick) {
                              return (
                                <button
                                  key={item.path}
                                  type="button"
                                  onClick={modalClick}
                                  onMouseEnter={() => setHoveredMenu(item.path)}
                                  onMouseLeave={() => setHoveredMenu("")}
                                  className={commonClass}
                                  style={commonStyle}
                                >
                                  {content}
                                </button>
                              );
                            }

                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setOpenProfileMenu(false)}
                                onMouseEnter={() => setHoveredMenu(item.path)}
                                onMouseLeave={() => setHoveredMenu("")}
                                className={commonClass}
                                style={commonStyle}
                              >
                                {content}
                              </Link>
                            );
                          })}

                          <button
                            type="button"
                            onClick={handleLogout}
                            onMouseEnter={() => setLogoutHover(true)}
                            onMouseLeave={() => setLogoutHover(false)}
                            className="flex min-h-[47px] w-full cursor-pointer items-center gap-3 px-4 text-left text-[16px] font-bold transition"
                            style={{
                              color: colors.logoutText,
                              backgroundColor: logoutHover
                                ? colors.logoutHoverBg
                                : "transparent",
                            }}
                          >
                            <span
                              className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]"
                              style={{ backgroundColor: colors.logoutIconBg }}
                            >
                              <LogOut size={13} />
                            </span>
                            <span>{texts.logout}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!pageLoading && (
              <button
                type="button"
                onClick={() => {
                  closeAllModals();
                  setOpenLangModal(true);
                }}
                className="ml-1 flex h-[34px] w-[34px] cursor-pointer items-center justify-center overflow-hidden rounded-full transition hover:scale-105"
              >
                <img
                  src={language === "Bangla" ? flagUrl.Bangla : flagUrl.English}
                  alt={language}
                  className="h-[26px] w-[26px] rounded-full object-cover"
                />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="https://apps.bajiman.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer flex-col items-center justify-center gap-[1px]"
              style={{ color: colors.mobileMenuIconColor }}
            >
              <Download size={19} />
              <span className="text-[9px] font-semibold leading-none">
                {isBangla ? "অ্যাপ" : "App"}
              </span>
            </a>

            {pageLoading ? (
              <div className="h-[34px] w-[34px] animate-pulse rounded-full bg-white/25" />
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeAllModals();
                  setOpenLangModal(true);
                }}
                className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center overflow-hidden rounded-full transition hover:scale-105"
              >
                <img
                  src={language === "Bangla" ? flagUrl.Bangla : flagUrl.English}
                  alt={language}
                  className="h-[26px] w-[26px] rounded-full object-cover"
                />
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {openLangModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 18 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div
                className="px-5 py-4"
                style={{
                  backgroundColor: colors.languageModalHeaderBg,
                  color: colors.languageModalHeaderText,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{texts.language}</h2>
                    <p className="mt-1 text-xs opacity-80">{texts.subtitle}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenLangModal(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                    style={{ color: colors.languageModalHeaderText }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="rounded-xl bg-[#eef7ff] p-1">
                  {languages.map((item) => {
                    const active = language === item.key;

                    return (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => {
                          changeLanguage(item.key);
                          setOpenLangModal(false);
                        }}
                        className="mb-1 flex h-[52px] w-full cursor-pointer items-center justify-between rounded-lg px-3 transition last:mb-0"
                        style={{
                          backgroundColor: active
                            ? colors.languageActiveBg
                            : colors.languageInactiveBg,
                          color: active
                            ? colors.languageActiveText
                            : colors.languageInactiveText,
                          boxShadow: active
                            ? "0 4px 10px rgba(0,0,0,0.12)"
                            : "none",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.flag}
                            alt={item.label}
                            className="h-8 w-8 rounded-full object-cover"
                          />

                          <span className="text-sm font-bold">
                            {item.label}
                          </span>
                        </div>

                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full border"
                          style={{
                            borderColor: active ? "#ffffff" : "#c9dff2",
                            backgroundColor: active ? "#ffffff" : "#eef7ff",
                            color: active
                              ? colors.languageActiveBg
                              : "transparent",
                          }}
                        >
                          <Check size={15} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        onLoginClick={() => {
          setOpenRegister(false);
          setOpenLogin(true);
        }}
      />

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onRegisterClick={() => {
          setOpenLogin(false);
          setOpenRegister(true);
        }}
        onForgotClick={() => {
          setOpenLogin(false);
          setOpenForgetPassword(true);
        }}
      />

      <ForgetPasswordModal
        open={openForgetPassword}
        onClose={() => setOpenForgetPassword(false)}
        onLoginClick={() => {
          setOpenForgetPassword(false);
          setOpenLogin(true);
        }}
      />

      <ReferAndRedeemModal
        open={openReferRedeem}
        onClose={() => {
          setOpenReferRedeem(false);
          fetchReferRedeemInfo();
        }}
      />

      <PersonalInfoModal
        open={openPersonalInfo}
        onClose={() => setOpenPersonalInfo(false)}
        onUpdated={(updatedUser) => {
          dispatch(updateUser(updatedUser));
        }}
      />

      <PasswordChangeModal
        open={openPasswordChange}
        onClose={() => setOpenPasswordChange(false)}
      />

      <AutoDepositModal
        open={openAutoDeposit}
        onClose={() => setOpenAutoDeposit(false)}
        onDepositClick={() => {
          setOpenAutoDeposit(false);
          setOpenDepositFunds(true);
        }}
      />

      <DepositFundsModal
        open={openDepositFunds}
        onClose={() => setOpenDepositFunds(false)}
        onNext={(payload) => {
          setDepositData(payload);
          setOpenDepositFunds(false);
          setOpenDepositConfirm(true);
        }}
      />

      <DepositConfirmModal
        open={openDepositConfirm}
        depositData={depositData}
        onClose={() => setOpenDepositConfirm(false)}
        onBack={() => {
          setOpenDepositConfirm(false);
          setOpenDepositFunds(true);
        }}
        onSuccess={() => {
          setOpenDepositConfirm(false);
          setOpenDepositHistory(true);
        }}
      />

      <DepositHistoryModal
        open={openDepositHistory}
        onClose={() => setOpenDepositHistory(false)}
        onBackToDeposit={() => {
          setOpenDepositHistory(false);
          setOpenAutoDeposit(true);
        }}
      />

      <WithdrawModal
        open={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        onDepositClick={() => {
          setOpenWithdraw(false);
          setOpenAutoDeposit(true);
        }}
      />
    </>
  );
};

export default Navber;
