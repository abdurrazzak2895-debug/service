import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";

import { adminLogin } from "../../features/auth/authAPI";
import { setCredentials } from "../../features/auth/authSlice";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "../../features/auth/authSelectors";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const loading = useSelector(selectAuthLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const from = location.state?.from?.pathname || "/";

  const autoLoginDoneRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const doLogin = async ({ email, password, silent = false }) => {
    if (!email.trim()) {
      if (!silent) toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      if (!silent) toast.error("Password is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await adminLogin({
        email: email.trim(),
        password,
      });

      if (!data?.token || !data?.admin?.email) {
        toast.error("Login response invalid");
        return;
      }

      dispatch(
        setCredentials({
          admin: data.admin,
          token: data.token,
        }),
      );

      toast.success("Admin login successful");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const autoLogin = searchParams.get("autoLogin");
    const email = searchParams.get("email") || "";
    const password = searchParams.get("password") || "";

    if (
      autoLogin === "1" &&
      email &&
      password &&
      !isAuthenticated &&
      !autoLoginDoneRef.current
    ) {
      autoLoginDoneRef.current = true;

      setFormData({
        email,
        password,
      });

      doLogin({
        email,
        password,
        silent: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await doLogin({
      email: formData.email,
      password: formData.password,
    });
  };

  const buttonLoading = loading || isSubmitting;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[460px]"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.28)] backdrop-blur">
              <ShieldCheck className="h-10 w-10 text-[#1A79D3]" />
            </div>

            <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
              Admin
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Secure access to your control panel
            </p>
          </div>

          <div className="rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] p-6 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-8">
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
              <Sparkles className="h-5 w-5 text-[#1A79D3]" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  Secure Admin Login
                </h2>
                <p className="text-xs text-slate-300">
                  Login once and manage your full admin system.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]">
                  <Mail className="h-5 w-5 text-[#1A79D3]" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@email.com"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]">
                  <Lock className="h-5 w-5 text-[#1A79D3]" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="cursor-pointer text-slate-300 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={buttonLoading}
                className="group relative flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />

                {buttonLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Login to Admin Panel
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-slate-500">
            Admin Secure Control System
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
