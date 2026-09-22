import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { getMyProfile, updateProfile } from "../../features/profile/profileAPI";
import { logout } from "../../features/auth/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [initialData, setInitialData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["affiliate-profile"],
    queryFn: getMyProfile,
  });

  useEffect(() => {
    if (data) {
      const updatedData = {
        userId: data.userId || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",
        password: "",
      };

      setFormData(updatedData);
      setInitialData(updatedData);
    }
  }, [data]);

  const hasChanges = useMemo(() => {
    return (
      formData.firstName !== initialData.firstName ||
      formData.lastName !== initialData.lastName ||
      formData.phone !== initialData.phone ||
      formData.email !== initialData.email ||
      formData.password.trim().length > 0
    );
  }, [formData, initialData]);

  const mutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: (res) => {
      toast.success(res?.message || "Profile updated successfully");

      dispatch(logout());

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 700);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Profile update failed");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      toast.error("Phone is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Enter a valid email address");
      return false;
    }

    if (formData.password.trim() && formData.password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (!hasChanges) {
      toast.info("No changes found");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mutation.isPending) return;
    if (!validateForm()) return;

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
    };

    if (formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    mutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-6 py-4 text-slate-200">
          <Loader2 className="h-6 w-6 animate-spin text-[#1A79D3]" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-3xl font-black text-transparent">
          Profile Settings
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your affiliate account information.
        </p>
      </div>

      <div className="rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.05] p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-4">
          <ShieldCheck className="h-6 w-6 text-[#1A79D3]" />

          <div>
            <h2 className="font-bold text-white">Affiliate Account</h2>

            <p className="text-sm text-slate-300">
              Update your profile information securely. After successful update,
              you will need to login again.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Username
            </label>

            <div className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 opacity-80">
              <User className="h-5 w-5 text-[#1A79D3]" />

              <input
                type="text"
                value={formData.userId}
                disabled
                placeholder="Your username"
                className="w-full cursor-not-allowed bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Phone
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]">
              <Phone className="h-5 w-5 text-[#1A79D3]" />

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter your phone number"
                disabled={mutation.isPending}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              First Name
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]">
              <User className="h-5 w-5 text-[#1A79D3]" />

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                disabled={mutation.isPending}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Last Name
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]">
              <User className="h-5 w-5 text-[#1A79D3]" />

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                disabled={mutation.isPending}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Email
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]">
              <Mail className="h-5 w-5 text-[#1A79D3]" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                disabled={mutation.isPending}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              New Password
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]">
              <Lock className="h-5 w-5 text-[#1A79D3]" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave empty if you do not want to change"
                disabled={mutation.isPending}
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={mutation.isPending}
                className="cursor-pointer text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-3 md:col-span-2">
            <button
              type="submit"
              disabled={mutation.isPending || !hasChanges}
              className="group flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-8 py-3 font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.30)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>

            {!hasChanges && (
              <p className="mt-3 text-sm text-slate-500">
                Change any field to enable save button.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
