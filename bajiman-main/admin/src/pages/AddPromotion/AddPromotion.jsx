import React, { useEffect, useState } from "react";
import {
  Edit,
  ImagePlus,
  Loader2,
  Megaphone,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const PROMOTION_CATEGORIES = [
  "Welcome Offer",
  "Slots",
  "Live Casino",
  "Sports",
  "Fishing",
  "Lottery",
  "Table",
  "Arcade",
  "Crash",
];

const emptyForm = {
  category: "",
  titleBn: "",
  titleEn: "",
  descriptionBn: "",
  descriptionEn: "",
  image: null,
  order: "",
  status: "active",
};

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const AddPromotion = () => {
  const [form, setForm] = useState(emptyForm);
  const [promotions, setPromotions] = useState([]);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [preview, setPreview] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

  const labelClass = "mb-2 block text-sm font-bold text-blue-100";

  const loadPromotions = async () => {
    try {
      setListLoading(true);

      const res = await api.get("/api/promotions", {
        params: {
          search,
          category: categoryFilter,
          status: statusFilter,
          limit: 100,
        },
      });

      setPromotions(res.data?.data?.promotions || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load promotions",
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    if (form.image instanceof File) {
      const url = URL.createObjectURL(form.image);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editing?.imageUrl) {
      setPreview(editing.imageUrl);
      return;
    }

    if (editing?.image) {
      setPreview(fileUrl(editing.image));
      return;
    }

    setPreview("");
  }, [form.image, editing]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setPreview("");
  };

  const startEdit = (promotion) => {
    setEditing(promotion);

    setForm({
      category: promotion?.category || "",
      titleBn: promotion?.title?.bn || "",
      titleEn: promotion?.title?.en || "",
      descriptionBn: promotion?.description?.bn || "",
      descriptionEn: promotion?.description?.en || "",
      image: null,
      order: promotion?.order ? String(promotion.order) : "",
      status: promotion?.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.category) {
      return toast.error("Promotion category is required");
    }

    if (!form.titleBn.trim() || !form.titleEn.trim()) {
      return toast.error("Promotion title Bangla and English are required");
    }

    if (!form.descriptionBn.trim() || !form.descriptionEn.trim()) {
      return toast.error(
        "Promotion description Bangla and English are required",
      );
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("category", form.category);
      fd.append("titleBn", form.titleBn.trim());
      fd.append("titleEn", form.titleEn.trim());
      fd.append("descriptionBn", form.descriptionBn.trim());
      fd.append("descriptionEn", form.descriptionEn.trim());
      fd.append("order", String(form.order || "0"));
      fd.append("status", form.status);

      if (form.image instanceof File) {
        fd.append("image", form.image);
      }

      if (editing?._id) {
        await api.put(`/api/promotions/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Promotion updated successfully");
      } else {
        await api.post("/api/promotions", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Promotion created successfully");
      }

      await loadPromotions();
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this promotion?",
    );
    if (!ok) return;

    try {
      await api.delete(`/api/promotions/${id}`);

      toast.success("Promotion deleted successfully");
      setPromotions((prev) => prev.filter((item) => item._id !== id));

      if (editing?._id === id) resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete promotion",
      );
    }
  };

  const handleRemoveImage = async () => {
    if (!editing?._id) return;

    try {
      await api.patch(`/api/promotions/${editing._id}/remove-image`);

      toast.success("Image removed successfully");
      setPreview("");
      await loadPromotions();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove image");
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Megaphone className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Promotion{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Add promotion by category, Bangla/English title, description and
              landscape image.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Total Promotions</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {promotions.length}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {editing ? "Update Promotion" : "Create Promotion"}
              </h2>
              <p className="text-sm text-slate-400">
                Select category and upload landscape promotion image.
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
              <label className={labelClass}>Promotion Category *</label>

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option className="bg-[#050607]" value="">
                  Select Category
                </option>

                {PROMOTION_CATEGORIES.map((item) => (
                  <option className="bg-[#050607]" key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Order</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <label className={labelClass}>Promotion Title Bangla *</label>
              <input
                className={inputClass}
                value={form.titleBn}
                onChange={(e) => setForm({ ...form, titleBn: e.target.value })}
                placeholder="বাংলা টাইটেল লিখুন"
              />
            </div>

            <div>
              <label className={labelClass}>Promotion Title English *</label>
              <input
                className={inputClass}
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                placeholder="Enter English title"
              />
            </div>

            <div>
              <label className={labelClass}>Description Bangla *</label>
              <textarea
                rows={5}
                className={`${inputClass} resize-none`}
                value={form.descriptionBn}
                onChange={(e) =>
                  setForm({ ...form, descriptionBn: e.target.value })
                }
                placeholder="বাংলা description লিখুন"
              />
            </div>

            <div>
              <label className={labelClass}>Description English *</label>
              <textarea
                rows={5}
                className={`${inputClass} resize-none`}
                value={form.descriptionEn}
                onChange={(e) =>
                  setForm({ ...form, descriptionEn: e.target.value })
                }
                placeholder="Enter English description"
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

            {editing?._id && preview && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                >
                  Remove Image
                </button>
              </div>
            )}

            <div className="md:col-span-2">
              <LandscapeFileInput
                label="Promotion Image"
                preview={preview}
                onChange={(file) => setForm({ ...form, image: file })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
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
                ? "Update Promotion"
                : "Create Promotion"}
          </button>
        </div>

        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <h2 className="text-xl font-black">Landscape Preview</h2>
          <p className="mt-1 text-sm text-slate-400">Preview before saving.</p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/40 p-4">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#1A79D3]/30 bg-[#06182a]">
              {preview ? (
                <img
                  src={preview}
                  alt="Promotion"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImagePlus className="h-14 w-14 text-slate-500" />
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                  {form.category || "Category"}
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

              <h3 className="text-center text-lg font-black text-blue-100">
                {form.titleEn || "Promotion Title"}
              </h3>

              <p className="mt-2 line-clamp-3 text-center text-sm text-slate-400">
                {form.descriptionEn || "Promotion description preview"}
              </p>

              <p className="mt-3 text-center text-xs text-slate-500">
                BN: {form.titleBn || "বাংলা টাইটেল"}
              </p>
            </div>
          </div>
        </div>
      </form>

      <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-xl font-black">Promotion List</h2>
            <p className="text-sm text-slate-400">
              Total {promotions.length} promotions found
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px_150px_120px]">
            <div className="flex items-center gap-3 rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3">
              <Search className="h-5 w-5 text-[#3ea0ff]" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search promotion..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option className="bg-[#050607]" value="">
                All Category
              </option>

              {PROMOTION_CATEGORIES.map((item) => (
                <option className="bg-[#050607]" key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

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
              onClick={loadPromotions}
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
        ) : promotions.length === 0 ? (
          <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-10 text-center text-slate-400">
            No promotions found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {promotions.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/30 shadow-xl transition hover:-translate-y-1 hover:border-[#3ea0ff]/50"
              >
                <div className="aspect-video w-full bg-[#06182a]">
                  {item.imageUrl || item.image ? (
                    <img
                      src={item.imageUrl || fileUrl(item.image)}
                      alt={item.title?.en}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImagePlus className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                      {item.category}
                    </span>

                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-black ${
                        item.status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {item.status?.toUpperCase()}
                    </span>

                    <span className="rounded-lg bg-black/50 px-3 py-1 text-xs font-black text-slate-300">
                      #{item.order || 0}
                    </span>
                  </div>

                  <h3 className="line-clamp-1 text-lg font-black text-blue-100">
                    {item.title?.en || "—"}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {item.description?.en || "—"}
                  </p>

                  <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                    BN: {item.title?.bn || "—"}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <p className="mt-4 truncate text-[11px] text-slate-600">
                    ID: {item._id}
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

const LandscapeFileInput = ({ label, preview, onChange }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-blue-100">
        {label}
      </label>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="aspect-video w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black/30">
            <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
            <p className="text-sm font-black text-slate-100">
              Click to upload landscape image
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
};

export default AddPromotion;
