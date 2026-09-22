import { useEffect, useState } from "react";
import api from "../api/axios";

const defaultSetting = {
  registerEnabled: true,
  forgotPasswordEnabled: true,
  withdrawEnabled: true,
};

// Admin controls which flows require OTP (Register / Forgot Password /
// Withdraw e-wallet). Defaults to "enabled" on error so a failed fetch
// never accidentally disables a security step.
const useOtpSetting = () => {
  const [setting, setSetting] = useState(defaultSetting);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/api/otp-setting/public")
      .then(({ data }) => {
        if (cancelled) return;
        setSetting({ ...defaultSetting, ...(data?.data || {}) });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...setting, loaded };
};

export default useOtpSetting;
