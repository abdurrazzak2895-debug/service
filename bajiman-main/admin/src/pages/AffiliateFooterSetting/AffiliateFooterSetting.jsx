import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
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
import { Link } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const localizedEmpty = { bn: "", en: "" };

const emptySetting = {
  status: "active",
  logo: "",

  links: [],
  socials: [],

  followText: { bn: "ফলো করুন:", en: "FOLLOW US:" },
  signupText: {
    bn: "আজই Crickex Affiliate-এ সাইন আপ করুন!",
    en: "Sign up today at Crickex Affiliate!",
  },
  signupButtonText: { bn: "সাইন আপ", en: "SIGN UP" },
  signupButtonPath: "/register",
  copyrightText: {
    bn: "©2026 Crickex. সর্বস্বত্ব সংরক্ষিত।",
    en: "©2026 Crickex. All Rights Reserved.",
  },

  footerBg: "#dff8ff",
  textColor: "#07192c",
  linkHoverColor: "#176bb5",
  buttonBg: "#4bd914",
  buttonHoverBg: "#3ec40d",
  buttonTextColor: "#ffffff",

  contentMaxWidth: "1400px",
  logoWidth: "140px",
  socialIconSize: "48px",
};

const colorFields = [
  ["footerBg", "Footer BG"],
  ["textColor", "Text Color"],
  ["linkHoverColor", "Link Hover Color"],
  ["buttonBg", "Button BG"],
  ["buttonHoverBg", "Button Hover BG"],
  ["buttonTextColor", "Button Text Color"],
];

const localizedFields = [
  ["followText", "Follow Text"],
  ["signupText", "Signup Text"],
  ["signupButtonText", "Signup Button Text"],
  ["copyrightText", "Copyright Text"],
];

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const makeLocal = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const getText = (obj, fallback = "") => obj?.en || obj?.bn || fallback;

const AffiliateFooterSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-footer-settings");
      setForm({ ...emptySetting, ...(res.data?.data || {}) });
      setLogoFile(null);
      setLogoPreview("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load setting");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const setLocalized = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || localizedEmpty), [lang]: value },
    }));
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [
        ...(prev.links || []),
        {
          localId: makeLocal(),
          label: { bn: "", en: "" },
          path: "#",
          order: prev.links?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const updateLink = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.links || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, links: list };
    });
  };

  const updateLinkLabel = (index, lang, value) => {
    setForm((prev) => {
      const list = [...(prev.links || [])];
      list[index] = {
        ...list[index],
        label: { ...(list[index]?.label || localizedEmpty), [lang]: value },
      };
      return { ...prev, links: list };
    });
  };

  const removeLink = (index) => {
    setForm((prev) => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index),
    }));
  };

  const addSocial = () => {
    setForm((prev) => ({
      ...prev,
      socials: [
        ...(prev.socials || []),
        {
          localId: makeLocal(),
          name: "",
          icon: "",
          iconFile: null,
          iconPreview: "",
          url: "#",
          order: prev.socials?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const updateSocial = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.socials || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, socials: list };
    });
  };

  const updateSocialIcon = (index, file) => {
    setForm((prev) => {
      const list = [...(prev.socials || [])];
      list[index] = {
        ...list[index],
        iconFile: file,
        iconPreview: file ? URL.createObjectURL(file) : "",
      };
      return { ...prev, socials: list };
    });
  };

  const removeSocial = (index) => {
    setForm((prev) => ({
      ...prev,
      socials: (prev.socials || []).filter((_, i) => i !== index),
    }));
  };

  const cleanLinks = (links = []) =>
    links.map(({ localId, ...rest }) => ({
      label: rest.label || localizedEmpty,
      path: rest.path || "#",
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const cleanSocials = (socials = []) =>
    socials.map(({ localId, iconFile, iconPreview, iconUrl, ...rest }) => ({
      name: rest.name || "",
      icon: rest.icon || "",
      url: rest.url || "#",
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("status", form.status);
      fd.append("logo", form.logo || "");

      if (logoFile instanceof File) {
        fd.append("logo", logoFile);
      }

      localizedFields.forEach(([key]) => {
        fd.append(key, JSON.stringify(form[key] || localizedEmpty));
      });

      fd.append("links", JSON.stringify(cleanLinks(form.links)));
      fd.append("socials", JSON.stringify(cleanSocials(form.socials)));

      [
        "signupButtonPath",
        "footerBg",
        "textColor",
        "linkHoverColor",
        "buttonBg",
        "buttonHoverBg",
        "buttonTextColor",
        "contentMaxWidth",
        "logoWidth",
        "socialIconSize",
      ].forEach((field) => {
        fd.append(field, form[field] || "");
      });

      form.socials?.forEach((social, index) => {
        if (social.iconFile instanceof File) {
          fd.append(`socials.${index}.icon`, social.iconFile);
        }
      });

      await api.put("/api/affiliate-footer-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Affiliate footer setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Are you sure you want to remove logo?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-footer-settings/remove-logo");
      toast.success("Logo removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logo remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSocialIcon = async (parentId) => {
    if (!window.confirm("Are you sure you want to remove this icon?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-footer-settings/remove-social-icon", {
        parentId,
      });
      toast.success("Social icon removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Icon remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!window.confirm("Are you sure you want to reset colors?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-footer-settings/reset-colors");
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
              Affiliate Footer{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control footer logo, links, socials, signup button, colors and
              layout.
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
            <FooterPreview form={form} logoPreview={logoPreview} />
          </Section>

          <Section title="Logo & Layout">
            <div className="grid gap-5 md:grid-cols-2">
              <ImageInput
                label="Footer Logo"
                preview={logoPreview || form.logoUrl || fileUrl(form.logo)}
                onChange={(file) => {
                  setLogoFile(file);
                  setLogoPreview(file ? URL.createObjectURL(file) : "");
                }}
              />

              <div className="space-y-4">
                <SmallInput
                  label="Content Max Width"
                  value={form.contentMaxWidth}
                  onChange={(v) => setForm({ ...form, contentMaxWidth: v })}
                />

                <SmallInput
                  label="Logo Width"
                  value={form.logoWidth}
                  onChange={(v) => setForm({ ...form, logoWidth: v })}
                />

                <SmallInput
                  label="Social Icon Size"
                  value={form.socialIconSize}
                  onChange={(v) => setForm({ ...form, socialIconSize: v })}
                />

                {form.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    <X className="h-4 w-4" />
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section title="Text & Status">
            <div className="grid gap-5 md:grid-cols-2">
              {localizedFields.map(([key, label]) => (
                <LocalizedInput
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(lang, value) => setLocalized(key, lang, value)}
                />
              ))}

              <SmallInput
                label="Signup Button Path"
                value={form.signupButtonPath}
                onChange={(v) => setForm({ ...form, signupButtonPath: v })}
              />

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

          <ListSection title="Footer Links" onAdd={addLink}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.links?.map((link, index) => (
                <Card key={link._id || link.localId || index}>
                  <LocalizedInput
                    label="Link Label"
                    value={link.label}
                    onChange={(lang, value) =>
                      updateLinkLabel(index, lang, value)
                    }
                  />

                  <SmallInput
                    label="Path"
                    value={link.path}
                    onChange={(v) => updateLink(index, "path", v)}
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      value={link.order}
                      onChange={(v) => updateLink(index, "order", v)}
                    />

                    <StatusSelect
                      value={link.status}
                      onChange={(v) => updateLink(index, "status", v)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Link
                  </button>
                </Card>
              ))}
            </div>
          </ListSection>

          <ListSection title="Social Items" onAdd={addSocial}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.socials?.map((social, index) => (
                <Card key={social._id || social.localId || index}>
                  <ImageInput
                    label="Social Icon"
                    preview={
                      social.iconPreview ||
                      social.iconUrl ||
                      fileUrl(social.icon)
                    }
                    onChange={(file) => updateSocialIcon(index, file)}
                  />

                  <SmallInput
                    label="Name"
                    value={social.name}
                    onChange={(v) => updateSocial(index, "name", v)}
                  />

                  <SmallInput
                    label="URL"
                    value={social.url}
                    onChange={(v) => updateSocial(index, "url", v)}
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      value={social.order}
                      onChange={(v) => updateSocial(index, "order", v)}
                    />

                    <StatusSelect
                      value={social.status}
                      onChange={(v) => updateSocial(index, "status", v)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {social._id && social.icon ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialIcon(social._id)}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                        Remove Icon
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() => removeSocial(index)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Social
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <FooterPreview form={form} logoPreview={logoPreview} />
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
              {loading ? "Saving..." : "Save Footer"}
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
        placeholder="#000000 or transparent"
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

const SmallInput = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input
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

const FooterPreview = ({ form, logoPreview = "" }) => {
  const links = Array.isArray(form.links)
    ? form.links
        .filter((item) => item.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  const socials = Array.isArray(form.socials)
    ? form.socials
        .filter((item) => item.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  const logo = logoPreview || form.logoUrl || fileUrl(form.logo);

  return (
    <footer
      className="w-full rounded-2xl px-4 py-8 sm:px-8 lg:px-12"
      style={{ backgroundColor: form.footerBg || "#dff8ff" }}
    >
      <div
        className="mx-auto grid w-full grid-cols-1 gap-10 md:grid-cols-3"
        style={{ maxWidth: form.contentMaxWidth || "1400px" }}
      >
        <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          {links.slice(0, Math.ceil(links.length / 2)).map((item, index) => (
            <span
              key={item._id || item.localId || index}
              className="text-[17px] font-medium"
              style={{ color: form.textColor || "#07192c" }}
            >
              {getText(item.label, "Footer Link")}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center gap-7 text-center md:items-start md:text-left">
          {links.slice(Math.ceil(links.length / 2)).map((item, index) => (
            <span
              key={item._id || item.localId || index}
              className="text-[17px] font-medium"
              style={{ color: form.textColor || "#07192c" }}
            >
              {getText(item.label, "Footer Link")}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center md:items-start">
          <h3
            className="mb-5 text-[18px] font-semibold uppercase"
            style={{ color: form.textColor || "#07192c" }}
          >
            {getText(form.followText, "FOLLOW US:")}
          </h3>

          <div className="mb-8 flex flex-wrap items-center gap-5">
            {socials.map((item, index) => {
              const icon =
                item.iconPreview || item.iconUrl || fileUrl(item.icon);

              return (
                <span key={item._id || item.localId || index}>
                  {icon && (
                    <img
                      src={icon}
                      alt={item.name || "Social"}
                      className="object-contain"
                      style={{
                        width: form.socialIconSize || "48px",
                        height: form.socialIconSize || "48px",
                      }}
                      draggable={false}
                    />
                  )}
                </span>
              );
            })}
          </div>

          <p
            className="mb-8 text-center text-[17px] font-medium md:text-left"
            style={{ color: form.textColor || "#07192c" }}
          >
            {getText(form.signupText, "Sign up today at Crickex Affiliate!")}
          </p>

          <span
            className="w-[180px] rounded-md py-3 text-center text-[16px] font-bold uppercase"
            style={{
              backgroundColor: form.buttonBg || "#4bd914",
              color: form.buttonTextColor || "#ffffff",
            }}
          >
            {getText(form.signupButtonText, "SIGN UP")}
          </span>
        </div>
      </div>

      <div
        className="mx-auto mt-12 grid w-full grid-cols-1 items-end gap-5 md:grid-cols-3"
        style={{ maxWidth: form.contentMaxWidth || "1400px" }}
      >
        <div className="flex justify-center md:justify-start">
          {logo && (
            <img
              src={logo}
              alt="Footer Logo"
              className="h-auto object-contain"
              style={{ width: form.logoWidth || "140px" }}
              draggable={false}
            />
          )}
        </div>

        <p
          className="text-center text-[16px] font-medium md:col-span-1"
          style={{ color: form.textColor || "#07192c" }}
        >
          {getText(form.copyrightText, "©2026 Crickex. All Rights Reserved.")}
        </p>

        <div />
      </div>
    </footer>
  );
};

export default AffiliateFooterSetting;
