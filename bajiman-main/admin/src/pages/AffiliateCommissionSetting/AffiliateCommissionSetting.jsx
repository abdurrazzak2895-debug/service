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

  flowTitle: { bn: "কমিশন ফ্লো", en: "COMMISSION FLOW" },
  tableHeadActivePlayers: { bn: "অ্যাকটিভ প্লেয়ার", en: "ACTIVE PLAYERS" },
  tableHeadPlayerLoss: { bn: "প্লেয়ার লস", en: "PLAYER LOSS" },
  tableHeadCommission: { bn: "কমিশন ৫০%", en: "COMMISSION 50%" },

  flowItems: [],
  tableRows: [],

  sectionBg: "transparent",
  cardBg: "#edf5fa",
  titleColor: "#192075",
  flowTextColor: "#303030",
  operatorColor: "#3a3a3a",

  headerGradientFrom: "#1c5d9e",
  headerGradientTo: "#4add13",
  headerTextColor: "#ffffff",
  bottomBarBg: "#4ad022",

  contentMaxWidth: "1425px",
  flowImageSize: "76px",
};

const localizedFields = [
  ["flowTitle", "Flow Title"],
  ["tableHeadActivePlayers", "Table Header Active Players"],
  ["tableHeadPlayerLoss", "Table Header Player Loss"],
  ["tableHeadCommission", "Table Header Commission"],
];

