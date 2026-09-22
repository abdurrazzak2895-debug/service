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
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const localizedEmpty = { bn: "", en: "" };

const emptySetting = {
  status: "active",
  title: { bn: "প্রধান\nস্পনসরশিপ", en: "PRINCIPAL\nSPONSORSHIP" },
  sponsors: [],
  sectionBg: "#226f2d",
  titleColor: "#ffffff",
  sectionPaddingY: "20px",
  contentMaxWidth: "1250px",
  sponsorImageHeight: "105px",
};

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

const AffiliateSponsorshipSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-sponsorship-settings");
      setForm({ ...emptySetting, ...(res.data?.data || {}) });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load setting");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const setTitle = (lang, value) => {
    setForm((prev) => ({
      ...prev,
      title: { ...(prev.title || localizedEmpty), [lang]: value },
    }));
  };

  const updateSponsor = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.sponsors || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, sponsors: list };
    });
  };

  const updateSponsorImage = (index, file) => {
    setForm((prev) => {
      const list = [...(prev.sponsors || [])];
      list[index] = {
        ...list[index],
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : "",
      };
      return { ...prev, sponsors: list };
    });
  };

  const addSponsor = () => {
    setForm((prev) => ({
      ...prev,
      sponsors: [
        ...(prev.sponsors || []),
        {
          localId: makeLocal(),
          name: "",
          image: "",
          imageFile: null,
          imagePreview: "",
          order: prev.sponsors?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const removeSponsor = (index) => {
    setForm((prev) => ({
      ...prev,
      sponsors: (prev.sponsors || []).filter((_, i) => i !== index),
    }));
  };

  const cleanSponsors = (sponsors = []) =>
    sponsors.map(({ localId, imageFile, imagePreview, imageUrl, ...rest }) => ({
      name: rest.name || "",
      image: rest.image || "",
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const fd = new FormData();

      fd.append("status", form.status);
      fd.append("title", JSON.stringify(form.title || localizedEmpty));
      fd.append("sectionBg", form.sectionBg || "#226f2d");
      fd.append("titleColor", form.titleColor || "#ffffff");
      fd.append("sectionPaddingY", form.sectionPaddingY || "20px");
      fd.append("contentMaxWidth", form.contentMaxWidth || "1250px");
      fd.append("sponsorImageHeight", form.sponsorImageHeight || "105px");
      fd.append("sponsors", JSON.stringify(cleanSponsors(form.sponsors)));

      form.sponsors?.forEach((item, index) => {
        if (item.imageFile instanceof File) {
          fd.append(`sponsors.${index}.image`, item.imageFile);
        }
      });

      await api.put("/api/affiliate-sponsorship-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Sponsorship setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (parentId) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-sponsorship-settings/remove-image", {
        parentId,
      });
      toast.success("Image removed successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image remove failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!window.confirm("Are you sure you want to reset colors?")) return;

    try {
      setLoading(true);
      await api.patch("/api/affiliate-sponsorship-settings/reset-colors");
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
              Affiliate Sponsorship{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control sponsorship title, sponsor images, layout and colors.
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

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <div className="space-y-6">
          <Section title="Live Preview">
            <SponsorshipPreview form={form} />
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

            <div className="grid gap-5 md:grid-cols-2">
              <ColorInput
                label="Section BG"
                value={form.sectionBg}
                onChange={(v) => setForm((prev) => ({ ...prev, sectionBg: v }))}
              />
              <ColorInput
                label="Title Color"
                value={form.titleColor}
                onChange={(v) => setForm((prev) => ({ ...prev, titleColor: v }))}
              />
            </div>
          </Section>

          <Section title="Title Text">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Bangla Title</label>
                <textarea
                  className={`${inputClass} min-h-[100px] resize-none`}
                  value={form.title?.bn || ""}
                  onChange={(e) => setTitle("bn", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>English Title</label>
                <textarea
                  className={`${inputClass} min-h-[100px] resize-none`}
                  value={form.title?.en || ""}
                  onChange={(e) => setTitle("en", e.target.value)}
                />
              </div>
            </div>
          </Section>

          <Section title="Layout & Status">
            <div className="grid gap-5 md:grid-cols-4">
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-[#050607]" value="active">Active</option>
                  <option className="bg-[#050607]" value="inactive">Inactive</option>
                </select>
              </div>

              <SmallInput
                label="Padding Y"
                value={form.sectionPaddingY}
                onChange={(v) => setForm({ ...form, sectionPaddingY: v })}
              />

              <SmallInput
                label="Content Max Width"
                value={form.contentMaxWidth}
                onChange={(v) => setForm({ ...form, contentMaxWidth: v })}
              />

              <SmallInput
                label="Image Height"
                value={form.sponsorImageHeight}
                onChange={(v) => setForm({ ...form, sponsorImageHeight: v })}
              />
            </div>
          </Section>

          <ListSection title="Sponsors" onAdd={addSponsor}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.sponsors?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <ImageInput
                    label="Sponsor Image"
                    preview={item.imagePreview || item.imageUrl || fileUrl(item.image)}
                    onChange={(file) => updateSponsorImage(index, file)}
                  />

                  <SmallInput
                    label="Sponsor Name"
                    value={item.name}
                    onChange={(v) => updateSponsor(index, "name", v)}
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      value={item.order}
                      onChange={(v) => updateSponsor(index, "order", v)}
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) => updateSponsor(index, "status", v)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {item._id && item.image ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(item._id)}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                        Remove Image
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="button"
                      onClick={() => removeSponsor(index)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Item
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <SponsorshipPreview form={form} small />
          </Section>

          <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/80 p-4 shadow-2xl backdrop-blur">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {loading ? "Saving..." : "Save Sponsorship"}
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
      <option className="bg-[#050607]" value="active">Active</option>
      <option className="bg-[#050607]" value="inactive">Inactive</option>
    </select>
  </div>
);

const ImageInput = ({ label, preview, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
      {preview ? (
        <img src={preview} alt="Preview" className="aspect-video w-full rounded-xl object-contain" />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black/30">
          <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
          <p className="text-sm font-black text-slate-100">Click to upload image</p>
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

const SponsorshipPreview = ({ form, small = false }) => {
  const sponsors = Array.isArray(form.sponsors)
    ? form.sponsors
        .filter((item) => item.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  return (
    <section
      className="w-full rounded-2xl"
      style={{
        backgroundColor: form.sectionBg || "#226f2d",
        paddingTop: form.sectionPaddingY || "20px",
        paddingBottom: form.sectionPaddingY || "20px",
      }}
    >
      <div className="mb-3 flex items-center gap-2 px-4 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Sponsorship Preview
      </div>

      <div
        className={`mx-auto flex w-full flex-col items-center justify-center gap-6 px-4 ${
          small ? "" : "md:flex-row md:gap-10 lg:gap-12"
        }`}
        style={{ maxWidth: form.contentMaxWidth || "1250px" }}
      >
        <div className="text-center md:min-w-[230px]" style={{ color: form.titleColor }}>
          <h2 className="whitespace-pre-line text-[26px] font-bold uppercase leading-[1.55] tracking-[1px] sm:text-[30px]">
            {getText(form.title, "PRINCIPAL\nSPONSORSHIP")}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-7 sm:gap-9 lg:gap-12">
          {sponsors.length ? (
            sponsors.map((item, index) => {
              const img = item.imagePreview || item.imageUrl || fileUrl(item.image);
              if (!img) return null;

              return (
                <img
                  key={item._id || item.localId || index}
                  src={img}
                  alt={item.name || `Sponsor ${index + 1}`}
                  className="w-auto object-contain drop-shadow-xl"
                  style={{ height: form.sponsorImageHeight || "105px" }}
                  draggable={false}
                />
              );
            })
          ) : (
            <div className="rounded-xl bg-white/15 px-6 py-8 text-sm font-bold text-white">
              No sponsors added
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AffiliateSponsorshipSetting;