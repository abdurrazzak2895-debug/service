import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle,
  Eye,
  ImagePlus,
  Loader2,
  PlusCircle,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const localizedEmpty = { bn: "", en: "" };

const emptySetting = {
  status: "active",
  logo: "",

  badgeText: { bn: "ক্রিকেক্স অ্যাফিলিয়েট", en: "Crickex Affiliate" },
  title: {
    bn: "অ্যাফিলিয়েট অ্যাকাউন্ট তৈরি করুন",
    en: "Create Affiliate Account",
  },
  subTitle: {
    bn: "আজই জয়েন করুন এবং লাইফটাইম কমিশন আয়ের সুযোগ নিন।",
    en: "Join today and start earning lifetime commission.",
  },
  commissionText: {
    bn: "৫০% লাইফটাইম কমিশন",
    en: "50% Lifetime Commission",
  },
  formTitle: { bn: "রেজিস্টার করুন", en: "Register" },

  usernameLabel: { bn: "ইউজারনেম", en: "Username" },
  phoneLabel: { bn: "ফোন নম্বর", en: "Phone" },
  emailLabel: { bn: "ইমেইল", en: "Email" },
  passwordLabel: { bn: "পাসওয়ার্ড", en: "Password" },
  confirmPasswordLabel: { bn: "কনফার্ম পাসওয়ার্ড", en: "Confirm Password" },

  submitText: { bn: "রেজিস্টার করুন", en: "Register" },
  submittingText: { bn: "রেজিস্টার হচ্ছে...", en: "Registering..." },
  alreadyText: { bn: "আগেই অ্যাকাউন্ট আছে?", en: "Already have an account?" },
  loginText: { bn: "লগইন", en: "Login" },

  notes: [
    {
      text: { bn: "ফ্রি অ্যাকাউন্ট", en: "Free Account" },
      order: 0,
      status: "active",
    },
    {
      text: { bn: "জিরো ইনভেস্টমেন্ট", en: "Zero Investment" },
      order: 1,
      status: "active",
    },
    {
      text: { bn: "দ্রুত সাপোর্ট", en: "Fast Support" },
      order: 2,
      status: "active",
    },
  ],

  pageBg: "#061532",
  leftCardBg: "rgba(255,255,255,0.05)",
  leftCardBorder: "rgba(255,255,255,0.10)",
  badgeBg: "#ffcc18",
  badgeTextColor: "#061532",
  titleColor: "#ffffff",
  subTitleColor: "rgba(255,255,255,0.75)",
  commissionBg: "#ffcc18",
  commissionTextColor: "#061532",
  noteBg: "#0c2c62",
  noteTextColor: "#ffffff",
  noteIconColor: "#ffcc18",

  formCardBg: "#ffffff",
  formTextColor: "#111111",
  formTitleColor: "#061532",
  labelColor: "#061532",
  inputBg: "#f4f7fb",
  inputBorder: "#d9e2ef",
  inputFocusBorder: "#ffcc18",
  inputIconColor: "#0b66a8",
  submitBg: "#ffcc18",
  submitTextColor: "#061532",
  loginLinkColor: "#0b66a8",
};

const colorFields = [
  ["pageBg", "Page BG"],
  ["leftCardBg", "Left Card BG"],
  ["leftCardBorder", "Left Card Border"],
  ["badgeBg", "Badge BG"],
  ["badgeTextColor", "Badge Text"],
  ["titleColor", "Title Text"],
  ["subTitleColor", "Sub Title Text"],
  ["commissionBg", "Commission BG"],
  ["commissionTextColor", "Commission Text"],
  ["noteBg", "Note BG"],
  ["noteTextColor", "Note Text"],
  ["noteIconColor", "Note Icon"],
  ["formCardBg", "Form Card BG"],
  ["formTextColor", "Form Text"],
  ["formTitleColor", "Form Title"],
  ["labelColor", "Label Text"],
  ["inputBg", "Input BG"],
  ["inputBorder", "Input Border"],
  ["inputFocusBorder", "Input Focus Border"],
  ["inputIconColor", "Input Icon"],
  ["submitBg", "Submit BG"],
  ["submitTextColor", "Submit Text"],
  ["loginLinkColor", "Login Link"],
];

