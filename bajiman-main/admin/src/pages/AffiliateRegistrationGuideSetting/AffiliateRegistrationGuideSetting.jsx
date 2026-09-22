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
  sectionTitle: { bn: "রেজিস্ট্রেশন গাইড", en: "REGISTRATION GUIDE" },
  cards: [],

  sectionBg: "transparent",
  titleBoxBg: "#e8f8ff",
  titleColor: "#17227a",
  cardBg: "#dff8ff",
  iconCircleBg: "#ffffff",
  cardTitleColor: "#002d68",
  cardDescColor: "#5f607e",

  contentMaxWidth: "1425px",
  iconCircleSize: "150px",
};

const colorFields = [
  ["sectionBg", "Section BG"],
  ["titleBoxBg", "Title Box BG"],
  ["titleColor", "Title Color"],
  ["cardBg", "Card BG"],
  ["iconCircleBg", "Icon Circle BG"],
  ["cardTitleColor", "Card Title Color"],
  ["cardDescColor", "Card Description Color"],
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

const AffiliateRegistrationGuideSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-registration-guide-settings");
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

  const setLocalized = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || localizedEmpty), [lang]: value },
    }));
  };

  const addCard = () => {
    setForm((prev) => ({
      ...prev,
      cards: [
        ...(prev.cards || []),
        {
          localId: makeLocal(),
          icon: "",
          iconFile: null,
          iconPreview: "",
          title: { bn: "", en: "" },
          description: { bn: "", en: "" },
          order: prev.cards?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const updateCard = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.cards || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, cards: list };
    });
  };

  const updateCardLocalized = (index, field, lang, value) => {
    setForm((prev) => {
      const list = [...(prev.cards || [])];
      list[index] = {
        ...list[index],
        [field]: { ...(list[index]?.[field] || localizedEmpty), [lang]: value },
      };
      return { ...prev, cards: list };
    });
  };

  const updateCardIcon = (index, file) => {
    setForm((prev) => {
      const list = [...(prev.cards || [])];
      list[index] = {
        ...list[index],
        iconFile: file,
        iconPreview: file ? URL.createObjectURL(file) : "",
      };
      return { ...prev, cards: list };
    });
  };

  const removeCard = (index) => {
    setForm((prev) => ({
      ...prev,
      cards: (prev.cards || []).filter((_, i) => i !== index),
    }));
  };

  const cleanCards = (cards = []) =>
    cards.map(({ localId, iconFile, iconPreview, iconUrl, ...rest }) => ({
      icon: rest.icon || "",
      title: rest.title || localizedEmpty,
      description: rest.description || localizedEmpty,
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("status", form.status);
      fd.append(
        "sectionTitle",
        JSON.stringify(form.sectionTitle || localizedEmpty),
      );
      fd.append("cards", JSON.stringify(cleanCards(form.cards)));

      fd.append("sectionBg", form.sectionBg || "transparent");
      fd.append("titleBoxBg", form.titleBoxBg || "#e8f8ff");
      fd.append("titleColor", form.titleColor || "#17227a");
      fd.append("cardBg", form.cardBg || "#dff8ff");
      fd.append("iconCircleBg", form.iconCircleBg || "#ffffff");
      fd.append("cardTitleColor", form.cardTitleColor || "#002d68");
      fd.append("cardDescColor", form.cardDescColor || "#5f607e");

      fd.append("contentMaxWidth", form.contentMaxWidth || "1425px");
      fd.append("iconCircleSize", form.iconCircleSize || "150px");

      form.cards?.forEach((card, index) => {
        if (card.iconFile instanceof File) {
          fd.append(`cards.${index}.icon`, card.iconFile);
        }
      });

      await api.put("/api/affiliate-registration-guide-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration guide setting saved successfully");
      await loadSetting();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIcon = async (parentId) => {
    if (!window.confirm("Are you sure you want to remove this icon?")) return;

    try {
      setLoading(true);
      await api.patch(
        "/api/affiliate-registration-guide-settings/remove-icon",
        {
          parentId,
        },
      );
      toast.success("Icon removed successfully");
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
      await api.patch(
        "/api/affiliate-registration-guide-settings/reset-colors",
      );
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
              Registration Guide{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control guide cards, icons, section title, colors and layout.
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
            <RegistrationGuidePreview form={form} />
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

          <Section title="Title, Layout & Status">
            <div className="grid gap-5 md:grid-cols-2">
              <LocalizedInput
                label="Section Title"
                value={form.sectionTitle}
                onChange={(lang, value) =>
                  setLocalized("sectionTitle", lang, value)
                }
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

              <SmallInput
                label="Content Max Width"
                value={form.contentMaxWidth}
                onChange={(v) => setForm({ ...form, contentMaxWidth: v })}
              />

              <SmallInput
                label="Icon Circle Size"
                value={form.iconCircleSize}
                onChange={(v) => setForm({ ...form, iconCircleSize: v })}
              />
            </div>
          </Section>

          <ListSection title="Registration Guide Cards" onAdd={addCard}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.cards?.map((card, index) => (
                <Card key={card._id || card.localId || index}>
                  <ImageInput
                    label="Card Icon"
                    preview={
                      card.iconPreview || card.iconUrl || fileUrl(card.icon)
                    }
                    onChange={(file) => updateCardIcon(index, file)}
                  />

                  <LocalizedInput
                    label="Card Title"
                    value={card.title}
                    onChange={(lang, value) =>
                      updateCardLocalized(index, "title", lang, value)
                    }
                  />

                  <LocalizedTextarea
                    label="Card Description"
                    value={card.description}
                    onChange={(lang, value) =>
                      updateCardLocalized(index, "description", lang, value)
                    }
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      value={card.order}
                      onChange={(v) => updateCard(index, "order", v)}
                    />

                    <StatusSelect
                      value={card.status}
                      onChange={(v) => updateCard(index, "status", v)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {card._id && card.icon ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveIcon(card._id)}
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
                      onClick={() => removeCard(index)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Card
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <RegistrationGuidePreview form={form} small />
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
              {loading ? "Saving..." : "Save Guide"}
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

const LocalizedTextarea = ({ label, value = localizedEmpty, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="grid gap-3 md:grid-cols-2">
      <textarea
        className={`${inputClass} min-h-[90px] resize-none`}
        value={value?.bn || ""}
        onChange={(e) => onChange("bn", e.target.value)}
        placeholder="Bangla"
      />
      <textarea
        className={`${inputClass} min-h-[90px] resize-none`}
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
            Click to upload icon
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

const RegistrationGuidePreview = ({ form, small = false }) => {
  const cards = Array.isArray(form.cards)
    ? form.cards
        .filter((card) => card.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  return (
    <section
      className="w-full rounded-2xl px-4 py-6"
      style={{ backgroundColor: form.sectionBg || "transparent" }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Registration Guide Preview
      </div>

      <div
        className="mx-auto w-full"
        style={{ maxWidth: form.contentMaxWidth }}
      >
        <div
          className="mb-24 rounded-md px-4 py-5 text-center shadow-lg"
          style={{ backgroundColor: form.titleBoxBg || "#e8f8ff" }}
        >
          <h2
            className="text-[28px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-[32px]"
            style={{ color: form.titleColor || "#17227a" }}
          >
            {getText(form.sectionTitle, "REGISTRATION GUIDE")}
          </h2>
        </div>

        <div
          className={`grid grid-cols-1 gap-24 ${
            small ? "" : "md:grid-cols-3 md:gap-20"
          }`}
        >
          {cards.length ? (
            cards.map((card, index) => {
              const icon =
                card.iconPreview || card.iconUrl || fileUrl(card.icon);

              return (
                <div
                  key={card._id || card.localId || index}
                  className="relative flex min-h-[335px] flex-col rounded-md px-7 pb-10 pt-24 shadow-lg"
                  style={{ backgroundColor: form.cardBg || "#dff8ff" }}
                >
                  <div
                    className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full p-3 shadow-lg"
                    style={{
                      backgroundColor: form.iconCircleBg || "#ffffff",
                      width: form.iconCircleSize || "150px",
                      height: form.iconCircleSize || "150px",
                    }}
                  >
                    {icon && (
                      <img
                        src={icon}
                        alt={getText(card.title, "Guide")}
                        className="h-full w-full object-contain"
                        draggable={false}
                      />
                    )}
                  </div>

                  <h3
                    className="mb-12 text-center text-[26px] font-semibold"
                    style={{ color: form.cardTitleColor || "#002d68" }}
                  >
                    {getText(card.title, "Guide Title")}
                  </h3>

                  <ul className="mx-auto w-full max-w-[320px] list-disc pl-5">
                    <li
                      className="text-[17px] font-semibold leading-[1.45]"
                      style={{ color: form.cardDescColor || "#5f607e" }}
                    >
                      {getText(card.description, "Guide description")}
                    </li>
                  </ul>
                </div>
              );
            })
          ) : (
            <div className="col-span-full rounded-xl bg-black/10 px-6 py-8 text-center text-sm font-bold text-slate-600">
              No guide card added
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AffiliateRegistrationGuideSetting;
