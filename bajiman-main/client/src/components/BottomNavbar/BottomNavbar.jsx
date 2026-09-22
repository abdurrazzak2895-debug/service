import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Check,
  X,
  Home,
  Gift,
  Landmark,
  UserCircle,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import { selectBottomNavigationColorSetting } from "../../features/global/globalSelectors";

import RegisterModal from "../RegisterModal/RegisterModal";
import LoginModal from "../LoginModal/LoginModal";
import DepositFundsModal from "../DepositFundsModal/DepositFundsModal";
import DepositConfirmModal from "../DepositConfirmModal/DepositConfirmModal";
import DepositHistoryModal from "../DepositHistoryModal/DepositHistoryModal";
import PromotionModal from "../PromotionModal/PromotionModal";
import AccountModal from "../AccountModal/AccountModal";
import PersonalInfoModal from "../PersonalInfoModal/PersonalInfoModal";
import PasswordChangeModal from "../PasswordChangeModal/PasswordChangeModal";
import WithdrawModal from "../WithdrawModal/WithdrawModal";
import ForgetPasswordModal from "../ForgetPasswordModal/ForgetPasswordModal";

const flagUrl = {
  Bangla: "https://flagcdn.com/w40/bd.png",
  English: "https://flagcdn.com/w40/us.png",
};

const defaultBottomColors = {
  beforeLoginBg: "#ffffff",
  beforeLoginBorder: "#c9c9c9",

  languageBoxBg: "#dce8f2",
  languageTitleText: "#0b3554",
  languageSubtitleText: "#111111",

  signupBg: "#ffffff",
  signupText: "#111111",

  loginBg: "#0b66a8",
  loginText: "#ffffff",

  afterLoginBgFrom: "#051b2e",
  afterLoginBgVia: "#082f50",
  afterLoginBgTo: "#051b2e",
  afterLoginBorder: "rgba(255,255,255,0.10)",

  itemIconBg: "rgba(255,255,255,0.10)",
  itemIconText: "rgba(255,255,255,0.85)",
  itemText: "rgba(255,255,255,0.75)",

  activeIconBg: "#2e9bf3",
  activeIconText: "#ffffff",
  activeText: "#ffffff",

  depositIconBgFrom: "#2e9bf3",
  depositIconBgTo: "#0865a9",
  depositIconText: "#ffffff",
  depositBadgeBg: "#5ed51d",
  depositBadgeText: "#ffffff",

  langModalOverlayBg: "rgba(0,0,0,0.50)",
  langModalBg: "#ffffff",
  langModalHeaderBg: "#0b66a8",
  langModalHeaderText: "#ffffff",
  langModalMutedText: "rgba(255,255,255,0.80)",

  langOptionWrapperBg: "#eef7ff",
  langOptionBg: "#ffffff",
  langOptionText: "#111111",
  langOptionActiveBg: "#0b66a8",
  langOptionActiveText: "#ffffff",
  langOptionCheckBg: "#ffffff",
  langOptionCheckText: "#0b66a8",
  langOptionCheckBorder: "#c9dff2",
};

const BottomNavbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { language, changeLanguage, isBangla } = useLanguage();
  const isAuth = useSelector(selectIsAuth);

  const bottomNavigationColorSetting = useSelector(
    selectBottomNavigationColorSetting,
  );

  const colors = {
    ...defaultBottomColors,
    ...(bottomNavigationColorSetting || {}),
  };

  const [openLangModal, setOpenLangModal] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  const [openPromotion, setOpenPromotion] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);

  const [openDepositFunds, setOpenDepositFunds] = useState(false);
  const [openDepositConfirm, setOpenDepositConfirm] = useState(false);
  const [openDepositHistory, setOpenDepositHistory] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openPersonalInfo, setOpenPersonalInfo] = useState(false);
  const [openPasswordChange, setOpenPasswordChange] = useState(false);
  const [openForgetPassword, setOpenForgetPassword] = useState(false);

  const [depositData, setDepositData] = useState(null);

  const languages = [
    { key: "Bangla", label: "বাংলা", flag: flagUrl.Bangla },
    { key: "English", label: "English", flag: flagUrl.English },
  ];

  const closeChildModals = () => {
    setOpenLangModal(false);
    setOpenRegister(false);
    setOpenLogin(false);
    setOpenPromotion(false);
    setOpenDepositFunds(false);
    setOpenDepositConfirm(false);
    setOpenDepositHistory(false);
    setOpenWithdraw(false);
    setOpenPersonalInfo(false);
    setOpenPasswordChange(false);
    setOpenForgetPassword(false);
  };

  const closeAllModals = () => {
    closeChildModals();
    setOpenAccount(false);
  };

  const requireAuthOrLogin = () => {
    if (isAuth) return true;
    closeAllModals();
    setOpenLogin(true);
    return false;
  };

  const openDepositModal = () => {
    if (!requireAuthOrLogin()) return;
    closeChildModals();
    setOpenDepositFunds(true);
  };

  const openWithdrawModal = () => {
    if (!requireAuthOrLogin()) return;
    closeChildModals();
    setOpenWithdraw(true);
  };

  const openTransactionModal = () => {
    if (!requireAuthOrLogin()) return;
    closeChildModals();
    setOpenDepositHistory(true);
  };

  const openPersonalInfoModal = () => {
    if (!requireAuthOrLogin()) return;
    closeChildModals();
    setOpenPersonalInfo(true);
  };

  const openPasswordChangeModal = () => {
    if (!requireAuthOrLogin()) return;
    closeChildModals();
    setOpenPasswordChange(true);
  };

  const authMenus = [
    {
      label: isBangla ? "হোম" : "Home",
      path: "/",
      icon: Home,
      type: "link",
    },
    {
      label: isBangla ? "প্রোমোশন" : "Promotions",
      path: "__promotion_modal__",
      icon: Gift,
      type: "button",
    },
    {
      label: isBangla ? "ডিপোজিট" : "Deposit",
      path: "__deposit_modal__",
      icon: Landmark,
      type: "button",
      highlight: true,
    },
    {
      label: isBangla ? "আমার একাউন্ট" : "My Account",
      path: "__account_modal__",
      icon: UserCircle,
      type: "button",
    },
  ];

  const handleMenuClick = (item) => {
    if (item.path === "__promotion_modal__") {
      closeChildModals();
      setOpenPromotion(true);
      return;
    }

    if (item.path === "__deposit_modal__") {
      openDepositModal();
      return;
    }

    if (item.path === "__account_modal__") {
      if (!requireAuthOrLogin()) return;
      closeChildModals();
      setOpenAccount(true);
    }
  };

  const isActivePath = (path) => {
    if (!path || path.startsWith("__")) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {!isAuth ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex h-[50px] border-t shadow-[0_-2px_8px_rgba(0,0,0,0.12)] md:hidden"
          style={{
            backgroundColor: colors.beforeLoginBg,
            borderColor: colors.beforeLoginBorder,
          }}
        >
          <button
            type="button"
            onClick={() => {
              closeAllModals();
              setOpenLangModal(true);
            }}
            className="flex w-[100px] cursor-pointer items-center justify-center gap-2"
            style={{ backgroundColor: colors.languageBoxBg }}
          >
            <img
              src={language === "Bangla" ? flagUrl.Bangla : flagUrl.English}
              alt={language}
              className="h-[25px] w-[25px] rounded-full object-cover"
            />

            <div className="text-left leading-[15px]">
              <p
                className="text-[13px] font-bold"
                style={{ color: colors.languageTitleText }}
              >
                BDT
              </p>
              <p
                className="text-[12px] font-semibold"
                style={{ color: colors.languageSubtitleText }}
              >
                {isBangla ? "বাংলা" : "English"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              closeAllModals();
              setOpenRegister(true);
            }}
            className="flex flex-1 cursor-pointer items-center justify-center text-[15px] font-bold"
            style={{
              backgroundColor: colors.signupBg,
              color: colors.signupText,
            }}
          >
            {isBangla ? "সাইন আপ" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => {
              closeAllModals();
              setOpenLogin(true);
            }}
            className="flex flex-1 cursor-pointer items-center justify-center text-[15px] font-bold"
            style={{
              backgroundColor: colors.loginBg,
              color: colors.loginText,
            }}
          >
            {isBangla ? "লগইন" : "Login"}
          </button>
        </div>
      ) : (
        <div
          className="fixed bottom-2 left-0 right-0 z-40 border-t md:hidden"
          style={{ borderColor: colors.afterLoginBorder }}
        >
          <div
            className="flex h-[58px] items-center justify-between rounded-[18px] border px-2 pb-[3px] pt-[5px] shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md"
            style={{
              background: `linear-gradient(to right, ${colors.afterLoginBgFrom}, ${colors.afterLoginBgVia}, ${colors.afterLoginBgTo})`,
              borderColor: colors.afterLoginBorder,
            }}
          >
            {authMenus.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              const isDeposit = item.path === "__deposit_modal__";

              const content = (
                <>
                  <div
                    className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full transition"
                    style={{
                      background: isDeposit
                        ? `linear-gradient(to bottom right, ${colors.depositIconBgFrom}, ${colors.depositIconBgTo})`
                        : active
                          ? colors.activeIconBg
                          : colors.itemIconBg,
                      color: isDeposit
                        ? colors.depositIconText
                        : active
                          ? colors.activeIconText
                          : colors.itemIconText,
                      boxShadow: isDeposit
                        ? "0 10px 15px -3px rgba(30,64,175,0.30)"
                        : "none",
                    }}
                  >
                    <Icon size={17} />

                    {isDeposit && (
                      <span
                        className="absolute -right-[3px] -top-[3px] flex h-[13px] w-[13px] items-center justify-center rounded-full"
                        style={{
                          backgroundColor: colors.depositBadgeBg,
                          color: colors.depositBadgeText,
                        }}
                      >
                        <Sparkles size={8} />
                      </span>
                    )}
                  </div>

                  <span
                    className="mt-[3px] text-[10.5px] font-bold leading-none"
                    style={{
                      color:
                        active || isDeposit
                          ? colors.activeText
                          : colors.itemText,
                    }}
                  >
                    {item.label}
                  </span>
                </>
              );

              if (item.type === "link") {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeChildModals}
                    className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-center"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleMenuClick(item)}
                  className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-center"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {openLangModal && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center px-4"
            style={{ background: colors.langModalOverlayBg }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 18 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-[360px] overflow-hidden rounded-2xl shadow-2xl"
              style={{ backgroundColor: colors.langModalBg }}
            >
              <div
                className="px-5 py-4"
                style={{
                  backgroundColor: colors.langModalHeaderBg,
                  color: colors.langModalHeaderText,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">
                      {isBangla ? "ভাষা নির্বাচন করুন" : "Choose Language"}
                    </h2>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: colors.langModalMutedText }}
                    >
                      {isBangla
                        ? "আপনার পছন্দের ভাষা বেছে নিন"
                        : "Select your preferred language"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenLangModal(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                    style={{ color: colors.langModalHeaderText }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div
                  className="rounded-xl p-1"
                  style={{ backgroundColor: colors.langOptionWrapperBg }}
                >
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
                            ? colors.langOptionActiveBg
                            : colors.langOptionBg,
                          color: active
                            ? colors.langOptionActiveText
                            : colors.langOptionText,
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
                            borderColor: active
                              ? colors.langOptionCheckBg
                              : colors.langOptionCheckBorder,
                            backgroundColor: active
                              ? colors.langOptionCheckBg
                              : colors.langOptionWrapperBg,
                            color: active
                              ? colors.langOptionCheckText
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
          closeAllModals();
          setOpenLogin(true);
        }}
      />

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onRegisterClick={() => {
          closeAllModals();
          setOpenRegister(true);
        }}
        onForgotClick={() => {
          setOpenLogin(false);
          setOpenForgetPassword(true);
        }}
      />

      <PromotionModal
        open={openPromotion}
        onClose={() => setOpenPromotion(false)}
      />

      <AccountModal
        open={openAccount}
        onClose={() => setOpenAccount(false)}
        onDepositClick={openDepositModal}
        onWithdrawClick={openWithdrawModal}
        onTransactionClick={openTransactionModal}
        onPersonalInfoClick={openPersonalInfoModal}
        onPasswordChangeClick={openPasswordChangeModal}
        onLogoutDone={closeAllModals}
      />

      <DepositFundsModal
        open={openDepositFunds}
        onClose={() => setOpenDepositFunds(false)}
        onNext={(payload) => {
          setDepositData(payload);
          closeChildModals();
          setOpenDepositConfirm(true);
        }}
      />

      <DepositConfirmModal
        open={openDepositConfirm}
        depositData={depositData}
        onClose={() => setOpenDepositConfirm(false)}
        onBack={() => {
          closeChildModals();
          setOpenDepositFunds(true);
        }}
        onSuccess={() => {
          closeChildModals();
          setOpenDepositHistory(true);
        }}
      />

      <DepositHistoryModal
        open={openDepositHistory}
        onClose={() => setOpenDepositHistory(false)}
        onBackToDeposit={() => {
          closeChildModals();
          setOpenDepositFunds(true);
        }}
      />

      <WithdrawModal
        open={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        onDepositClick={() => {
          closeChildModals();
          setOpenDepositFunds(true);
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

      <ForgetPasswordModal
        open={openForgetPassword}
        onClose={() => setOpenForgetPassword(false)}
        onLoginClick={() => {
          setOpenForgetPassword(false);
          setOpenLogin(true);
        }}
      />
    </>
  );
};

export default BottomNavbar;
