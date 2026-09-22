import React, { useEffect, useState } from "react";
import {
  Globe2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
  siteNameBn: "",
  siteNameEn: "",
  logoImage: null,
  faviconImage: null,
  status: "active",
};

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const SiteIdentify = () => {
  const [form, setForm] = useState(emptyForm);
  const [siteIdentify, setSiteIdentify] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [logoPreview, setLogoPreview] = useState("");
  const [faviconPreview, setFaviconPreview] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

  const labelClass = "mb-2 block text-sm font-bold text-blue-100";

  const loadSiteIdentify = async () => {
    try {
      setFetching(true);

      const res = await api.get("/api/site-identify");
      const data = res.data?.data || null;

      setSiteIdentify(data);

      if (data) {
        setForm({
          siteNameBn: data?.siteName?.bn || "",
          siteNameEn: data?.siteName?.en || "",
          logoImage: null,
          faviconImage: null,
          status: data?.status || "active",
        });

        setLogoPreview(data?.logoImageUrl || fileUrl(data?.logoImage || ""));
        setFaviconPreview(
          data?.faviconImageUrl || fileUrl(data?.faviconImage || ""),
        );
      } else {
        setForm(emptyForm);
        setLogoPreview("");
        setFaviconPreview("");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load site identify",
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadSiteIdentify();
  }, []);

  useEffect(() => {
    if (form.logoImage instanceof File) {
      const url = URL.createObjectURL(form.logoImage);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (siteIdentify?.logoImageUrl) {
      setLogoPreview(siteIdentify.logoImageUrl);
      return;
    }

    if (siteIdentify?.logoImage) {
      setLogoPreview(fileUrl(siteIdentify.logoImage));
      return;
    }

    setLogoPreview("");
  }, [form.logoImage, siteIdentify]);

  useEffect(() => {
    if (form.faviconImage instanceof File) {
      const url = URL.createObjectURL(form.faviconImage);
      setFaviconPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (siteIdentify?.faviconImageUrl) {
      setFaviconPreview(siteIdentify.faviconImageUrl);
      return;
    }

    if (siteIdentify?.faviconImage) {
      setFaviconPreview(fileUrl(siteIdentify.faviconImage));
      return;
    }

    setFaviconPreview("");
  }, [form.faviconImage, siteIdentify]);

  const resetForm = () => {
    if (siteIdentify) {
      setForm({
        siteNameBn: siteIdentify?.siteName?.bn || "",
        siteNameEn: siteIdentify?.siteName?.en || "",
        logoImage: null,
        faviconImage: null,
        status: siteIdentify?.status || "active",
      });

      setLogoPreview(
        siteIdentify?.logoImageUrl || fileUrl(siteIdentify?.logoImage || ""),
      );
      setFaviconPreview(
        siteIdentify?.faviconImageUrl ||
          fileUrl(siteIdentify?.faviconImage || ""),
      );
    } else {
      setForm(emptyForm);
      setLogoPreview("");
      setFaviconPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.siteNameBn.trim() || !form.siteNameEn.trim()) {
      return toast.error("Site name Bangla and English are required");
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("siteNameBn", form.siteNameBn.trim());
      fd.append("siteNameEn", form.siteNameEn.trim());
      fd.append("status", form.status);

      if (form.logoImage instanceof File) {
        fd.append("logoImage", form.logoImage);
      }

      if (form.faviconImage instanceof File) {
        fd.append("faviconImage", form.faviconImage);
      }

      const res = await api.post("/api/site-identify", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data?.data || null;

      setSiteIdentify(data);
      setForm({
        siteNameBn: data?.siteName?.bn || "",
        siteNameEn: data?.siteName?.en || "",
        logoImage: null,
        faviconImage: null,
        status: data?.status || "active",
      });

      setLogoPreview(data?.logoImageUrl || fileUrl(data?.logoImage || ""));
      setFaviconPreview(
        data?.faviconImageUrl || fileUrl(data?.faviconImage || ""),
      );

      toast.success("Site identify saved successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save site identify",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!siteIdentify) return;

    try {
      setLoading(true);

      const res = await api.patch("/api/site-identify/remove-logo");
      const data = res.data?.data || null;

      setSiteIdentify(data);
      setForm((prev) => ({
        ...prev,
        logoImage: null,
      }));
      setLogoPreview("");

      toast.success("Logo removed successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove logo");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavicon = async () => {
    if (!siteIdentify) return;

    try {
      setLoading(true);

      const res = await api.patch("/api/site-identify/remove-favicon");
      const data = res.data?.data || null;

      setSiteIdentify(data);
      setForm((prev) => ({
        ...prev,
        faviconImage: null,
      }));
      setFaviconPreview("");

      toast.success("Favicon removed successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove favicon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete site identify?");
    if (!ok) return;

    try {
      setLoading(true);

      await api.delete("/api/site-identify");

      setSiteIdentify(null);
      setForm(emptyForm);
      setLogoPreview("");
      setFaviconPreview("");

      toast.success("Site identify deleted successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete site identify",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Globe2 className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Site{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Identify
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Manage site logo, favicon and Bangla/English site name. Only one
              setting will be saved.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Current Status</p>
            <p
              className={`mt-1 text-2xl font-black ${
                siteIdentify?.status === "active"
                  ? "text-emerald-400"
                  : siteIdentify
                    ? "text-red-400"
                    : "text-slate-400"
              }`}
            >
              {siteIdentify ? siteIdentify.status?.toUpperCase() : "EMPTY"}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-black">
                {siteIdentify ? "Update Site Identify" : "Add Site Identify"}
              </h2>
              <p className="text-sm text-slate-400">
                Upload logo/favicon and add site names.
              </p>
            </div>

            <button
              type="button"
              onClick={loadSiteIdentify}
              disabled={fetching}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {fetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Site Name Bangla *</label>
              <input
                className={inputClass}
                value={form.siteNameBn}
                onChange={(e) =>
                  setForm({ ...form, siteNameBn: e.target.value })
                }
                placeholder="সাইটের নাম"
              />
            </div>

            <div>
              <label className={labelClass}>Site Name English *</label>
              <input
                className={inputClass}
                value={form.siteNameEn}
                onChange={(e) =>
                  setForm({ ...form, siteNameEn: e.target.value })
                }
                placeholder="Site Name"
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option className="bg-[#050607]" value="active">
                  Active
                </option>
                <option className="bg-[#050607]" value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetForm}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
              >
                <X className="h-4 w-4" />
                Reset Form
              </button>
            </div>

            <ImageUploadBox
              label="Site Logo Image"
              preview={logoPreview}
              placeholder="Upload logo image"
              onChange={(file) => setForm({ ...form, logoImage: file })}
            />

            <ImageUploadBox
              label="Site Favicon Image"
              preview={faviconPreview}
              placeholder="Upload favicon image"
              small
              onChange={(file) => setForm({ ...form, faviconImage: file })}
            />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {loading ? "Saving..." : "Save Site Identify"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || !siteIdentify}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3.5 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
              Delete Site Identify
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={loading || !logoPreview}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-yellow-300/20 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove Logo
            </button>

            <button
              type="button"
              onClick={handleRemoveFavicon}
              disabled={loading || !faviconPreview}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-yellow-300/20 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove Favicon
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <h2 className="text-xl font-black">Live Preview</h2>
          <p className="mt-1 text-sm text-slate-400">
            Preview site identity before saving.
          </p>

          <div className="mt-5 rounded-2xl border border-[#1A79D3]/20 bg-black/40 p-6 text-center">
            <div className="mx-auto flex min-h-[110px] w-full max-w-[280px] items-center justify-center rounded-xl border border-[#1A79D3]/30 bg-[#06182a] p-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Site Logo"
                  className="max-h-24 w-auto object-contain"
                />
              ) : (
                <ImagePlus className="h-12 w-12 text-slate-500" />
              )}
            </div>

            <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#1A79D3]/30 bg-[#06182a] p-2">
              {faviconPreview ? (
                <img
                  src={faviconPreview}
                  alt="Favicon"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImagePlus className="h-8 w-8 text-slate-500" />
              )}
            </div>

            <h3 className="mt-5 text-xl font-black text-blue-100">
              {form.siteNameEn || "Site Name English"}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {form.siteNameBn || "সাইটের নাম বাংলা"}
            </p>

            <div className="mt-5 flex justify-center gap-2">
              <span
                className={`rounded-lg px-3 py-1 text-xs font-black ${
                  form.status === "active"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {form.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const ImageUploadBox = ({ label, preview, onChange, placeholder, small }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-blue-100">
        {label}
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-5 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className={
              small
                ? "h-20 w-20 rounded-xl object-contain"
                : "h-24 w-full rounded-xl object-contain"
            }
          />
        ) : (
          <>
            <ImagePlus className="mb-3 h-9 w-9 text-[#3ea0ff]" />
            <p className="text-sm font-black text-slate-100">{placeholder}</p>
            <p className="mt-1 text-xs text-slate-500">
              PNG, JPG, WEBP, SVG, ICO
            </p>
          </>
        )}

        <input
          type="file"
          accept="image/*,.ico"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default SiteIdentify;