const colorFields = [
  ["sectionBg", "Section BG"],
  ["cardBg", "Card BG"],
  ["titleColor", "Title Color"],
  ["flowTextColor", "Flow Text Color"],
  ["operatorColor", "Operator Color"],
  ["headerGradientFrom", "Header Gradient From"],
  ["headerGradientTo", "Header Gradient To"],
  ["headerTextColor", "Header Text Color"],
  ["bottomBarBg", "Bottom Bar BG"],
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

const AffiliateCommissionSetting = () => {
  const [form, setForm] = useState(emptySetting);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const loadSetting = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/affiliate-commission-settings");
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

  const addFlowItem = () => {
    setForm((prev) => ({
      ...prev,
      flowItems: [
        ...(prev.flowItems || []),
        {
          localId: makeLocal(),
          image: "",
          imageFile: null,
          imagePreview: "",
          text: { bn: "", en: "" },
          operatorAfter: "none",
          order: prev.flowItems?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const updateFlowItem = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.flowItems || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, flowItems: list };
    });
  };

  const updateFlowText = (index, lang, value) => {
    setForm((prev) => {
      const list = [...(prev.flowItems || [])];
      list[index] = {
        ...list[index],
        text: { ...(list[index]?.text || localizedEmpty), [lang]: value },
      };
      return { ...prev, flowItems: list };
    });
  };

  const updateFlowImage = (index, file) => {
    setForm((prev) => {
      const list = [...(prev.flowItems || [])];
      list[index] = {
        ...list[index],
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : "",
      };
      return { ...prev, flowItems: list };
    });
  };

  const removeFlowItem = (index) => {
    setForm((prev) => ({
      ...prev,
      flowItems: (prev.flowItems || []).filter((_, i) => i !== index),
    }));
  };

  const addTableRow = () => {
    setForm((prev) => ({
      ...prev,
      tableRows: [
        ...(prev.tableRows || []),
        {
          localId: makeLocal(),
          activePlayers: { bn: "", en: "" },
          playerLoss: "",
          commission: "",
          rowBg: "#b9efff",
          textColor: "#333333",
          order: prev.tableRows?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const updateTableRow = (index, key, value) => {
    setForm((prev) => {
      const list = [...(prev.tableRows || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, tableRows: list };
    });
  };

  const updateRowActivePlayers = (index, lang, value) => {
    setForm((prev) => {
      const list = [...(prev.tableRows || [])];
      list[index] = {
        ...list[index],
        activePlayers: {
          ...(list[index]?.activePlayers || localizedEmpty),
          [lang]: value,
        },
      };
      return { ...prev, tableRows: list };
    });
  };

  const removeTableRow = (index) => {
    setForm((prev) => ({
      ...prev,
      tableRows: (prev.tableRows || []).filter((_, i) => i !== index),
    }));
  };

  const cleanFlowItems = (items = []) =>
    items.map(({ localId, imageFile, imagePreview, imageUrl, ...rest }) => ({
      image: rest.image || "",
      text: rest.text || localizedEmpty,
      operatorAfter: ["-", "="].includes(rest.operatorAfter)
        ? rest.operatorAfter
        : "none",
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const cleanTableRows = (rows = []) =>
    rows.map(({ localId, ...rest }) => ({
      activePlayers: rest.activePlayers || localizedEmpty,
      playerLoss: rest.playerLoss || "",
      commission: rest.commission || "",
      rowBg: rest.rowBg || "#b9efff",
      textColor: rest.textColor || "#333333",
      order: Number(rest.order || 0),
      status: rest.status === "inactive" ? "inactive" : "active",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const fd = new FormData();

      fd.append("status", form.status);
      fd.append("contentMaxWidth", form.contentMaxWidth || "1425px");
      fd.append("flowImageSize", form.flowImageSize || "76px");

      localizedFields.forEach(([key]) => {
        fd.append(key, JSON.stringify(form[key] || localizedEmpty));
      });

      colorFields.forEach(([key]) => {
        fd.append(key, form[key] || "");
      });

      fd.append("flowItems", JSON.stringify(cleanFlowItems(form.flowItems)));
      fd.append("tableRows", JSON.stringify(cleanTableRows(form.tableRows)));

      form.flowItems?.forEach((item, index) => {
        if (item.imageFile instanceof File) {
          fd.append(`flowItems.${index}.image`, item.imageFile);
        }
      });

      await api.put("/api/affiliate-commission-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Commission setting saved successfully");
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
      await api.patch("/api/affiliate-commission-settings/remove-image", {
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
      await api.patch("/api/affiliate-commission-settings/reset-colors");
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
              Affiliate Commission{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control commission flow, icons, table rows, colors and layout.
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
            <CommissionPreview form={form} />
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

          <Section title="Title & Table Header Text">
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

          <Section title="Layout & Status">
            <div className="grid gap-5 md:grid-cols-3">
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
                label="Flow Image Size"
                value={form.flowImageSize}
                onChange={(v) => setForm({ ...form, flowImageSize: v })}
              />
            </div>
          </Section>

          <ListSection title="Commission Flow Items" onAdd={addFlowItem}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.flowItems?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <ImageInput
                    label="Flow Image"
                    preview={
                      item.imagePreview || item.imageUrl || fileUrl(item.image)
                    }
                    onChange={(file) => updateFlowImage(index, file)}
                  />

                  <LocalizedTextarea
                    label="Flow Text"
                    value={item.text}
                    onChange={(lang, value) =>
                      updateFlowText(index, lang, value)
                    }
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      value={item.order}
                      onChange={(v) => updateFlowItem(index, "order", v)}
                    />

                    <div>
                      <label className={labelClass}>Operator After</label>
                      <select
                        value={item.operatorAfter || "none"}
                        onChange={(e) =>
                          updateFlowItem(index, "operatorAfter", e.target.value)
                        }
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option className="bg-[#050607]" value="none">
                          None
                        </option>
                        <option className="bg-[#050607]" value="-">
                          -
                        </option>
                        <option className="bg-[#050607]" value="=">
                          =
                        </option>
                      </select>
                    </div>
                  </div>

                  <StatusSelect
                    value={item.status}
                    onChange={(v) => updateFlowItem(index, "status", v)}
                  />

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
                      onClick={() => removeFlowItem(index)}
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

          <ListSection title="Commission Table Rows" onAdd={addTableRow}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.tableRows?.map((row, index) => (
                <Card key={row._id || row.localId || index}>
                  <LocalizedInput
                    label="Active Players"
                    value={row.activePlayers}
                    onChange={(lang, value) =>
                      updateRowActivePlayers(index, lang, value)
                    }
                  />

                  <SmallInput
                    label="Player Loss"
                    value={row.playerLoss}
                    onChange={(v) => updateTableRow(index, "playerLoss", v)}
                  />

                  <SmallInput
                    label="Commission"
                    value={row.commission}
                    onChange={(v) => updateTableRow(index, "commission", v)}
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <ColorInput
                      label="Row BG"
                      value={row.rowBg}
                      onChange={(v) => updateTableRow(index, "rowBg", v)}
                    />

                    <ColorInput
                      label="Text Color"
                      value={row.textColor}
                      onChange={(v) => updateTableRow(index, "textColor", v)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      value={row.order}
                      onChange={(v) => updateTableRow(index, "order", v)}
                    />

                    <StatusSelect
                      value={row.status}
                      onChange={(v) => updateTableRow(index, "status", v)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTableRow(index)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Row
                  </button>
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <CommissionPreview form={form} small />
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
              {loading ? "Saving..." : "Save Commission"}
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

const CommissionPreview = ({ form, small = false }) => {
  const flowItems = Array.isArray(form.flowItems)
    ? form.flowItems
        .filter((item) => item.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  const tableRows = Array.isArray(form.tableRows)
    ? form.tableRows
        .filter((item) => item.status !== "inactive")
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    : [];

  return (
    <section
      className="w-full rounded-2xl px-4 py-6"
      style={{ backgroundColor: form.sectionBg || "transparent" }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
        <Eye className="h-4 w-4" />
        Commission Preview
      </div>

      <div
        className="mx-auto w-full rounded-md px-5 py-8 shadow-lg"
        style={{
          maxWidth: form.contentMaxWidth || "1425px",
          backgroundColor: form.cardBg || "#edf5fa",
        }}
      >
        <h2
          className="mb-8 text-center text-[28px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-[32px]"
          style={{ color: form.titleColor }}
        >
          {getText(form.flowTitle, "COMMISSION FLOW")}
        </h2>

        <div
          className={`flex flex-col items-center justify-center gap-8 ${small ? "" : "lg:flex-row lg:gap-5 xl:gap-8"}`}
        >
          {flowItems.length ? (
            flowItems.map((item, index) => {
              const img =
                item.imagePreview || item.imageUrl || fileUrl(item.image);

              return (
                <React.Fragment key={item._id || item.localId || index}>
                  <div className="flex min-w-[120px] flex-col items-center text-center">
                    {img && (
                      <img
                        src={img}
                        alt={`Commission Flow ${index + 1}`}
                        className="mb-4 rounded-lg object-contain shadow-[0_3px_14px_rgba(0,0,0,0.22)]"
                        style={{
                          height: form.flowImageSize || "76px",
                          width: form.flowImageSize || "76px",
                        }}
                        draggable={false}
                      />
                    )}

                    <p
                      className="whitespace-pre-line text-[16px] font-extrabold uppercase leading-[1.45] sm:text-[18px]"
                      style={{ color: form.flowTextColor }}
                    >
                      {getText(item.text, "FLOW ITEM")}
                    </p>
                  </div>

                  {item.operatorAfter !== "none" && (
                    <span
                      className={`${small ? "hidden" : "hidden lg:block"} text-[34px] font-extrabold`}
                      style={{ color: form.operatorColor }}
                    >
                      {item.operatorAfter}
                    </span>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <div className="rounded-xl bg-black/10 px-6 py-8 text-sm font-bold text-slate-600">
              No flow item added
            </div>
          )}
        </div>
      </div>

      <div
        className="mx-auto mt-10 w-full rounded-md px-5 py-8 shadow-lg"
        style={{
          maxWidth: form.contentMaxWidth || "1425px",
          backgroundColor: form.cardBg || "#edf5fa",
        }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            getText(form.tableHeadActivePlayers, "ACTIVE PLAYERS"),
            getText(form.tableHeadPlayerLoss, "PLAYER LOSS"),
            getText(form.tableHeadCommission, "COMMISSION 50%"),
          ].map((head) => (
            <div
              key={head}
              className="rounded-full px-6 py-3 text-center text-[17px] font-extrabold uppercase md:text-left"
              style={{
                backgroundImage: `linear-gradient(to right, ${form.headerGradientFrom}, ${form.headerGradientTo})`,
                color: form.headerTextColor,
              }}
            >
              {head}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {tableRows.length ? (
            tableRows.map((row, index) => (
              <div
                key={row._id || row.localId || index}
                className="grid grid-cols-1 overflow-hidden rounded-full px-6 py-3 text-center text-[16px] font-bold md:grid-cols-3 md:text-left"
                style={{
                  backgroundColor: row.rowBg || "#b9efff",
                  color: row.textColor || "#333333",
                }}
              >
                <span>{getText(row.activePlayers, "5 to 20")}</span>
                <span>{row.playerLoss}</span>
                <span>{row.commission}</span>
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-black/10 px-6 py-8 text-center text-sm font-bold text-slate-600">
              No table row added
            </div>
          )}
        </div>

        <div
          className="mt-4 h-4 w-full rounded-full"
          style={{ backgroundColor: form.bottomBarBg || "#4ad022" }}
        />
      </div>
    </section>
  );
};

export default AffiliateCommissionSetting;
