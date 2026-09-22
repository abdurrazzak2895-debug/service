import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent,
  Check,
  Copy,
  Gift,
  History,
  RefreshCw,
  Share2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import { selectModalColorSetting } from "../../features/global/globalSelectors";
import api from "../../api/axios";

const fallbackLogoUrl =
  "https://img.c88rx.com/cx/h5/assets/images/member-logo.png?v=1780386038573";

const defaultModalColors = {
  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",

  headerBg: "#0865a9",
  headerText: "#ffffff",
  closeIconColor: "#ffffff",

  primaryBg: "#0865a9",
  primaryText: "#ffffff",

  secondaryBg: "#2e9bf3",
  secondaryText: "#ffffff",

  inactiveTabBg: "#00518c",
  inactiveTabText: "#ffffff",

  promotionBg: "#e9b20d",
  promotionText: "#ffffff",

  sectionBg: "#eef4ff",
  sectionBorder: "#97b6e9",
  sectionText: "#2451cc",

  cardBg: "#ffffff",
  cardBorder: "#d7d7d7",

  inputBg: "#eeeeee",
  inputText: "#222222",
  inputBorder: "#d7d7d7",
  inputFocusBorder: "#0865a9",

  labelText: "#333333",
  normalText: "#333333",
  mutedText: "#777777",

  summaryBg: "#eef7ff",
  summaryText: "#0865a9",

  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",

  dangerBg: "#fef2f2",
  dangerText: "#dc2626",

  successBg: "#ecfdf5",
  successText: "#059669",
};

