import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

const OTP_LENGTH = 6;

// Reusable "enter the 6-digit code sent to my registered phone" box —
// shared by AddEWalletFlow (adding a new e-wallet number) and the withdraw
// confirmation step, both of which OTP-verify against the user's own
// registered phone. This component only handles the digit-box UX; the
// parent owns the actual send/verify API calls so each flow can decide
// what happens after a successful verify.
const OtpVerifyBox = ({
  maskedPhone,
  resendSeconds,
  onResend,
  sendingOtp,
  onVerify,
  verifying,
  onBack,
  colors,
  isBangla,
  submitLabel,
  submittingLabel,
}) => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);

  const t = {
    otpSentTo: isBangla ? "৬-ডিজিট কোড পাঠানো হয়েছে" : "6-digit code sent to",
    resend: isBangla ? "আবার পাঠান" : "Resend",
    back: isBangla ? "ফিরে যান" : "Back",
    enterFullOtp: isBangla
      ? "সম্পূর্ণ ৬ ডিজিট OTP দিন"
      : "Enter the full 6-digit OTP",
  };

  useEffect(() => {
    setTimeout(() => otpRefs.current?.[0]?.focus(), 50);
  }, []);

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current?.[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current?.[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpValue = otp.join("");

    if (otpValue.length < OTP_LENGTH) {
      toast.error(t.enterFullOtp);
      return;
    }

    onVerify?.(otpValue);
  };

  return (
    <div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold"
          style={{ color: colors.mutedText }}
        >
          <ArrowLeft size={14} />
          {t.back}
        </button>
      ) : null}

      <div
        className="mt-2 flex items-center gap-2"
        style={{ color: colors.primaryBg }}
      >
        <ShieldCheck size={16} />
        <p className="text-[12px] font-semibold">
          {t.otpSentTo} {maskedPhone}
        </p>
      </div>

      <div className="mt-3 flex justify-between gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              otpRefs.current[index] = el;
            }}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            inputMode="numeric"
            maxLength={1}
            className="h-[42px] w-[14%] rounded-[4px] border text-center text-[16px] font-bold outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
              borderColor: colors.inputFocusBorder,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onResend}
        disabled={resendSeconds > 0 || sendingOtp}
        className="mt-2 text-[12px] font-bold disabled:cursor-not-allowed"
        style={{
          color: resendSeconds > 0 ? colors.mutedText : colors.primaryBg,
        }}
      >
        {t.resend}
        {resendSeconds > 0 ? ` (${resendSeconds}s)` : ""}
      </button>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={verifying}
        className="mt-3 flex h-[36px] w-full cursor-pointer items-center justify-center gap-2 rounded-[4px] text-[13px] font-bold disabled:cursor-not-allowed"
        style={{
          backgroundColor: verifying ? colors.disabledBg : colors.primaryBg,
          color: verifying ? colors.disabledText : colors.primaryText,
        }}
      >
        {verifying ? <Loader2 size={15} className="animate-spin" /> : null}
        {verifying ? submittingLabel : submitLabel}
      </button>
    </div>
  );
};

export default OtpVerifyBox;
