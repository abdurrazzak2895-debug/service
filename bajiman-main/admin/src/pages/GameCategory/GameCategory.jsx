import React, { useEffect, useState } from "react";
import {
  Edit,
  ImagePlus,
  Loader2,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
  categoryNameBn: "",
  categoryNameEn: "",
  categoryTitleBn: "",
  categoryTitleEn: "",
  iconImage: null,
  order: "",
  status: "active",
};

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const GameCategory = () => {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [iconPreview, setIconPreview] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

  const labelClass = "mb-2 block text-sm font-bold text-blue-100";

  const loadCategories = async () => {
    try {
      setListLoading(true);

      const res = await api.get("/api/game-categories/admin/all");

      const list = Array.isArray(res.data?.data) ? res.data.data : [];

      const keyword = search.toLowerCase();

      const filtered = list.filter((item) => {
        const matchSearch =
          !keyword ||
          item?.categoryName?.en?.toLowerCase().includes(keyword) ||
          item?.categoryName?.bn?.toLowerCase().includes(keyword) ||
          item?.categoryTitle?.en?.toLowerCase().includes(keyword) ||
          item?.categoryTitle?.bn?.toLowerCase().includes(keyword);

        const matchStatus = !status || item.status === status;

        return matchSearch && matchStatus;
      });

      setCategories(filtered);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load categories",
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  useEffect(() => {
    if (form.iconImage instanceof File) {
      const url = URL.createObjectURL(form.iconImage);
      setIconPreview(url);

      return () => URL.revokeObjectURL(url);
    }

    if (editing?.iconImageUrl) {
      setIconPreview(editing.iconImageUrl);
      return;
    }

    if (editing?.iconImage) {
      setIconPreview(fileUrl(editing.iconImage));
      return;
    }

    setIconPreview("");
  }, [form.iconImage, editing]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setIconPreview("");
  };

  const startEdit = (category) => {
    setEditing(category);

    setForm({
      categoryNameBn: category?.categoryName?.bn || "",
      categoryNameEn: category?.categoryName?.en || "",
      categoryTitleBn: category?.categoryTitle?.bn || "",
      categoryTitleEn: category?.categoryTitle?.en || "",
      iconImage: null,
      order: category?.order ? String(category.order) : "",
      status: category?.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryNameBn.trim() || !form.categoryNameEn.trim()) {
      return toast.error("Category name BN and EN are required");
    }

    if (!form.categoryTitleBn.trim() || !form.categoryTitleEn.trim()) {
      return toast.error("Category title BN and EN are required");
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("categoryNameBn", form.categoryNameBn.trim());
      fd.append("categoryNameEn", form.categoryNameEn.trim());
      fd.append("categoryTitleBn", form.categoryTitleBn.trim());
      fd.append("categoryTitleEn", form.categoryTitleEn.trim());
      fd.append("order", String(form.order || "0").trim());
      fd.append("status", form.status);

      if (form.iconImage instanceof File) {
        fd.append("iconImage", form.iconImage);
      }

      if (editing?._id) {
        await api.put(`/api/game-categories/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Category updated successfully");
      } else {
        await api.post("/api/game-categories", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Category created successfully");
      }

      await loadCategories();
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure? This category related providers and games will also be deleted.",
    );

    if (!ok) return;

    try {
      await api.delete(`/api/game-categories/${id}`);

      toast.success("Category deleted successfully");
      setCategories((prev) => prev.filter((item) => item._id !== id));

      if (editing?._id === id) resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete category",
      );
    }
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Layers className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Game{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Category
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Create, update and manage game categories.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Total Categories</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {categories.length}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]"
      >
        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {editing ? "Update Category" : "Create Category"}
              </h2>
              <p className="text-sm text-slate-400">
                Add Bangla/English name and category icon.
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
              <label className={labelClass}>Category Name BN *</label>
              <input
                className={inputClass}
                value={form.categoryNameBn}
                onChange={(e) =>
                  setForm({ ...form, categoryNameBn: e.target.value })
                }
                placeholder="যেমন: স্লট"
              />
            </div>

            <div>
              <label className={labelClass}>Category Name EN *</label>
              <input
                className={inputClass}
                value={form.categoryNameEn}
                onChange={(e) =>
                  setForm({ ...form, categoryNameEn: e.target.value })
                }
                placeholder="e.g. Slot"
              />
            </div>

            <div>
              <label className={labelClass}>Category Title BN *</label>
              <input
                className={inputClass}
                value={form.categoryTitleBn}
                onChange={(e) =>
                  setForm({ ...form, categoryTitleBn: e.target.value })
                }
                placeholder="যেমন: স্লট গেমস"
              />
            </div>

            <div>
              <label className={labelClass}>Category Title EN *</label>
              <input
                className={inputClass}
                value={form.categoryTitleEn}
                onChange={(e) =>
                  setForm({ ...form, categoryTitleEn: e.target.value })
                }
                placeholder="e.g. Slot Games"
              />
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
              <label className={labelClass}>Status</label>
              <select
                className={`${inputClass} cursor-pointer`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option className="bg-[#050607]" value="active">
                  Active
                </option>
                <option className="bg-[#050607]" value="inactive">
                  Inactive
                </option>
              </select>
            </div>

            <FileInput
              label="Icon Image"
              preview={iconPreview}
              onChange={(file) => setForm({ ...form, iconImage: file })}
            />
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
                ? "Update Category"
                : "Create Category"}
          </button>
        </div>

        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <h2 className="text-xl font-black">Live Preview</h2>
          <p className="mt-1 text-sm text-slate-400">Preview before saving.</p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/40 p-6 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-[#1A79D3]/30 bg-[#06182a]">
              {iconPreview ? (
                <img
                  src={iconPreview}
                  alt="Icon"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImagePlus className="h-12 w-12 text-slate-500" />
              )}
            </div>

            <h3 className="mt-5 text-lg font-black text-blue-100">
              {form.categoryNameEn || "Category Name"}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {form.categoryTitleEn || "Category title preview"}
            </p>

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
        </div>
      </form>

      <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-black">Game Categories</h2>
            <p className="text-sm text-slate-400">
              Total {categories.length} categories found
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_150px_120px]">
            <div className="flex items-center gap-3 rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3">
              <Search className="h-5 w-5 text-[#3ea0ff]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
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
              onClick={loadCategories}
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
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-10 text-center text-slate-400">
            No categories found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-5 shadow-xl transition hover:-translate-y-1 hover:border-[#3ea0ff]/50"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#1A79D3]/30 bg-[#06182a]">
                  {cat.iconImageUrl || cat.iconImage ? (
                    <img
                      src={cat.iconImageUrl || fileUrl(cat.iconImage)}
                      alt={cat.categoryName?.en}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <ImagePlus className="h-10 w-10 text-slate-600" />
                  )}
                </div>

                <div className="mt-5 text-center">
                  <h3 className="truncate text-lg font-black text-blue-100">
                    {cat.categoryName?.en || "—"}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {cat.categoryTitle?.en || "No title"}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    BN: {cat.categoryName?.bn || "—"}
                  </p>

                  <div className="mt-4 flex justify-center gap-2">
                    <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                      #{cat.order || 0}
                    </span>

                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-black ${
                        cat.status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {cat.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat._id)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <p className="mt-4 truncate text-[11px] text-slate-600">
                    ID: {cat._id}
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

const FileInput = ({ label, preview, onChange }) => {
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
            className="h-24 w-24 rounded-xl object-contain"
          />
        ) : (
          <>
            <ImagePlus className="mb-3 h-9 w-9 text-[#3ea0ff]" />
            <p className="text-sm font-black text-slate-100">Click to upload</p>
            <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP, SVG</p>
          </>
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

export default GameCategory;
