import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultForm = {
  status: "active",
  logo: "",
  logoUrl: "",
  sliderImages: [],

  overlayBg: "rgba(0,0,0,0.45)",
  modalBg: "#ffffff",
  headerBg: "#0865a9",
  headerText: "#ffffff",

  labelText: "#222222",
  inputBg: "#eeeeee",
  inputText: "#111111",
  inputBorder: "#d7d7d7",
  placeholderText: "#8c98a3",

  helperText: "#758494",
  helperIcon: "#8d969b",

  buttonBg: "#0865a9",
  buttonText: "#ffffff",
  buttonDisabledBg: "#a6a6a6",

  linkText: "#0069b4",
  footerText: "#8d969b",

  sliderDotActive: "#0865a9",
  sliderDotInactive: "#cfd5da",
  bannerBg: "#0b66a8",

  dropdownBg: "#ffffff",
  dropdownText: "#111111",
  dropdownBorder: "#dddddd",
  dropdownHoverBg: "#f5f5f5",
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const makeLocalId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const RegisterModalSetting = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/register-modal-settings");
      const data = { ...defaultForm, ...(res.data?.data || {}) };

      setForm({
        ...data,
        sliderImages: Array.isArray(data.sliderImages)
          ? data.sliderImages.map((item) => ({
              ...item,
              localId: item._id || makeLocalId(),
              imageFile: null,
              imagePreview: item.imageUrl || "",
            }))
          : [],
      });

      setLogoPreview(data.logoUrl || "");
      setLogoFile(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load setting");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  useEffect(() => {
    if (logoFile instanceof File) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSlider = () => {
    setForm((prev) => ({
      ...prev,
      sliderImages: [
        ...(prev.sliderImages || []),
        {
          localId: makeLocalId(),
          image: "",
          imageUrl: "",
          imagePreview: "",
          imageFile: null,
          order: prev.sliderImages?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const updateSlider = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.sliderImages || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, sliderImages: list };
    });
  };

  const updateSliderImage = (index, file) => {
    setForm((prev) => {
      const list = [...(prev.sliderImages || [])];

      if (file instanceof File) {
        list[index] = {
          ...list[index],
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
        };
      }

      return { ...prev, sliderImages: list };
    });
  };

  const removeSliderLocal = (index) => {
    setForm((prev) => ({
      ...prev,
      sliderImages: (prev.sliderImages || []).filter((_, i) => i !== index),
    }));
  };

  const removeSliderServer = async (id) => {
    const ok = window.confirm("Are you sure you want to remove this slider?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.delete(`/api/register-modal-settings/slider/${id}`);
      toast.success("Slider image removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Remove failed");
    } finally {
      setLoading(false);
    }
  };

  const removeLogo = async () => {
    const ok = window.confirm("Are you sure you want to remove logo?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.delete("/api/register-modal-settings/logo");
      toast.success("Logo removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logo remove failed");
    } finally {
      setLoading(false);
    }
  };

  const cleanSlides = () =>
    (form.sliderImages || []).map(
      ({ imageFile, imagePreview, imageUrl, localId, ...rest }) => ({
        _id: rest?._id,
        image: rest?.image || "",
        order: rest?.order || 0,
        status: rest?.status || "active",
      }),
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      Object.keys(defaultForm).forEach((key) => {
        if (["logo", "logoUrl", "sliderImages"].includes(key)) return;
        fd.append(key, form[key] || "");
      });

      fd.append("sliderImages", JSON.stringify(cleanSlides()));

      if (logoFile instanceof File) {
        fd.append("logo", logoFile);
      }

      form.sliderImages?.forEach((item, index) => {
        if (item.imageFile instanceof File) {
          fd.append(`sliderImages.${index}.image`, item.imageFile);
        }
      });

      await api.put("/api/register-modal-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Register modal setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const ok = window.confirm("Are you sure you want to reset all settings?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.patch("/api/register-modal-settings/reset");
      toast.success("Register modal setting reset successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#3ea0ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Settings className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Register Modal{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control register modal logo, slider images and all colors.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Status</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {form.status?.toUpperCase()}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_430px]"
      >
        <div className="space-y-6">
          <Section title="Logo & Slider">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ImageInput
                  label="Register Logo"
                  preview={logoPreview}
                  onChange={setLogoFile}
                  logo
                />

                {form.logo && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={removeLogo}
                    className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Logo
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-4">
                <button
                  type="button"
                  onClick={addSlider}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Slider Image
                </button>

                <p className="mt-3 text-sm text-slate-400">
                  Add multiple slider images with order and status.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.sliderImages?.map((slide, index) => (
                <div
                  key={slide._id || slide.localId || index}
                  className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-4"
                >
                  <ImageInput
                    label={`Slider Image ${index + 1}`}
                    preview={slide.imagePreview || slide.imageUrl}
                    onChange={(file) => updateSliderImage(index, file)}
                  />

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Order</label>
                      <input
                        type="number"
                        min={0}
                        value={slide.order || ""}
                        onChange={(e) =>
                          updateSlider(index, "order", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Status</label>
                      <select
                        value={slide.status || "active"}
                        onChange={(e) =>
                          updateSlider(index, "status", e.target.value)
                        }
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
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      slide._id
                        ? removeSliderServer(slide._id)
                        : removeSliderLocal(index)
                    }
                    className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Slider
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Main Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setValue("status", e.target.value)}
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

              <ColorInput
                label="Overlay BG"
                value={form.overlayBg}
                onChange={(v) => setValue("overlayBg", v)}
              />
              <ColorInput
                label="Modal BG"
                value={form.modalBg}
                onChange={(v) => setValue("modalBg", v)}
              />
              <ColorInput
                label="Header BG"
                value={form.headerBg}
                onChange={(v) => setValue("headerBg", v)}
              />
              <ColorInput
                label="Header Text"
                value={form.headerText}
                onChange={(v) => setValue("headerText", v)}
              />
              <ColorInput
                label="Banner BG"
                value={form.bannerBg}
                onChange={(v) => setValue("bannerBg", v)}
              />
            </div>
          </Section>

          <Section title="Form Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Label Text"
                value={form.labelText}
                onChange={(v) => setValue("labelText", v)}
              />
              <ColorInput
                label="Input BG"
                value={form.inputBg}
                onChange={(v) => setValue("inputBg", v)}
              />
              <ColorInput
                label="Input Text"
                value={form.inputText}
                onChange={(v) => setValue("inputText", v)}
              />
              <ColorInput
                label="Input Border"
                value={form.inputBorder}
                onChange={(v) => setValue("inputBorder", v)}
              />
              <ColorInput
                label="Placeholder Text"
                value={form.placeholderText}
                onChange={(v) => setValue("placeholderText", v)}
              />
              <ColorInput
                label="Helper Text"
                value={form.helperText}
                onChange={(v) => setValue("helperText", v)}
              />
              <ColorInput
                label="Helper Icon"
                value={form.helperIcon}
                onChange={(v) => setValue("helperIcon", v)}
              />
            </div>
          </Section>

          <Section title="Button, Link & Dropdown Colors">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <ColorInput
                label="Button BG"
                value={form.buttonBg}
                onChange={(v) => setValue("buttonBg", v)}
              />
              <ColorInput
                label="Button Text"
                value={form.buttonText}
                onChange={(v) => setValue("buttonText", v)}
              />
              <ColorInput
                label="Button Disabled BG"
                value={form.buttonDisabledBg}
                onChange={(v) => setValue("buttonDisabledBg", v)}
              />
              <ColorInput
                label="Link Text"
                value={form.linkText}
                onChange={(v) => setValue("linkText", v)}
              />
              <ColorInput
                label="Footer Text"
                value={form.footerText}
                onChange={(v) => setValue("footerText", v)}
              />
              <ColorInput
                label="Slider Dot Active"
                value={form.sliderDotActive}
                onChange={(v) => setValue("sliderDotActive", v)}
              />
              <ColorInput
                label="Slider Dot Inactive"
                value={form.sliderDotInactive}
                onChange={(v) => setValue("sliderDotInactive", v)}
              />
              <ColorInput
                label="Dropdown BG"
                value={form.dropdownBg}
                onChange={(v) => setValue("dropdownBg", v)}
              />
              <ColorInput
                label="Dropdown Text"
                value={form.dropdownText}
                onChange={(v) => setValue("dropdownText", v)}
              />
              <ColorInput
                label="Dropdown Border"
                value={form.dropdownBorder}
                onChange={(v) => setValue("dropdownBorder", v)}
              />
              <ColorInput
                label="Dropdown Hover BG"
                value={form.dropdownHoverBg}
                onChange={(v) => setValue("dropdownHoverBg", v)}
              />
            </div>
          </Section>
        </div>

        <section className="sticky top-6 h-fit rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
            <h2 className="text-xl font-black">Live Preview</h2>
          </div>

          <Preview form={form} logoPreview={logoPreview} />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={loadSetting}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleReset}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {loading ? "Saving..." : "Save Register Setting"}
          </button>
        </section>
      </form>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
    <div className="mb-5 flex items-center gap-3">
      <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
      <h2 className="text-xl font-black">{title}</h2>
    </div>
    {children}
  </section>
);

const ColorInput = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>

    <div className="flex gap-3">
      <input
        type="color"
        value={String(value || "#000000").startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] w-[58px] cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-black/40 p-1"
      />

      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="#000000 or rgba(...)"
      />
    </div>
  </div>
);

const ImageInput = ({ label, preview, onChange, logo = false }) => (
  <div>
    <label className={labelClass}>{label}</label>

    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className={`${logo ? "h-[70px]" : "aspect-[3/1] h-[104px]"} w-full rounded-xl object-contain`}
        />
      ) : (
        <div className="flex h-[120px] w-full flex-col items-center justify-center rounded-xl bg-black/30">
          <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
          <p className="text-sm font-black text-slate-100">
            Click to upload image
          </p>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP, SVG</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="hidden"
      />
    </label>
  </div>
);

const Preview = ({ form, logoPreview }) => {
  const firstSlide =
    form.sliderImages?.find((item) => item.imagePreview || item.imageUrl) ||
    null;

  return (
    <div className="rounded-2xl p-4" style={{ background: form.overlayBg }}>
      <div
        className="mx-auto w-full max-w-[330px] overflow-hidden rounded-lg"
        style={{ backgroundColor: form.modalBg }}
      >
        <div
          className="relative flex h-[50px] items-center justify-center"
          style={{
            backgroundColor: form.headerBg,
            color: form.headerText,
          }}
        >
          <h2 className="text-[18px] font-semibold">Sign up</h2>
          <X className="absolute right-3" size={22} />
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 flex justify-center">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="logo"
                className="h-[28px] object-contain"
              />
            ) : (
              <div className="h-[28px] w-[120px] rounded bg-gray-300" />
            )}
          </div>

          <div
            className="h-[104px] overflow-hidden rounded"
            style={{ backgroundColor: form.bannerBg }}
          >
            {firstSlide ? (
              <img
                src={firstSlide.imagePreview || firstSlide.imageUrl}
                alt="slide"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="mt-3 flex justify-center gap-1.5">
            <span
              className="h-[6px] w-[18px] rounded-full"
              style={{ backgroundColor: form.sliderDotActive }}
            />
            <span
              className="h-[6px] w-[6px] rounded-full"
              style={{ backgroundColor: form.sliderDotInactive }}
            />
          </div>

          <PreviewInput label="Username" placeholder="4-16 char" form={form} />
          <PreviewPassword form={form} />
          <PreviewInput
            label="Phone Number"
            placeholder="Enter your phone number"
            form={form}
          />

          <button
            type="button"
            className="mt-5 h-[44px] w-full rounded-[3px] text-[14px] font-medium"
            style={{
              backgroundColor: form.buttonBg,
              color: form.buttonText,
            }}
          >
            Submit
          </button>

          <div
            className="mt-4 text-center text-sm"
            style={{ color: form.footerText }}
          >
            Already a member ?{" "}
            <span style={{ color: form.linkText }}>Log in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreviewInput = ({ label, placeholder, form }) => (
  <div className="mt-4">
    <label className="mb-2 block text-sm" style={{ color: form.labelText }}>
      {label}
    </label>
    <input
      disabled
      placeholder={placeholder}
      className="h-[42px] w-full rounded border px-3 text-sm outline-none"
      style={{
        backgroundColor: form.inputBg,
        color: form.inputText,
        borderColor: form.inputBorder,
      }}
    />
  </div>
);

const PreviewPassword = ({ form }) => (
  <div className="mt-4">
    <label className="mb-2 block text-sm" style={{ color: form.labelText }}>
      Password
    </label>

    <div
      className="flex h-[42px] items-center rounded border px-3"
      style={{
        backgroundColor: form.inputBg,
        color: form.inputText,
        borderColor: form.inputBorder,
      }}
    >
      <input
        disabled
        placeholder="6-20 characters"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
      />
      <Eye size={16} style={{ color: form.placeholderText }} />
      <EyeOff className="hidden" />
    </div>

    <div className="mt-2 text-xs" style={{ color: form.helperText }}>
      ✓ Between 6~20 characters.
    </div>
  </div>
);

export default RegisterModalSetting;