const localizedFields = [
  ["badgeText", "Badge Text"],
  ["title", "Title"],
  ["subTitle", "Sub Title"],
  ["commissionText", "Commission Text"],
  ["formTitle", "Form Title"],
  ["usernameLabel", "Username Label"],
  ["phoneLabel", "Phone Label"],
  ["emailLabel", "Email Label"],
  ["passwordLabel", "Password Label"],
  ["confirmPasswordLabel", "Confirm Password Label"],
  ["submitText", "Submit Text"],
  ["submittingText", "Submitting Text"],
  ["alreadyText", "Already Text"],
  ["loginText", "Login Text"],
];

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const makeLocal = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const AffiliateRegisterSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-register-settings");
      const data = { ...emptySetting, ...(res.data?.data || {}) };
      setForm(data);
      setLogoPreview(data.logoUrl || fileUrl(data.logo));
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

  const setLocalized = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || localizedEmpty), [lang]: value },
    }));
  };

  const updateNote = (index, field, value) => {
    setForm((prev) => {
      const list = [...(prev.notes || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, notes: list };
    });
  };

  const updateNoteText = (index, lang, value) => {
    setForm((prev) => {
      const list = [...(prev.notes || [])];
      list[index] = {
        ...list[index],
        text: { ...(list[index]?.text || localizedEmpty), [lang]: value },
      };
      return { ...prev, notes: list };
    });
  };

  const addNote = () => {
    setForm((prev) => ({
      ...prev,
      notes: [
        ...(prev.notes || []),
        {
          localId: makeLocal(),
          text: { bn: "", en: "" },
          order: prev.notes?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const removeNote = (index) => {
    setForm((prev) => ({
      ...prev,
      notes: (prev.notes || []).filter((_, i) => i !== index),
    }));
  };

  const cleanNotes = (notes = []) =>
    notes.map(({ localId, ...rest }) => ({
      text: rest.text || localizedEmpty,
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const fd = new FormData();

      fd.append("status", form.status);

      localizedFields.forEach(([key]) => {
        fd.append(key, JSON.stringify(form[key] || localizedEmpty));
      });

      colorFields.forEach(([key]) => {
        fd.append(key, form[key] || "");
      });

      fd.append("notes", JSON.stringify(cleanNotes(form.notes)));

      if (logoFile instanceof File) {
        fd.append("logo", logoFile);
      }

      await api.put("/api/affiliate-register-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Affiliate register setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Setting save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove logo?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-register-settings/remove-logo");
      toast.success("Logo removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logo remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!window.confirm("Are you sure you want to reset colors?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-register-settings/reset-colors");
      toast.success("Colors reset successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Color reset failed");
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
              Affiliate Register{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control affiliate register page logo, text, notes and colors from
              admin panel.
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
          <Section title="Live Preview">
            <RegisterPreview form={form} logoPreview={logoPreview} />
          </Section>

          <Section title="Color Control">
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={handleResetColors}
                disabled={loading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Colors
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {colorFields.map(([key, label]) => (
                <ColorInput
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
                />
              ))}
            </div>
          </Section>

          <Section title="Logo & Status">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ImageInput
                  label="Register Logo"
                  preview={logoPreview}
                  onChange={setLogoFile}
                />

                {form.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="mt-3 w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    Remove Logo
                  </button>
                )}
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
            </div>
          </Section>

          <Section title="Register Page Text">
            <div className="grid gap-5 md:grid-cols-2">
              {localizedFields.map(([key, label]) => (
                <LocalizedInput
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(lang, value) => setLocalized(key, lang, value)}
                />
              ))}
            </div>
          </Section>

          <ListSection title="Feature Notes" onAdd={addNote}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.notes?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <LocalizedInput
                    label="Note Text"
                    value={item.text}
                    onChange={(lang, value) =>
                      updateNoteText(index, lang, value)
                    }
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      type="number"
                      value={item.order}
                      onChange={(v) => updateNote(index, "order", v)}
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) => updateNote(index, "status", v)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNote(index)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Note
                  </button>
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <RegisterPreview form={form} logoPreview={logoPreview} small />
          </Section>

          <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/80 p-4 shadow-2xl backdrop-blur">
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
              {loading ? "Saving..." : "Save Setting"}
            </button>
          </div>
        </aside>
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

const ListSection = ({ title, onAdd, children }) => (
  <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
    <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <h2 className="text-xl font-black">{title}</h2>
      <button
        type="button"
        onClick={onAdd}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
      >
        <PlusCircle className="h-4 w-4" />
        Add New
      </button>
    </div>
    {children}
  </section>
);

const Card = ({ children }) => (
  <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-5 shadow-xl transition hover:border-[#3ea0ff]/50">
    <div className="space-y-4">{children}</div>
  </div>
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

const LocalizedInput = ({ label, value = localizedEmpty, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="grid gap-3 md:grid-cols-2">
      <input
        className={inputClass}
        value={value?.bn || ""}
        onChange={(e) => onChange("bn", e.target.value)}
        placeholder="Bangla"
      />
      <input
        className={inputClass}
        value={value?.en || ""}
        onChange={(e) => onChange("en", e.target.value)}
        placeholder="English"
      />
    </div>
  </div>
);

const SmallInput = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      className={inputClass}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const StatusSelect = ({ value, onChange }) => (
  <div>
    <label className={labelClass}>Status</label>
    <select
      value={value || "active"}
      onChange={(e) => onChange(e.target.value)}
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
);

const ImageInput = ({ label, preview, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="aspect-video w-full rounded-xl object-contain"
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black/30">
          <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
          <p className="text-sm font-black text-slate-100">
            Click to upload logo
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

const getText = (obj, fallback = "") => obj?.en || obj?.bn || fallback;

const RegisterPreview = ({ form, logoPreview, small = false }) => {
  const notes = Array.isArray(form.notes)
    ? form.notes.filter((x) => x.status !== "inactive").slice(0, 3)
    : [];

  return (
    <div
      className={`overflow-hidden rounded-2xl p-4 ${small ? "" : "md:p-6"}`}
      style={{ backgroundColor: form.pageBg }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Register Preview
      </div>

      <div className={`grid gap-5 ${small ? "" : "lg:grid-cols-2"}`}>
        <div
          className="rounded-[24px] border p-5"
          style={{
            backgroundColor: form.leftCardBg,
            borderColor: form.leftCardBorder,
          }}
        >
          <span
            className="inline-flex rounded-full px-4 py-2 text-xs font-bold"
            style={{
              backgroundColor: form.badgeBg,
              color: form.badgeTextColor,
            }}
          >
            {getText(form.badgeText, "Crickex Affiliate")}
          </span>

          <h1
            className="mt-5 text-2xl font-black leading-tight"
            style={{ color: form.titleColor }}
          >
            {getText(form.title, "Create Affiliate Account")}
          </h1>

          <p className="mt-3 text-sm" style={{ color: form.subTitleColor }}>
            {getText(
              form.subTitle,
              "Join today and start earning lifetime commission.",
            )}
          </p>

          <div
            className="mt-5 rounded-2xl p-4"
            style={{
              backgroundColor: form.commissionBg,
              color: form.commissionTextColor,
            }}
          >
            <p className="text-2xl font-black">
              {getText(form.commissionText, "50% Lifetime Commission")}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {notes.map((item, index) => (
              <div
                key={item._id || index}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-xs font-bold"
                style={{
                  backgroundColor: form.noteBg,
                  color: form.noteTextColor,
                }}
              >
                <CheckCircle size={16} style={{ color: form.noteIconColor }} />
                {getText(item.text, "Free Account")}
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[24px] p-5 shadow-2xl"
          style={{
            backgroundColor: form.formCardBg,
            color: form.formTextColor,
          }}
        >
          <div className="mb-5 text-center">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="mx-auto h-[42px] object-contain"
              />
            ) : (
              <div className="mx-auto h-[42px] w-[150px] rounded bg-gray-200" />
            )}

            <h2
              className="mt-4 text-2xl font-black"
              style={{ color: form.formTitleColor }}
            >
              {getText(form.formTitle, "Register")}
            </h2>
          </div>

          {[
            getText(form.usernameLabel, "Username"),
            getText(form.phoneLabel, "Phone"),
            getText(form.emailLabel, "Email"),
            getText(form.passwordLabel, "Password"),
          ].map((label) => (
            <div key={label} className="mb-3">
              <label
                className="mb-2 block text-sm font-bold"
                style={{ color: form.labelColor }}
              >
                {label}
              </label>

              <div
                className="h-[46px] rounded-xl border"
                style={{
                  backgroundColor: form.inputBg,
                  borderColor: form.inputBorder,
                }}
              />
            </div>
          ))}

          <button
            type="button"
            className="mt-2 h-[48px] w-full rounded-xl text-base font-black"
            style={{
              backgroundColor: form.submitBg,
              color: form.submitTextColor,
            }}
          >
            {getText(form.submitText, "Register")}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            {getText(form.alreadyText, "Already have an account?")}{" "}
            <span style={{ color: form.loginLinkColor }} className="font-bold">
              {getText(form.loginText, "Login")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateRegisterSetting;
