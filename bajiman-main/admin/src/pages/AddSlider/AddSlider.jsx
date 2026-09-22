import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  ImagePlus,
  Loader2,
  Plus,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Sliders,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const defaultColors = {
  sectionBg: "#0B66A8",
  desktopSectionBg: "#f5f5f5",
  slideBg: "#082056",
  arrowColor: "#9ca3af",
  arrowHoverColor: "#4b5563",
  paginationBg: "#7aa7d9",
  paginationActiveBg: "#2f79c9",
  mobileSkeletonBg: "rgba(255,255,255,0.2)",
  desktopSkeletonBg: "#d1d5db",
  skeletonDotBg: "rgba(122,167,217,0.5)",
  skeletonDotActiveBg: "#7aa7d9",
};

const emptyForm = {
  desktopImage: null,
  mobileImage: null,
  order: "",
  status: "active",

  mode: "link",
  link: "",
  promoImage: null,
  promoTitleBn: "",
  promoTitleEn: "",
  promoDescriptionBn: "",
  promoDescriptionEn: "",

  promoTableEnabled: false,
  promoTableSections: [],

  ...defaultColors,
};

// A section is either a multi-column table (columns.length > 0) or a
// plain list (no columns, one cell per row) — e.g. a deposit bonus's
// "Eligible Tier" table plus a separate "Eligible Games" list.
const emptyPromoTableSection = {
  labelBn: "",
  labelEn: "",
  columns: [],
  rows: [],
};

const colorFields = [
  ["sectionBg", "Mobile Section BG"],
  ["desktopSectionBg", "Desktop Section BG"],
  ["slideBg", "Slide BG"],
  ["arrowColor", "Arrow Color"],
  ["arrowHoverColor", "Arrow Hover Color"],
  ["paginationBg", "Pagination BG"],
  ["paginationActiveBg", "Pagination Active BG"],
  ["mobileSkeletonBg", "Mobile Skeleton BG"],
  ["desktopSkeletonBg", "Desktop Skeleton BG"],
  ["skeletonDotBg", "Skeleton Dot BG"],
  ["skeletonDotActiveBg", "Skeleton Dot Active BG"],
];

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const normalizeSliderToForm = (slider = null) => ({
  desktopImage: null,
  mobileImage: null,
  order: slider?.order ? String(slider.order) : "",
  status: slider?.status || "active",

  mode: slider?.mode === "promo" ? "promo" : "link",
  link: slider?.link || "",
  promoImage: null,
  promoTitleBn: slider?.promoTitle?.bn || "",
  promoTitleEn: slider?.promoTitle?.en || "",
  promoDescriptionBn: slider?.promoDescription?.bn || "",
  promoDescriptionEn: slider?.promoDescription?.en || "",

  promoTableEnabled: Boolean(slider?.promoTable?.enabled),
  promoTableSections: Array.isArray(slider?.promoTable?.sections)
    ? slider.promoTable.sections.map((section) => ({
        labelBn: section?.label?.bn || "",
        labelEn: section?.label?.en || "",
        columns: Array.isArray(section?.columns)
          ? section.columns.map((col) => ({
              bn: col?.bn || "",
              en: col?.en || "",
            }))
          : [],
        rows: Array.isArray(section?.rows)
          ? section.rows.map((row) => ({
              cells: Array.isArray(row?.cells)
                ? row.cells.map((cell) => ({
                    bn: cell?.bn || "",
                    en: cell?.en || "",
                  }))
                : [],
            }))
          : [],
      }))
    : [],

  sectionBg: slider?.sectionBg || defaultColors.sectionBg,
  desktopSectionBg: slider?.desktopSectionBg || defaultColors.desktopSectionBg,
  slideBg: slider?.slideBg || defaultColors.slideBg,
  arrowColor: slider?.arrowColor || defaultColors.arrowColor,
  arrowHoverColor: slider?.arrowHoverColor || defaultColors.arrowHoverColor,
  paginationBg: slider?.paginationBg || defaultColors.paginationBg,
  paginationActiveBg:
    slider?.paginationActiveBg || defaultColors.paginationActiveBg,
  mobileSkeletonBg: slider?.mobileSkeletonBg || defaultColors.mobileSkeletonBg,
  desktopSkeletonBg:
    slider?.desktopSkeletonBg || defaultColors.desktopSkeletonBg,
  skeletonDotBg: slider?.skeletonDotBg || defaultColors.skeletonDotBg,
  skeletonDotActiveBg:
    slider?.skeletonDotActiveBg || defaultColors.skeletonDotActiveBg,
});