const money = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";
  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ReferAndRedeemModal = ({
  open,
  onClose,
  setting: customSetting = {},
}) => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();
  const authUser = useSelector(selectUser);

  const modalColorSetting = useSelector(selectModalColorSetting);

  const setting = {
    logo: "",
    logoUrl: "",

    overlayBg:
      modalColorSetting?.pageOverlayBg || defaultModalColors.pageOverlayBg,
    modalBg: modalColorSetting?.modalBg || defaultModalColors.modalBg,
    headerBg: modalColorSetting?.headerBg || defaultModalColors.headerBg,
    headerText: modalColorSetting?.headerText || defaultModalColors.headerText,

    labelText: modalColorSetting?.labelText || defaultModalColors.labelText,
    inputBg: modalColorSetting?.inputBg || defaultModalColors.inputBg,
    inputText: modalColorSetting?.inputText || defaultModalColors.inputText,
    inputBorder:
      modalColorSetting?.inputBorder || defaultModalColors.inputBorder,
    placeholderText:
      modalColorSetting?.mutedText || defaultModalColors.mutedText,

    buttonBg: modalColorSetting?.primaryBg || defaultModalColors.primaryBg,
    buttonText:
      modalColorSetting?.primaryText || defaultModalColors.primaryText,
    buttonDisabledBg:
      modalColorSetting?.disabledBg || defaultModalColors.disabledBg,

    secondaryButtonBg: modalColorSetting?.cardBg || defaultModalColors.cardBg,
    secondaryButtonText:
      modalColorSetting?.primaryBg || defaultModalColors.primaryBg,
    secondaryButtonBorder:
      modalColorSetting?.primaryBg || defaultModalColors.primaryBg,

    linkText: modalColorSetting?.summaryText || defaultModalColors.summaryText,
    footerText: modalColorSetting?.mutedText || defaultModalColors.mutedText,

    successBg: modalColorSetting?.successBg || defaultModalColors.successBg,
    successText:
      modalColorSetting?.successText || defaultModalColors.successText,
    dangerBg: modalColorSetting?.dangerBg || defaultModalColors.dangerBg,
    dangerText: modalColorSetting?.dangerText || defaultModalColors.dangerText,

    ...(customSetting || {}),
  };

  const logoUrl = setting.logoUrl || setting.logo || fallbackLogoUrl;

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const [info, setInfo] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [histories, setHistories] = useState([]);
  const [redeemAmount, setRedeemAmount] = useState("");

  const user = info?.user || authUser || {};
  const redeemSetting = info?.setting || {};
  const calculation = info?.calculation || {};

  const referralCode = user?.referralCode || "";

  const clientBase = import.meta.env.VITE_CLIENT_URL;

  const referralLink = `${clientBase}/?ref=${referralCode}`;

  const points = Number(user?.referCommissionBalance || 0);
  const totalInvite = Number(user?.referralCount || referredUsers.length || 0);
  const estimatedRedeemAmount = Number(calculation?.estimatedRedeemAmount || 0);

  const redeemPoint = Number(redeemSetting?.redeemPoint || 0);
  const redeemMoney = Number(redeemSetting?.redeemMoney || 0);
  const enteredAmount = Number(redeemAmount || 0);

  const requiredPoints =
    enteredAmount > 0 && redeemPoint > 0 && redeemMoney > 0
      ? (enteredAmount / redeemMoney) * redeemPoint
      : 0;

  const pointsAfterRedeem = points - requiredPoints;

  const canRedeem =
    redeemSetting?.isActive &&
    enteredAmount > 0 &&
    requiredPoints > 0 &&
    points >= requiredPoints &&
    enteredAmount >= Number(redeemSetting?.minimumRedeemAmount || 0) &&
    (Number(redeemSetting?.maximumRedeemAmount || 0) <= 0 ||
      enteredAmount <= Number(redeemSetting?.maximumRedeemAmount || 0));

  const t = useMemo(
    () => ({
      title: isBangla ? "রেফার ও রিডিম" : "Refer & Redeem",
      subtitle: isBangla
        ? "বন্ধুদের আমন্ত্রণ করুন এবং রিওয়ার্ড অর্জন করুন"
        : "Invite your friends and earn rewards",
      referralLink: isBangla ? "আপনার রেফারেল লিংক" : "Your Referral Link",
      copy: isBangla ? "কপি" : "Copy",
      copied: isBangla ? "কপি হয়েছে" : "Copied",
      invites: isBangla ? "মোট ইনভাইট" : "Total Invites",
      points: isBangla ? "রেফার পয়েন্ট" : "Refer Points",
      estimated: isBangla ? "সম্ভাব্য টাকা" : "Estimated Money",
      conversion: isBangla ? "রিডিম কনভার্সন" : "Redeem Conversion",
      minimum: isBangla ? "মিনিমাম" : "Minimum",
      maximum: isBangla ? "ম্যাক্সিমাম" : "Maximum",
      noLimit: isBangla ? "লিমিট নেই" : "No Limit",
      redeem: isBangla ? "রিডিম করুন" : "Redeem",
      redeemNow: isBangla ? "এখন রিডিম করুন" : "Redeem Now",
      redeemAmount: isBangla ? "রিডিম এমাউন্ট" : "Redeem Amount",
      requiredPoints: isBangla ? "লাগবে পয়েন্ট" : "Required Points",
      afterRedeem: isBangla ? "রিডিমের পরে পয়েন্ট" : "Points After Redeem",
      recentUsers: isBangla
        ? "সাম্প্রতিক রেফারেল ইউজার"
        : "Recent Referral Users",
      history: isBangla ? "রিডিম হিস্টোরি" : "Redeem History",
      noUsers: isBangla ? "এখনো কোনো ইউজার নেই" : "No referred users yet",
      noHistory: isBangla ? "এখনো কোনো হিস্টোরি নেই" : "No redeem history yet",
      active: isBangla ? "অ্যাক্টিভ" : "Active",
      inactive: isBangla ? "ইনঅ্যাক্টিভ" : "Inactive",
      refresh: isBangla ? "রিফ্রেশ" : "Refresh",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
      redeeming: isBangla ? "রিডিম হচ্ছে..." : "Redeeming...",
      invalidAmount: isBangla
        ? "রিডিম করার জন্য সঠিক এমাউন্ট দিন"
        : "Please enter a valid redeem amount",
      copyFailed: isBangla ? "কপি করা যায়নি" : "Copy failed",
      noCode: isBangla ? "রেফারেল কোড পাওয়া যায়নি" : "Referral code not found",
    }),
    [isBangla],
  );

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [infoRes, usersRes, historyRes] = await Promise.all([
        api.get("/api/user/refer-redeem/info"),
        api.get("/api/user/refer-redeem/referred-users"),
        api.get("/api/user/refer-redeem/histories"),
      ]);

      setInfo(infoRes?.data?.data || null);
      setReferredUsers(
        Array.isArray(usersRes?.data?.data) ? usersRes.data.data : [],
      );
      setHistories(
        Array.isArray(historyRes?.data?.data) ? historyRes.data.data : [],
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load referral data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    if (loading || redeeming) return;
    onClose?.();
    setRedeemOpen(false);
    setRedeemAmount("");
  };

  const handleCopy = async () => {
    if (!referralCode) {
      toast.error(t.noCode);
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success(
        isBangla ? "রেফারেল লিংক কপি হয়েছে" : "Referral link copied",
      );
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t.copyFailed);
    }
  };

  const openRedeemBox = () => {
    const min = Number(redeemSetting?.minimumRedeemAmount || 0);
    setRedeemAmount(min > 0 ? String(min) : "");
    setRedeemOpen(true);
  };

  const handleRedeem = async () => {
    if (!canRedeem) {
      toast.error(t.invalidAmount);
      return;
    }

    try {
      setRedeeming(true);

      const { data } = await api.post("/api/user/refer-redeem/redeem", {
        redeemAmount: enteredAmount,
      });

      const updatedUser = data?.data?.user;

      if (updatedUser) {
        dispatch(
          updateUser({
            balance: Number(updatedUser.balance || 0),
            referCommissionBalance: Number(
              updatedUser.referCommissionBalance || 0,
            ),
          }),
        );
      }

      toast.success(data?.message || "Redeem successful");
      setRedeemOpen(false);
      setRedeemAmount("");
      fetchAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Redeem failed");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: setting.overlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[375px] sm:rounded-[8px]"
            style={{ backgroundColor: setting.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: setting.headerBg,
                color: setting.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading || redeeming}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: setting.headerText }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[12px] pb-2 pt-2">
              <div
                className="mb-5 rounded-[22px] p-4"
                style={{
                  backgroundColor: setting.headerBg,
                  color: setting.headerText,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                    <Share2 size={25} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[20px] font-black">{t.title}</h3>
                    <p className="mt-1 text-sm font-semibold opacity-80">
                      {t.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchAll}
                    disabled={loading}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      size={17}
                      className={loading ? "animate-spin" : ""}
                    />
                  </button>
                </div>
              </div>

              <div
                className="mb-5 rounded-[18px] border p-4"
                style={{
                  borderColor: setting.inputBorder,
                  backgroundColor: setting.inputBg,
                }}
              >
                <div
                  className="mb-3 flex items-center gap-2 text-sm font-bold"
                  style={{ color: setting.linkText }}
                >
                  <BadgePercent size={18} />
                  {t.referralLink}
                </div>

                <div
                  className="rounded-[14px] border px-3 py-3"
                  style={{
                    borderColor: setting.inputBorder,
                    backgroundColor: setting.modalBg,
                    color: setting.inputText,
                  }}
                >
                  <p className="break-all text-[13px] font-bold leading-5">
                    {referralCode ? referralLink : "N/A"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-4 flex h-[45px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] text-[14px] font-bold"
                  style={{
                    backgroundColor: setting.buttonBg,
                    color: setting.buttonText,
                  }}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2">
                <StatCard
                  icon={<Users size={20} />}
                  label={t.invites}
                  value={totalInvite}
                  setting={setting}
                />
                <StatCard
                  icon={<Gift size={20} />}
                  label={t.points}
                  value={points.toLocaleString("en-US")}
                  setting={setting}
                />
                <StatCard
                  icon={<Wallet size={20} />}
                  label={t.estimated}
                  value={money(estimatedRedeemAmount)}
                  setting={setting}
                />
              </div>

              <div
                className="mb-5 rounded-[18px] border p-4"
                style={{
                  borderColor: setting.inputBorder,
                  backgroundColor: setting.inputBg,
                }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3
                      className="text-[16px] font-black"
                      style={{ color: setting.linkText }}
                    >
                      {t.conversion}
                    </h3>
                    <p
                      className="mt-1 text-xs font-bold"
                      style={{ color: setting.footerText }}
                    >
                      {Number(redeemSetting?.redeemPoint || 0).toLocaleString(
                        "en-US",
                      )}{" "}
                      Point = {money(redeemSetting?.redeemMoney)}
                    </p>
                  </div>

                  <span
                    className="rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      backgroundColor: redeemSetting?.isActive
                        ? setting.successBg
                        : setting.dangerBg,
                      color: redeemSetting?.isActive
                        ? setting.successText
                        : setting.dangerText,
                    }}
                  >
                    {redeemSetting?.isActive ? t.active : t.inactive}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <LimitBox
                    title={t.minimum}
                    value={money(redeemSetting?.minimumRedeemAmount)}
                    setting={setting}
                  />
                  <LimitBox
                    title={t.maximum}
                    value={
                      Number(redeemSetting?.maximumRedeemAmount || 0) > 0
                        ? money(redeemSetting?.maximumRedeemAmount)
                        : t.noLimit
                    }
                    setting={setting}
                  />
                </div>

                <button
                  type="button"
                  onClick={openRedeemBox}
                  disabled={!redeemSetting?.isActive || points <= 0}
                  className="mt-4 flex h-[45px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    backgroundColor:
                      !redeemSetting?.isActive || points <= 0
                        ? setting.buttonDisabledBg
                        : setting.buttonBg,
                    color: setting.buttonText,
                  }}
                >
                  <Gift size={18} />
                  {t.redeem}
                </button>
              </div>

              {redeemOpen && (
                <div
                  className="mb-5 rounded-[18px] border p-4"
                  style={{
                    borderColor: setting.inputBorder,
                    backgroundColor: setting.modalBg,
                  }}
                >
                  <label className="mb-4 block">
                    <span
                      className="mb-2 block text-sm font-black"
                      style={{ color: setting.labelText }}
                    >
                      {t.redeemAmount}
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      className="h-[45px] w-full rounded-[4px] border px-4 text-[15px] font-black outline-none"
                      style={{
                        borderColor: setting.inputBorder,
                        backgroundColor: setting.inputBg,
                        color: setting.inputText,
                      }}
                      placeholder="100"
                    />
                  </label>

                  <div
                    className="mb-4 space-y-2 rounded-[14px] p-4 text-sm"
                    style={{ backgroundColor: setting.inputBg }}
                  >
                    <SummaryRow
                      label={t.points}
                      value={points.toLocaleString("en-US")}
                      setting={setting}
                    />
                    <SummaryRow
                      label={t.requiredPoints}
                      value={requiredPoints.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                      setting={setting}
                    />
                    <SummaryRow
                      label={t.afterRedeem}
                      value={pointsAfterRedeem.toLocaleString("en-US", {
                        maximumFractionDigits: 2,
                      })}
                      danger={pointsAfterRedeem < 0}
                      setting={setting}
                    />
                    <SummaryRow
                      label={t.redeemAmount}
                      value={money(enteredAmount)}
                      setting={setting}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRedeem}
                    disabled={!canRedeem || redeeming}
                    className="flex h-[45px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-70"
                    style={{
                      backgroundColor:
                        !canRedeem || redeeming
                          ? setting.buttonDisabledBg
                          : setting.buttonBg,
                      color: setting.buttonText,
                    }}
                  >
                    <Wallet size={18} />
                    {redeeming ? t.redeeming : t.redeemNow}
                  </button>
                </div>
              )}

              <ListBlock
                title={t.recentUsers}
                icon={<Users size={18} />}
                setting={setting}
              >
                {referredUsers.length === 0 ? (
                  <Empty text={t.noUsers} setting={setting} />
                ) : (
                  referredUsers.map((item) => (
                    <div
                      key={item._id}
                      className="mb-2 flex items-center justify-between gap-3 rounded-[14px] border p-3 last:mb-0"
                      style={{
                        borderColor: setting.inputBorder,
                        backgroundColor: setting.inputBg,
                      }}
                    >
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-black"
                          style={{ color: setting.inputText }}
                        >
                          {item.userId}
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: setting.footerText }}
                        >
                          {item.countryCode} {item.phone} •{" "}
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                        style={{
                          backgroundColor: item.isActive
                            ? setting.successBg
                            : setting.dangerBg,
                          color: item.isActive
                            ? setting.successText
                            : setting.dangerText,
                        }}
                      >
                        {item.isActive ? t.active : t.inactive}
                      </span>
                    </div>
                  ))
                )}
              </ListBlock>

              <ListBlock
                title={t.history}
                icon={<History size={18} />}
                setting={setting}
              >
                {histories.length === 0 ? (
                  <Empty text={t.noHistory} setting={setting} />
                ) : (
                  histories.slice(0, 10).map((item) => (
                    <div
                      key={item._id}
                      className="mb-2 rounded-[14px] border p-3 last:mb-0"
                      style={{
                        borderColor: setting.inputBorder,
                        backgroundColor: setting.inputBg,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p
                            className="text-sm font-black"
                            style={{ color: setting.inputText }}
                          >
                            {money(item.redeemAmount)}
                          </p>
                          <p
                            className="text-xs font-bold"
                            style={{ color: setting.footerText }}
                          >
                            {formatDate(item.createdAt)}
                          </p>
                        </div>

                        <span
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{
                            backgroundColor: setting.successBg,
                            color: setting.successText,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div
                        className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold"
                        style={{ color: setting.footerText }}
                      >
                        <p>
                          Points:{" "}
                          {Number(item.pointsUsed || 0).toLocaleString()}
                        </p>
                        <p>
                          After:{" "}
                          {Number(item.pointsAfter || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </ListBlock>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const StatCard = ({ icon, label, value, setting }) => {
  return (
    <div
      className="rounded-[16px] border p-3 text-center"
      style={{
        borderColor: setting.inputBorder,
        backgroundColor: setting.inputBg,
      }}
    >
      <div
        className="mx-auto mb-2 flex justify-center"
        style={{ color: setting.linkText }}
      >
        {icon}
      </div>
      <p
        className="text-[14px] font-black"
        style={{ color: setting.inputText }}
      >
        {value}
      </p>
      <p
        className="text-[10px] font-bold"
        style={{ color: setting.footerText }}
      >
        {label}
      </p>
    </div>
  );
};

const LimitBox = ({ title, value, setting }) => {
  return (
    <div
      className="rounded-[14px] p-3"
      style={{ backgroundColor: setting.modalBg }}
    >
      <p className="text-xs font-bold" style={{ color: setting.footerText }}>
        {title}
      </p>
      <p
        className="mt-1 text-sm font-black"
        style={{ color: setting.inputText }}
      >
        {value}
      </p>
    </div>
  );
};

const SummaryRow = ({ label, value, danger, setting }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-bold" style={{ color: setting.footerText }}>
        {label}
      </span>
      <span
        className="font-black"
        style={{ color: danger ? setting.dangerText : setting.inputText }}
      >
        {value}
      </span>
    </div>
  );
};

const ListBlock = ({ title, icon, setting, children }) => {
  return (
    <div
      className="mb-5 rounded-[18px] border p-4"
      style={{
        borderColor: setting.inputBorder,
        backgroundColor: setting.modalBg,
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span style={{ color: setting.linkText }}>{icon}</span>
        <h3
          className="text-[16px] font-black"
          style={{ color: setting.linkText }}
        >
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
};

const Empty = ({ text, setting }) => {
  return (
    <p
      className="rounded-[14px] p-4 text-center text-sm font-bold"
      style={{
        backgroundColor: setting.inputBg,
        color: setting.footerText,
      }}
    >
      {text}
    </p>
  );
};

export default ReferAndRedeemModal;
