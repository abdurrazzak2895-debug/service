import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import SuccessConfirmModal from "../SuccessConfirmModal/SuccessConfirmModal";
import OtpVerifyBox from "../OtpVerifyBox/OtpVerifyBox";
import useOtpSetting from "../../hook/useOtpSetting";

const normalizePhone = (value) => String(value || "").replace(/[^\d]/g, "");

const walletTypes = [{ key: "personal", bn: "পার্সোনাল", en: "Personal" }];

// Number entry -> OTP (sent to the user's own registered phone) -> success.
// Extracted out of WithdrawModal.jsx so that file doesn't keep growing.
const AddEWalletFlow = ({ open, onClose, onCreated, colors, isBangla }) => {
  const [step, setStep] = useState("form");

  const [walletType, setWalletType] = useState("personal");
  const [walletNumber, setWalletNumber] = useState("");
  const [walletLabel, setWalletLabel] = useState("");

  const [maskedPhone, setMaskedPhone] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { withdrawEnabled: withdrawOtpEnabled } = useOtpSetting();

  const t = {
    walletType: isBangla ? "ওয়ালেট টাইপ" : "Wallet Type",
    numberPlaceholder: "01XXXXXXXXX",
    labelPlaceholder: isBangla ? "যেমন: আমার নাম্বার" : "e.g. My number",
    sendOtp: isBangla ? "OTP পাঠান" : "Send OTP",
    sending: isBangla ? "পাঠানো হচ্ছে..." : "Sending...",
    add: isBangla ? "যোগ করুন" : "Add",
    adding: isBangla ? "যোগ হচ্ছে..." : "Adding...",
    invalidPhone: isBangla
      ? "সঠিক বাংলাদেশি নাম্বার দিন"
      : "Enter a valid Bangladeshi phone number",
    verifyAndAdd: isBangla ? "ভেরিফাই করে যোগ করুন" : "Verify & Add",
    verifying: isBangla ? "ভেরিফাই হচ্ছে..." : "Verifying...",
    successTitle: isBangla
      ? "ফোন নম্বর সফলভাবে যোগ করা হয়েছে!"
      : "Phone number added successfully!",
    successDesc: isBangla
      ? "এই নম্বরটি এখন থেকে যেকোনো উইথড্র মেথডে ব্যবহার করতে পারবেন।"
      : "You can now use this number for any withdraw method.",
    ok: isBangla ? "ঠিক আছে" : "OK",
  };

  useEffect(() => {
    if (!open) {
      setStep("form");
      setWalletNumber("");
      setWalletLabel("");
      setWalletType("personal");
      setMaskedPhone("");
      setResendSeconds(0);
    }
  }, [open]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      setResendSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleSendOtp = async () => {
    const number = normalizePhone(walletNumber);

    if (!/^01[3-9]\d{8}$/.test(number)) {
      toast.error(t.invalidPhone);
      return;
    }

    try {
      setSendingOtp(true);

      const { data } = await api.post("/api/e-wallets/send-otp");

      if (!data?.success) {
        throw new Error(data?.message || "OTP send failed");
      }

      setMaskedPhone(data?.maskedPhone || "");
      setResendSeconds(Number(data?.resendAfter || 60));
      setStep("otp");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleFormSubmit = async () => {
    const number = normalizePhone(walletNumber);

    if (!/^01[3-9]\d{8}$/.test(number)) {
      toast.error(t.invalidPhone);
      return;
    }

    if (withdrawOtpEnabled) {
      handleSendOtp();
      return;
    }

    try {
      setSubmitting(true);

      const { data } = await api.post("/api/e-wallets", {
        walletType,
        walletNumber: number,
        label: walletLabel,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Wallet create failed");
      }

      onCreated?.(data?.data);
      setStep("success");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAndAdd = async (otpValue) => {
    const number = normalizePhone(walletNumber);

    try {
      setVerifying(true);

      const { data } = await api.post("/api/e-wallets", {
        walletType,
        walletNumber: number,
        label: walletLabel,
        otp: otpValue,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Wallet create failed");
      }

      onCreated?.(data?.data);
      setStep("success");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleDone = () => {
    onClose?.();
  };

  if (!open) return null;

  return (
    <div
      className="mt-3 rounded-[5px] border p-3"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
      }}
    >
      {step === "form" && (
        <div className="grid grid-cols-1 gap-2">
          <select
            value={walletType}
            onChange={(e) => setWalletType(e.target.value)}
            className="h-[40px] rounded-[4px] border px-3 text-[13px] outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
              borderColor: colors.inputBorder,
            }}
          >
            {walletTypes.map((type) => (
              <option key={type.key} value={type.key}>
                {isBangla ? type.bn : type.en}
              </option>
            ))}
          </select>

          <input
            value={walletNumber}
            onChange={(e) => setWalletNumber(normalizePhone(e.target.value))}
            placeholder={t.numberPlaceholder}
            inputMode="numeric"
            className="h-[40px] rounded-[4px] border px-3 text-[13px] outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
              borderColor: colors.inputBorder,
            }}
          />

          <input
            value={walletLabel}
            onChange={(e) => setWalletLabel(e.target.value)}
            placeholder={t.labelPlaceholder}
            className="h-[40px] rounded-[4px] border px-3 text-[13px] outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
              borderColor: colors.inputBorder,
            }}
          />

          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={sendingOtp || submitting}
            className="h-[36px] cursor-pointer rounded-[4px] text-[13px] font-bold disabled:cursor-not-allowed"
            style={{
              backgroundColor:
                sendingOtp || submitting
                  ? colors.disabledBg
                  : colors.primaryBg,
              color:
                sendingOtp || submitting
                  ? colors.disabledText
                  : colors.primaryText,
            }}
          >
            {withdrawOtpEnabled
              ? sendingOtp
                ? t.sending
                : t.sendOtp
              : submitting
                ? t.adding
                : t.add}
          </button>
        </div>
      )}

      {step === "otp" && (
        <OtpVerifyBox
          maskedPhone={maskedPhone}
          resendSeconds={resendSeconds}
          onResend={handleSendOtp}
          sendingOtp={sendingOtp}
          onVerify={handleVerifyAndAdd}
          verifying={verifying}
          onBack={() => setStep("form")}
          colors={colors}
          isBangla={isBangla}
          submitLabel={t.verifyAndAdd}
          submittingLabel={t.verifying}
        />
      )}

      <SuccessConfirmModal
        open={step === "success"}
        icon={CheckCircle2}
        title={t.successTitle}
        description={t.successDesc}
        buttonText={t.ok}
        onButtonClick={handleDone}
        colors={colors}
      />
    </div>
  );
};

export default AddEWalletFlow;