const AddSlider = () => {
  const [form, setForm] = useState(emptyForm);
  const [sliders, setSliders] = useState([]);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [promoPreview, setPromoPreview] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSections = (updater) => {
    setForm((prev) => ({
      ...prev,
      promoTableSections: updater(prev.promoTableSections),
    }));
  };

  const mapSection = (sections, sectionIndex, mapper) =>
    sections.map((section, i) => (i === sectionIndex ? mapper(section) : section));

  const addPromoTableSection = () => {
    updateSections((sections) => [
      ...sections,
      { ...emptyPromoTableSection, columns: [], rows: [] },
    ]);
  };

  const removePromoTableSection = (sectionIndex) => {
    updateSections((sections) =>
      sections.filter((_, i) => i !== sectionIndex),
    );
  };

  const setPromoTableSectionLabel = (sectionIndex, key, value) => {
    updateSections((sections) =>
      mapSection(sections, sectionIndex, (section) => ({
        ...section,
        [key]: value,
      })),
    );
  };

  const addPromoTableColumn = (sectionIndex) => {
    updateSections((sections) =>
      mapSection(sections, sectionIndex, (section) => ({
        ...section,
        columns: [...section.columns, { bn: "", en: "" }],
        rows: section.rows.map((row) => ({
          cells: [...row.cells, { bn: "", en: "" }],
        })),
      })),
    );
  };

  const removePromoTableColumn = (sectionIndex, colIndex) => {
    updateSections((sections) =>
      mapSection(sections, sectionIndex, (section) => ({
        ...section,
        columns: section.columns.filter((_, i) => i !== colIndex),
        rows: section.rows.map((row) => ({
          cells: row.cells.filter((_, i) => i !== colIndex),
        })),
      })),
    );
  };

  const setPromoTableColumnValue = (sectionIndex, colIndex, key, value) => {
    updateSections((sections) =>
      mapSection(sections, sectionIndex, (section) => ({
        ...section,
        columns: section.columns.map((col, i) =>
          i === colIndex ? { ...col, [key]: value } : col,
        ),
      })),
    );
  };

  const addPromoTableRow = (sectionIndex) => {
    updateSections((sections) =>
      mapSection(sections, sectionIndex, (section) => {
        const cellCount = Math.max(1, section.columns.length);

        return {
          ...section,
          rows: [
            ...section.rows,
            { cells: Array.from({ length: cellCount }, () => ({ bn: "", en: "" })) },
          ],
        };
      }),
    );
  };

  const removePromoTableRow = (sectionIndex, rowIndex) => {
    updateSections((sections) =>
      mapSection(sections, sectionIndex, (section) => ({
        ...section,
        rows: section.rows.filter((_, i) => i !== rowIndex),
      })),
    );
  };

  const setPromoTableCellValue = (sectionIndex, rowIndex, cellIndex, key, value) => {
    updateSections((sections) =>
      mapSection(sections, sectionIndex, (section) => ({
        ...section,
        rows: section.rows.map((row, i) =>
          i === rowIndex
            ? {
                cells: row.cells.map((cell, j) =>
                  j === cellIndex ? { ...cell, [key]: value } : cell,
                ),
              }
            : row,
        ),
      })),
    );
  };

  const loadSliders = async () => {
    try {
      setListLoading(true);

      const res = await api.get("/api/sliders", {
        params: {
          status: statusFilter,
          limit: 100,
        },
      });

      setSliders(res.data?.data?.sliders || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load sliders");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadSliders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (form.desktopImage instanceof File) {
      const url = URL.createObjectURL(form.desktopImage);
      setDesktopPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editing?.desktopImageUrl) {
      setDesktopPreview(editing.desktopImageUrl);
      return;
    }

    if (editing?.desktopImage) {
      setDesktopPreview(fileUrl(editing.desktopImage));
      return;
    }

    setDesktopPreview("");
  }, [form.desktopImage, editing]);

  useEffect(() => {
    if (form.mobileImage instanceof File) {
      const url = URL.createObjectURL(form.mobileImage);
      setMobilePreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editing?.mobileImageUrl) {
      setMobilePreview(editing.mobileImageUrl);
      return;
    }

    if (editing?.mobileImage) {
      setMobilePreview(fileUrl(editing.mobileImage));
      return;
    }

    setMobilePreview("");
  }, [form.mobileImage, editing]);

  useEffect(() => {
    if (form.promoImage instanceof File) {
      const url = URL.createObjectURL(form.promoImage);
      setPromoPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editing?.promoImageUrl) {
      setPromoPreview(editing.promoImageUrl);
      return;
    }

    if (editing?.promoImage) {
      setPromoPreview(fileUrl(editing.promoImage));
      return;
    }

    setPromoPreview("");
  }, [form.promoImage, editing]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setDesktopPreview("");
    setMobilePreview("");
    setPromoPreview("");
  };

  const startEdit = (slider) => {
    setEditing(slider);
    setForm(normalizeSliderToForm(slider));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const appendColors = (fd) => {
    colorFields.forEach(([key]) => {
      fd.append(key, form[key] || "");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editing && !(form.desktopImage instanceof File)) {
      return toast.error("Desktop slider image is required");
    }

    if (!editing && !(form.mobileImage instanceof File)) {
      return toast.error("Mobile slider image is required");
    }

    if (form.mode === "link" && !form.link.trim()) {
      return toast.error("Link is required in link mode");
    }

    if (form.mode === "promo") {
      const hasPromoImage =
        form.promoImage instanceof File ||
        (editing && (editing.promoImageUrl || editing.promoImage));

      if (!hasPromoImage) {
        return toast.error("Promo image is required in promo mode");
      }

      if (!form.promoTitleBn.trim() && !form.promoTitleEn.trim()) {
        return toast.error("Promo title is required in promo mode");
      }
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("order", String(form.order || "0"));
      fd.append("status", form.status);
      fd.append("mode", form.mode);
      fd.append("link", form.link);
      fd.append("promoTitleBn", form.promoTitleBn);
      fd.append("promoTitleEn", form.promoTitleEn);
      fd.append("promoDescriptionBn", form.promoDescriptionBn);
      fd.append("promoDescriptionEn", form.promoDescriptionEn);
      fd.append(
        "promoTable",
        JSON.stringify({
          enabled: form.promoTableEnabled,
          sections: form.promoTableSections.map((section) => ({
            label: { bn: section.labelBn, en: section.labelEn },
            columns: section.columns,
            rows: section.rows,
          })),
        }),
      );
      appendColors(fd);

      if (form.desktopImage instanceof File) {
        fd.append("desktopImage", form.desktopImage);
      }

      if (form.mobileImage instanceof File) {
        fd.append("mobileImage", form.mobileImage);
      }

      if (form.promoImage instanceof File) {
        fd.append("promoImage", form.promoImage);
      }

      if (editing?._id) {
        await api.put(`/api/sliders/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Slider updated successfully");
      } else {
        await api.post("/api/sliders", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Slider created successfully");
      }

      await loadSliders();
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    if (!editing?._id) {
      setForm((prev) => ({ ...prev, ...defaultColors }));
      toast.success("Default colors applied");
      return;
    }

    const ok = window.confirm("Are you sure you want to reset slider colors?");
    if (!ok) return;

    try {
      setLoading(true);

      const res = await api.patch(`/api/sliders/${editing._id}/reset-colors`);
      const updated = res.data?.data || null;

      if (updated) {
        setEditing(updated);
        setForm(normalizeSliderToForm(updated));
      }

      await loadSliders();
      toast.success("Slider colors reset successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset colors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this slider?");
    if (!ok) return;

    try {
      await api.delete(`/api/sliders/${id}`);

      toast.success("Slider deleted successfully");
      setSliders((prev) => prev.filter((item) => item._id !== id));

      if (editing?._id === id) resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete slider");
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Sliders className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Slider{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Upload desktop/mobile slider images and control slider colors from
              admin panel.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Total Sliders</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {sliders.length}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">
                  {editing ? "Update Slider" : "Create Slider"}
                </h2>
                <p className="text-sm text-slate-400">
                  Desktop image and mobile image both are required when
                  creating.
                </p>
              </div>

              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Order Number</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.order}
                  onChange={(e) => setValue("order", e.target.value)}
                  placeholder="0"
                />
              </div>

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

              <div className="md:col-span-2">
                <LandscapeFileInput
                  label="Desktop Slider Image"
                  preview={desktopPreview}
                  onChange={(file) => setValue("desktopImage", file)}
                  helpText="Landscape desktop image"
                />
              </div>

              <div className="md:col-span-2">
                <SmallLandscapeFileInput
                  label="Mobile Slider Image"
                  preview={mobilePreview}
                  onChange={(file) => setValue("mobileImage", file)}
                  helpText="Landscape mobile image"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-black">Click Action</h2>
              <p className="text-sm text-slate-400">
                Slide-এ ক্লিক করলে কী হবে সেটা এখানে ঠিক করো।
              </p>
            </div>

            <div>
              <label className={labelClass}>Mode</label>
              <select
                value={form.mode}
                onChange={(e) => setValue("mode", e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option className="bg-[#050607]" value="link">
                  Link (নতুন ট্যাবে খুলবে)
                </option>
                <option className="bg-[#050607]" value="promo">
                  Promo Modal (ছবি + টাইটেল + বিবরণ দেখাবে)
                </option>
              </select>
            </div>

            {form.mode === "link" ? (
              <div className="mt-5">
                <label className={labelClass}>Link URL</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.link}
                  onChange={(e) => setValue("link", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div>
                  <label className={labelClass}>Promo Banner Image</label>
                  <p className="mb-2 text-xs text-slate-400">
                    প্রস্তাবিত সাইজ: 1920 x 476px, landscape ব্যানার ইমেজ
                  </p>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
                    {promoPreview ? (
                      <img
                        src={promoPreview}
                        alt="Promo Preview"
                        className="aspect-1920/476 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex aspect-1920/476 w-full flex-col items-center justify-center rounded-xl bg-black/30">
                        <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
                        <p className="text-sm font-black text-slate-100">
                          Click to upload promo image
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setValue("promoImage", e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Promo Title (BN)</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.promoTitleBn}
                      onChange={(e) =>
                        setValue("promoTitleBn", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Promo Title (EN)</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.promoTitleEn}
                      onChange={(e) =>
                        setValue("promoTitleEn", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-slate-400">
                    লেখার নিয়ম: যে লাইনের শেষে ":" থাকবে সেটা বোল্ড হেডিং হয়ে
                    যাবে (যেমন "How to Participate:"), যে লাইন "- " দিয়ে শুরু
                    হবে সেটা বুলেট পয়েন্ট হবে, খালি লাইন দিলে একটু গ্যাপ হবে।
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>
                      Promo Description (BN)
                    </label>
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={form.promoDescriptionBn}
                      onChange={(e) =>
                        setValue("promoDescriptionBn", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Promo Description (EN)
                    </label>
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={form.promoDescriptionEn}
                      onChange={(e) =>
                        setValue("promoDescriptionEn", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.promoTableEnabled}
                      onChange={(e) =>
                        setValue("promoTableEnabled", e.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer accent-[#3ea0ff]"
                    />
                    <span className="text-sm font-black text-blue-100">
                      Event Details Sections
                    </span>
                  </label>

                  <p className="mt-2 text-xs text-slate-400">
                    প্রতিটা সেকশনের বাম পাশে একটা লেবেল থাকবে (যেমন "Eligible
                    Tier")। Column যোগ করলে সেকশনটা টেবিল হবে (যেমন Bonus % /
                    Tier Level), Column না দিলে সেকশনটা সাধারণ লিস্ট হিসেবে
                    দেখাবে (যেমন "Eligible Games")।
                  </p>

                  {form.promoTableEnabled && (
                    <div className="mt-4 space-y-4">
                      {form.promoTableSections.map((section, sectionIndex) => (
                        <div
                          key={sectionIndex}
                          className="space-y-3 rounded-xl border border-[#1A79D3]/20 bg-black/40 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-400">
                              Section {sectionIndex + 1}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                removePromoTableSection(sectionIndex)
                              }
                              className="flex cursor-pointer items-center gap-1 rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-200 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove Section
                            </button>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              type="text"
                              className={inputClass}
                              value={section.labelBn}
                              onChange={(e) =>
                                setPromoTableSectionLabel(
                                  sectionIndex,
                                  "labelBn",
                                  e.target.value,
                                )
                              }
                              placeholder="Section Label (BN) — যেমন: এলিজিবল টায়ার"
                            />
                            <input
                              type="text"
                              className={inputClass}
                              value={section.labelEn}
                              onChange={(e) =>
                                setPromoTableSectionLabel(
                                  sectionIndex,
                                  "labelEn",
                                  e.target.value,
                                )
                              }
                              placeholder="Section Label (EN) — e.g. Eligible Tier"
                            />
                          </div>

                          <div className="space-y-2 rounded-lg border border-[#1A79D3]/10 bg-black/30 p-2">
                            <p className="text-[11px] font-bold text-slate-400">
                              Columns (খালি রাখলে সেকশনটা শুধু লিস্ট হবে, কোনো
                              header row থাকবে না)
                            </p>

                            {section.columns.map((col, colIndex) => (
                              <div
                                key={colIndex}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="text"
                                  className={`${inputClass} flex-1`}
                                  value={col.bn}
                                  onChange={(e) =>
                                    setPromoTableColumnValue(
                                      sectionIndex,
                                      colIndex,
                                      "bn",
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Column ${colIndex + 1} (BN)`}
                                />
                                <input
                                  type="text"
                                  className={`${inputClass} flex-1`}
                                  value={col.en}
                                  onChange={(e) =>
                                    setPromoTableColumnValue(
                                      sectionIndex,
                                      colIndex,
                                      "en",
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Column ${colIndex + 1} (EN)`}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePromoTableColumn(
                                      sectionIndex,
                                      colIndex,
                                    )
                                  }
                                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 p-2 text-red-200 hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addPromoTableColumn(sectionIndex)}
                              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#1A79D3]/40 bg-[#1A79D3]/10 px-3 py-2 text-xs font-black text-blue-100 hover:bg-[#1A79D3]/20"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Column
                            </button>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-400">
                              Rows
                            </p>

                            {section.rows.map((row, rowIndex) => (
                              <div
                                key={rowIndex}
                                className="rounded-lg border border-[#1A79D3]/10 bg-black/30 p-2"
                              >
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-500">
                                    Row {rowIndex + 1}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removePromoTableRow(
                                        sectionIndex,
                                        rowIndex,
                                      )
                                    }
                                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-200 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {row.cells.map((cell, cellIndex) => {
                                    const columnLabel =
                                      section.columns[cellIndex]?.en ||
                                      section.columns[cellIndex]?.bn ||
                                      (section.columns.length
                                        ? `Column ${cellIndex + 1}`
                                        : "Item");

                                    return (
                                      <div
                                        key={cellIndex}
                                        className="grid gap-2 md:grid-cols-2"
                                      >
                                        <input
                                          type="text"
                                          className={inputClass}
                                          value={cell.bn}
                                          onChange={(e) =>
                                            setPromoTableCellValue(
                                              sectionIndex,
                                              rowIndex,
                                              cellIndex,
                                              "bn",
                                              e.target.value,
                                            )
                                          }
                                          placeholder={`${columnLabel} (BN)`}
                                        />
                                        <input
                                          type="text"
                                          className={inputClass}
                                          value={cell.en}
                                          onChange={(e) =>
                                            setPromoTableCellValue(
                                              sectionIndex,
                                              rowIndex,
                                              cellIndex,
                                              "en",
                                              e.target.value,
                                            )
                                          }
                                          placeholder={`${columnLabel} (EN)`}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addPromoTableRow(sectionIndex)}
                              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#1A79D3]/40 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                            >
                              <Plus className="h-4 w-4" />
                              Add Row
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addPromoTableSection}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#1A79D3]/40 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                      >
                        <Plus className="h-4 w-4" />
                        Add Section
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-black">Slider Color Control</h2>
                <p className="text-sm text-slate-400">
                  Control section background, arrows, pagination and skeleton
                  colors.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetColors}
                disabled={loading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                  onChange={(value) => setValue(key, value)}
                />
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editing ? (
              <Save className="h-5 w-5" />
            ) : (
              <PlusCircle className="h-5 w-5" />
            )}

            {loading
              ? "Saving..."
              : editing
                ? "Update Slider"
                : "Create Slider"}
          </button>
        </div>

        <div className="space-y-6">
          <SliderPreview
            title="Desktop Preview"
            mode="desktop"
            form={form}
            image={desktopPreview}
          />

          <SliderPreview
            title="Mobile Preview"
            mode="mobile"
            form={form}
            image={mobilePreview}
          />

          <SkeletonPreview form={form} />
        </div>
      </form>

      <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-black">Slider List</h2>
            <p className="text-sm text-slate-400">
              Total {sliders.length} sliders found
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[150px_120px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option className="bg-[#050607]" value="">
                All Status
              </option>
              <option className="bg-[#050607]" value="active">
                Active
              </option>
              <option className="bg-[#050607]" value="inactive">
                Inactive
              </option>
            </select>

            <button
              type="button"
              onClick={loadSliders}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {listLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3ea0ff]" />
          </div>
        ) : sliders.length === 0 ? (
          <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-10 text-center text-slate-400">
            No sliders found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sliders.map((slider) => (
              <div
                key={slider._id}
                className="overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/30 shadow-xl transition hover:-translate-y-1 hover:border-[#3ea0ff]/50"
              >
                <div
                  className="aspect-video w-full"
                  style={{ backgroundColor: slider.slideBg || "#06182a" }}
                >
                  {slider.desktopImageUrl || slider.desktopImage ? (
                    <img
                      src={
                        slider.desktopImageUrl || fileUrl(slider.desktopImage)
                      }
                      alt="Desktop Slider"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="p-5 text-center">
                  <div
                    className="mx-auto mb-4 aspect-video w-full max-w-[220px] overflow-hidden rounded-xl border border-[#1A79D3]/25"
                    style={{ backgroundColor: slider.slideBg || "#06182a" }}
                  >
                    {slider.mobileImageUrl || slider.mobileImage ? (
                      <img
                        src={
                          slider.mobileImageUrl || fileUrl(slider.mobileImage)
                        }
                        alt="Mobile Slider"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImagePlus className="h-8 w-8 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-2">
                    <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                      #{slider.order || 0}
                    </span>

                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-black ${
                        slider.status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {slider.status?.toUpperCase()}
                    </span>

                    <span className="rounded-lg bg-purple-500 px-3 py-1 text-xs font-black text-white">
                      {slider.mode === "promo" ? "PROMO" : "LINK"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(slider)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(slider._id)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <p className="mt-4 truncate text-[11px] text-slate-600">
                    ID: {slider._id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

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

const SliderPreview = ({ title, mode, form, image }) => {
  const isDesktop = mode === "desktop";
  const bg = isDesktop ? form.desktopSectionBg : form.sectionBg;
  const heightClass = isDesktop ? "h-[220px]" : "h-[130px]";
  const maxWidth = isDesktop ? "max-w-full" : "max-w-[320px]";

  return (
    <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
      <h2 className="text-xl font-black">{title}</h2>

      <div className="mt-5 rounded-xl p-4" style={{ background: bg }}>
        <div
          className={`relative mx-auto w-full ${maxWidth} overflow-hidden rounded-xl`}
        >
          <button
            type="button"
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
            style={{ color: form.arrowColor }}
          >
            <ChevronLeft size={26} />
          </button>

          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center"
            style={{ color: form.arrowHoverColor }}
          >
            <ChevronRight size={26} />
          </button>

          <div
            className={`w-full overflow-hidden rounded-[3px] ${heightClass}`}
            style={{ backgroundColor: form.slideBg }}
          >
            {image ? (
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImagePlus className="h-12 w-12 text-slate-500" />
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-center gap-[6px]">
            <span
              className="h-[2px] w-[28px] rounded-full"
              style={{ backgroundColor: form.paginationActiveBg }}
            />
            <span
              className="h-[2px] w-[20px] rounded-full"
              style={{ backgroundColor: form.paginationBg }}
            />
            <span
              className="h-[2px] w-[20px] rounded-full"
              style={{ backgroundColor: form.paginationBg }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
          #{form.order || 0}
        </span>

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
  );
};

const SkeletonPreview = ({ form }) => (
  <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
    <h2 className="text-xl font-black">Skeleton Preview</h2>

    <div className="mt-5 space-y-5">
      <div className="rounded-xl p-4" style={{ background: form.sectionBg }}>
        <div
          className="h-[130px] w-full rounded-[3px]"
          style={{ background: form.mobileSkeletonBg }}
        />
        <SkeletonDots form={form} />
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: form.desktopSectionBg }}
      >
        <div
          className="h-[160px] w-full rounded-[3px]"
          style={{ background: form.desktopSkeletonBg }}
        />
        <SkeletonDots form={form} />
      </div>
    </div>
  </div>
);

const SkeletonDots = ({ form }) => (
  <div className="mt-3 flex justify-center gap-[6px]">
    <span
      className="h-[2px] w-[20px] rounded-full"
      style={{ backgroundColor: form.skeletonDotActiveBg }}
    />
    <span
      className="h-[2px] w-[20px] rounded-full"
      style={{ backgroundColor: form.skeletonDotBg }}
    />
    <span
      className="h-[2px] w-[20px] rounded-full"
      style={{ backgroundColor: form.skeletonDotBg }}
    />
  </div>
);

const LandscapeFileInput = ({ label, preview, onChange, helpText }) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-blue-100">
      {label}
    </label>

    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
      {preview ? (
        <img
          src={preview}
          alt="Desktop Preview"
          className="aspect-video w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black/30">
          <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
          <p className="text-sm font-black text-slate-100">
            Click to upload desktop image
          </p>
          <p className="mt-1 text-xs text-slate-500">{helpText}</p>
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

const SmallLandscapeFileInput = ({ label, preview, onChange, helpText }) => (
  <div>
    <label className="mb-2 block text-sm font-bold text-blue-100">
      {label}
    </label>

    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
      {preview ? (
        <img
          src={preview}
          alt="Mobile Preview"
          className="mx-auto aspect-video w-full max-w-[320px] rounded-xl object-cover"
        />
      ) : (
        <div className="mx-auto flex aspect-video w-full max-w-[320px] flex-col items-center justify-center rounded-xl bg-black/30">
          <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
          <p className="text-sm font-black text-slate-100">
            Click to upload mobile image
          </p>
          <p className="mt-1 text-xs text-slate-500">{helpText}</p>
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

export default AddSlider;
