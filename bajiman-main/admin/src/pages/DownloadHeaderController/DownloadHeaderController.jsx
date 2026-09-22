// src/pages/DownloadHeaderController/DownloadHeaderController.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const resolveUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = String(
    import.meta.env.VITE_API_URL || api.defaults.baseURL || "",
  ).replace(/\/+$/, "");

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const fetchDownloadHeader = async () => {
  const { data } = await api.get("/api/download-header");
  return data;
};

const updateDownloadHeader = async (formData) => {
  const { data } = await api.put("/api/download-header", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

const DownloadHeaderController = () => {
  const qc = useQueryClient();

  const [iconPreview, setIconPreview] = useState("");
  const [apkName, setApkName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-download-header"],
    queryFn: fetchDownloadHeader,
    staleTime: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      isActive: true,
      appNameBn: "",
      appNameEn: "",
      titleBn: "",
      titleEn: "",
      btnTextBn: "ডাউনলোড",
      btnTextEn: "Download",
      icon: null,
      apk: null,
    },
  });

  useEffect(() => {
    if (!data) return;

    reset({
      isActive: data.isActive ?? true,
      appNameBn: data.appNameBn || "BAJIMAN",
      appNameEn: data.appNameEn || "BAJIMAN",
      titleBn: data.titleBn || "",
      titleEn: data.titleEn || "",
      btnTextBn: data.btnTextBn || "ডাউনলোড",
      btnTextEn: data.btnTextEn || "Download",
      icon: null,
      apk: null,
    });

    setIconPreview(data.iconUrl ? resolveUrl(data.iconUrl) : "");
    setApkName(data.apkUrl ? "APK uploaded" : "");
  }, [data, reset]);

  const iconWatch = watch("icon");
  const apkWatch = watch("apk");

  useEffect(() => {
    const file = iconWatch?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setIconPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [iconWatch]);

  useEffect(() => {
    const file = apkWatch?.[0];
    if (file) {
      setApkName(file.name);
    }
  }, [apkWatch]);

  const mutation = useMutation({
    mutationFn: updateDownloadHeader,
    onSuccess: (res) => {
      toast.success(res?.message || "Download Header Updated!");
      qc.invalidateQueries({ queryKey: ["admin-download-header"] });
      qc.invalidateQueries({ queryKey: ["download-header"] });
    },
    onError: (err) =>
      toast.error(err?.response?.data?.error || "Update failed"),
  });

  const onSubmit = (values) => {
    const fd = new FormData();

    fd.append("isActive", String(values.isActive));
    fd.append("appNameBn", values.appNameBn || "");
    fd.append("appNameEn", values.appNameEn || "");
    fd.append("titleBn", values.titleBn || "");
    fd.append("titleEn", values.titleEn || "");
    fd.append("btnTextBn", values.btnTextBn || "");
    fd.append("btnTextEn", values.btnTextEn || "");

    const icon = values.icon?.[0];
    const apk = values.apk?.[0];

    if (icon) fd.append("icon", icon);
    if (apk) fd.append("apk", apk);

    mutation.mutate(fd);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/20 to-black">
      <div className="w-full max-w-5xl mx-auto rounded-2xl border border-blue-300/20 bg-black/40 p-6 sm:p-8 lg:p-10 shadow-xl shadow-blue-900/20">
        <h2 className="bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl sm:text-3xl font-black text-transparent mb-2 tracking-tight">
          Download Header Controller
        </h2>
        <p className="text-blue-100/80 text-sm mb-8">
          Customize the floating download header (app name, title, button, icon
          &amp; APK)
        </p>

        {isLoading ? (
          <div className="text-[#8fc2f5] text-center py-12 text-lg font-medium">
            Loading download header data...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Active Toggle */}
            <div className="flex items-center gap-3 cursor-pointer">
              <input
                id="isActive"
                type="checkbox"
                className="w-5 h-5 accent-[#63a8ee] rounded cursor-pointer"
                {...register("isActive")}
              />
              <label
                htmlFor="isActive"
                className="text-blue-100 font-semibold cursor-pointer"
              >
                Active (Show Download Header on Client)
              </label>
            </div>

            {/* App Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-100/90 text-sm font-bold mb-2 cursor-pointer">
                  App Name (Bangla)
                </label>
                <input
                  className="w-full bg-black/50 text-white border border-blue-300/25 rounded-xl p-4 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition-all placeholder:text-blue-100/35"
                  placeholder="অ্যাপের নাম (বাংলা)"
                  {...register("appNameBn")}
                />
              </div>
              <div>
                <label className="block text-blue-100/90 text-sm font-bold mb-2 cursor-pointer">
                  App Name (English)
                </label>
                <input
                  className="w-full bg-black/50 text-white border border-blue-300/25 rounded-xl p-4 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition-all placeholder:text-blue-100/35"
                  placeholder="App Name (English)"
                  {...register("appNameEn")}
                />
              </div>
            </div>

            {/* Custom Title (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Custom Title (Bangla) — optional
                </label>
                <input
                  className="w-full bg-black/50 text-white border border-blue-300/25 rounded-xl p-4 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition-all placeholder:text-blue-100/35"
                  placeholder="খালি রাখলে ডিফল্ট টেমপ্লেট ব্যবহার হবে"
                  {...register("titleBn")}
                />
              </div>
              <div>
                <label className="block text-blue-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Custom Title (English) — optional
                </label>
                <input
                  className="w-full bg-black/50 text-white border border-blue-300/25 rounded-xl p-4 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition-all placeholder:text-blue-100/35"
                  placeholder="Leave empty for default template"
                  {...register("titleEn")}
                />
              </div>
            </div>

            {/* Button Texts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-blue-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Button Text (Bangla)
                </label>
                <input
                  className="w-full bg-black/50 text-white border border-blue-300/25 rounded-xl p-4 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition-all placeholder:text-blue-100/35"
                  placeholder="ডাউনলোড"
                  {...register("btnTextBn")}
                />
              </div>
              <div>
                <label className="block text-blue-100/90 text-sm font-bold mb-2 cursor-pointer">
                  Button Text (English)
                </label>
                <input
                  className="w-full bg-black/50 text-white border border-blue-300/25 rounded-xl p-4 outline-none focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25 transition-all placeholder:text-blue-100/35"
                  placeholder="Download"
                  {...register("btnTextEn")}
                />
              </div>
            </div>

            {/* Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              {/* Icon */}
              <div className="space-y-4">
                <label className="block text-blue-100 font-bold text-lg cursor-pointer">
                  App Icon Image
                </label>
                <input
                  type="file"
                  accept="image/*,.ico,.gif"
                  className="block w-full text-sm text-blue-100 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#63a8ee] file:to-[#2f79c9] file:text-white hover:file:from-[#7bb7f1] hover:file:to-[#3b88db] file:cursor-pointer cursor-pointer bg-black/50 border border-blue-300/25 rounded-xl p-4"
                  {...register("icon")}
                />

                {iconPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="bg-black/40 border border-blue-300/20 rounded-xl p-3 shadow-inner">
                      <img
                        src={iconPreview}
                        alt="App Icon Preview"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <div className="text-blue-100/70 text-sm">
                      Recommended: 512×512 px PNG
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-black/40 border border-blue-300/20 p-6 text-center text-blue-100/60">
                    No icon uploaded
                  </div>
                )}
              </div>

              {/* APK */}
              <div className="space-y-4">
                <label className="block text-blue-100 font-bold text-lg cursor-pointer">
                  Upload APK File (.apk)
                </label>
                <input
                  type="file"
                  accept=".apk"
                  className="block w-full text-sm text-blue-100 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#63a8ee] file:to-[#2f79c9] file:text-white hover:file:from-[#7bb7f1] hover:file:to-[#3b88db] file:cursor-pointer cursor-pointer bg-black/50 border border-blue-300/25 rounded-xl p-4"
                  {...register("apk")}
                />

                <div className="mt-3 text-blue-100/70 text-sm">
                  {apkName ? (
                    <span className="font-medium text-[#8fc2f5]">
                      Selected: {apkName}
                    </span>
                  ) : (
                    "No APK file selected"
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="w-full flex items-center justify-center gap-3 py-4 px-10 mt-10 bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] hover:from-[#7bb7f1] hover:to-[#3b88db] rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-700/40 transition-all duration-300 disabled:opacity-60 cursor-pointer border border-blue-300/25"
            >
              {mutation.isPending ? "Saving..." : "Save Download Header"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DownloadHeaderController;
