import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Edit,
  Globe2,
  Home,
  ImagePlus,
  Loader2,
  PlusCircle,
  RefreshCw,
  Save,
  Search,
  Server,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;
const ORACLE_PROVIDER_API = "https://oraclegames.net/api/providerlist";
const ORACLE_PROVIDER_KEY = import.meta.env.VITE_ORACLE_GAME_DATA_KEY || "";

const emptyForm = {
  categoryId: "",
  providerCode: "",
  providerName: "",
  providerIcon: null,
  status: "active",
  isHome: false,
};

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const cleanText = (value = "") => String(value || "").trim();
const cleanProviderCode = (value = "") => cleanText(value).toUpperCase();

const normalizeOracleProviders = (data) => {
  const list = Array.isArray(data) ? data : data?.data || data?.providers || [];

  return list
    .filter((item) => item?.code && item?.name)
    .map((item) => ({
      providerCode: cleanProviderCode(item.code),
      providerName: cleanText(item.name),
      image: item.image || "",
      status: item.status || "",
      currency: item.currency || "",
      language: item.language || "",
      raw: item,
    }));
};

const GameProvider = () => {
  const [categories, setCategories] = useState([]);
  const [oracleProviders, setOracleProviders] = useState([]);
  const [savedProviders, setSavedProviders] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [oracleLoading, setOracleLoading] = useState(false);

  const [iconPreview, setIconPreview] = useState("");
  const [oracleSearch, setOracleSearch] = useState("");
  const [showSearchList, setShowSearchList] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [homeFilter, setHomeFilter] = useState("");
  const [syncFilter, setSyncFilter] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

  const labelClass = "mb-2 block text-sm font-bold text-blue-100";

  const selectedCategoryName = useMemo(() => {
    const cat = categories.find((c) => c._id === form.categoryId);
    return cat?.categoryName?.en || "";
  }, [categories, form.categoryId]);

  const selectedOracleProvider = useMemo(() => {
    return oracleProviders.find(
      (p) => String(p.providerCode) === String(form.providerCode),
    );
  }, [oracleProviders, form.providerCode]);

  const filteredOracleProviders = useMemo(() => {
    const keyword = oracleSearch.trim().toLowerCase();

    if (!keyword) return oracleProviders.slice(0, 30);

    return oracleProviders
      .filter((item) => {
        return (
          item.providerName?.toLowerCase().includes(keyword) ||
          item.providerCode?.toLowerCase().includes(keyword)
        );
      })
      .slice(0, 50);
  }, [oracleProviders, oracleSearch]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/api/game-categories/admin/all");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setCategories(list.filter((item) => item.status === "active"));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load game categories",
      );
    }
  };

  const loadOracleProviders = async () => {
    try {
      setOracleLoading(true);

      const res = await axios.get(ORACLE_PROVIDER_API, {
        headers: {
          "x-oraclegamedata-key": ORACLE_PROVIDER_KEY,
        },
      });

      setOracleProviders(normalizeOracleProviders(res.data));
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load providers from Oracle API",
      );
    } finally {
      setOracleLoading(false);
    }
  };

  const loadSavedProviders = async () => {
    try {
      setListLoading(true);

      const res = await api.get("/api/game-providers", {
        params: {
          categoryId: form.categoryId || "",
          search,
          status: statusFilter,
          isHome: homeFilter,
          syncStatus: syncFilter,
          limit: 100,
        },
      });

      setSavedProviders(res.data?.data?.providers || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load providers");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadOracleProviders();
  }, []);

  useEffect(() => {
    loadSavedProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.categoryId, search, statusFilter, homeFilter, syncFilter]);

  useEffect(() => {
    if (form.providerIcon instanceof File) {
      const url = URL.createObjectURL(form.providerIcon);
      setIconPreview(url);
      return () => URL.revokeObjectURL(url);
    }

    if (editing?.providerIconUrl) {
      setIconPreview(editing.providerIconUrl);
      return;
    }

    if (editing?.providerIcon) {
      setIconPreview(fileUrl(editing.providerIcon));
      return;
    }

    if (selectedOracleProvider?.image && !editing) {
      setIconPreview(selectedOracleProvider.image);
      return;
    }

    setIconPreview("");
  }, [form.providerIcon, editing, selectedOracleProvider]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setIconPreview("");
    setOracleSearch("");
    setShowSearchList(false);
  };

  const applyOracleProvider = (provider) => {
    setForm((prev) => ({
      ...prev,
      providerCode: provider.providerCode,
      providerName: provider.providerName,
    }));

    setOracleSearch(`${provider.providerCode} - ${provider.providerName}`);
    setShowSearchList(false);
  };

  const startEdit = (provider) => {
    setEditing(provider);

    setForm({
      categoryId: provider?.categoryId?._id || provider?.categoryId || "",
      providerCode: provider?.providerCode || "",
      providerName: provider?.providerName || "",
      providerIcon: null,
      status: provider?.status || "active",
      isHome: !!provider?.isHome,
    });

    setOracleSearch("");
    setShowSearchList(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId) return toast.error("Category is required");

    if (!form.providerCode.trim() || !form.providerName.trim()) {
      return toast.error("Provider code and name are required");
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("categoryId", form.categoryId);
      fd.append("providerCode", cleanProviderCode(form.providerCode));
      fd.append("providerName", form.providerName.trim());
      fd.append("status", form.status);
      fd.append("isHome", String(form.isHome));

      if (form.providerIcon instanceof File) {
        fd.append("providerIcon", form.providerIcon);
      }

      if (editing?._id) {
        await api.put(`/api/game-providers/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Provider updated successfully");
      } else {
        await api.post("/api/game-providers", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Provider created successfully");
      }

      await loadSavedProviders();
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSelectedOracle = async () => {
    if (!form.categoryId) return toast.error("Please select category first");

    if (!form.providerCode || !form.providerName) {
      return toast.error("Please select Oracle provider first");
    }

    try {
      setLoading(true);

      await api.post("/api/game-providers/oracle/sync", {
        categoryId: form.categoryId,
        providers: [
          {
            providerCode: form.providerCode,
            providerName: form.providerName,
            image: selectedOracleProvider?.image || "",
          },
        ],
      });

      toast.success("Provider synced successfully");
      await loadSavedProviders();
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure? This provider related all games will also be deleted.",
    );

    if (!ok) return;

    try {
      const res = await api.delete(`/api/game-providers/${id}`);

      toast.success(
        `Provider deleted. Deleted games: ${res.data?.data?.deletedGames || 0}`,
      );

      setSavedProviders((prev) => prev.filter((item) => item._id !== id));
      if (editing?._id === id) resetForm();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete provider",
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
              <Server className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Game{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Provider
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Add, sync and manage providers. Provider delete করলে related all
              games auto delete হবে।
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Total Providers</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {savedProviders.length}
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
                {editing ? "Update Provider" : "Create Provider"}
              </h2>
              <p className="text-sm text-slate-400">
                Select category and add provider icon only.
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
              <label className={labelClass}>Category *</label>
              <select
                className={`${inputClass} cursor-pointer`}
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option className="bg-[#050607]" value="">
                  Select Category
                </option>

                {categories.map((cat) => (
                  <option
                    className="bg-[#050607]"
                    key={cat._id}
                    value={cat._id}
                  >
                    {cat.categoryName?.en || "Unnamed Category"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>All Oracle Provider List</label>
              <select
                className={`${inputClass} cursor-pointer`}
                value={form.providerCode}
                onChange={(e) => {
                  const provider = oracleProviders.find(
                    (item) => item.providerCode === e.target.value,
                  );

                  if (provider) {
                    applyOracleProvider(provider);
                  } else {
                    setForm({
                      ...form,
                      providerCode: "",
                      providerName: "",
                    });
                    setOracleSearch("");
                  }
                }}
              >
                <option className="bg-[#050607]" value="">
                  Select Provider From Full List
                </option>

                {oracleProviders.map((provider) => (
                  <option
                    className="bg-[#050607]"
                    key={provider.providerCode}
                    value={provider.providerCode}
                  >
                    {provider.providerCode} - {provider.providerName}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative md:col-span-2">
              <label className={labelClass}>Search Oracle Provider</label>

              <div className="flex items-center gap-3 rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3">
                <Search className="h-5 w-5 text-[#3ea0ff]" />
                <input
                  value={oracleSearch}
                  onFocus={() => setShowSearchList(true)}
                  onChange={(e) => {
                    setOracleSearch(e.target.value);
                    setShowSearchList(true);
                  }}
                  placeholder="Type provider name/code and select..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>

              {showSearchList && (
                <div className="absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#1A79D3]/25 bg-[#050607] p-2 shadow-2xl">
                  {filteredOracleProviders.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-slate-400">
                      No provider found.
                    </div>
                  ) : (
                    filteredOracleProviders.map((provider) => (
                      <button
                        key={provider.providerCode}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyOracleProvider(provider)}
                        className="mb-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#1A79D3]/20"
                      >
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#1A79D3]/25 bg-black/40">
                          {provider.image ? (
                            <img
                              src={provider.image}
                              alt={provider.providerName}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Server className="h-5 w-5 text-[#3ea0ff]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-blue-100">
                            {provider.providerName}
                          </p>
                          <p className="text-xs font-bold text-[#3ea0ff]">
                            {provider.providerCode}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Provider Code *</label>
              <input
                className={inputClass}
                value={form.providerCode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    providerCode: cleanProviderCode(e.target.value),
                  })
                }
                placeholder="e.g. PG"
              />
            </div>

            <div>
              <label className={labelClass}>Provider Name *</label>
              <input
                className={inputClass}
                value={form.providerName}
                onChange={(e) =>
                  setForm({ ...form, providerName: e.target.value })
                }
                placeholder="e.g. PG Soft"
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

            <div>
              <label className={labelClass}>Home Provider</label>

              <button
                type="button"
                onClick={() => setForm({ ...form, isHome: !form.isHome })}
                className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-black transition ${
                  form.isHome
                    ? "border-[#3ea0ff]/50 bg-[#1A79D3]/30 text-white"
                    : "border-[#1A79D3]/25 bg-black/40 text-slate-300 hover:bg-[#1A79D3]/15"
                }`}
              >
                <Home className="h-5 w-5" />
                {form.isHome ? "Show In Home" : "Not Home"}
              </button>
            </div>

            <FileInput
              label="Provider Icon"
              preview={iconPreview}
              onChange={(file) => setForm({ ...form, providerIcon: file })}
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
              ) : editing ? (
                <Save className="h-5 w-5" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}

              {loading
                ? "Saving..."
                : editing
                  ? "Update Provider"
                  : "Create Provider"}
            </button>

            <button
              type="button"
              onClick={handleSyncSelectedOracle}
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/30 bg-[#1A79D3]/10 px-5 py-3.5 text-sm font-black text-blue-100 transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Globe2 className="h-5 w-5" />
              Sync Selected Oracle
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <h2 className="text-xl font-black">Live Preview</h2>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/40 p-6 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-[#1A79D3]/30 bg-[#06182a]">
              {iconPreview ? (
                <img
                  src={iconPreview}
                  alt="Provider Icon"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImagePlus className="h-12 w-12 text-slate-500" />
              )}
            </div>

            <h3 className="mt-5 text-lg font-black text-blue-100">
              {form.providerName || "Provider Name"}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {form.providerCode || "PROVIDER_CODE"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Category: {selectedCategoryName || "Not Selected"}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span
                className={`rounded-lg px-3 py-1 text-xs font-black ${
                  form.status === "active"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {form.status.toUpperCase()}
              </span>

              {form.isHome && (
                <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                  HOME
                </span>
              )}
            </div>
          </div>
        </div>
      </form>

      <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-xl font-black">Game Providers</h2>
            <p className="text-sm text-slate-400">
              Total {savedProviders.length} providers found
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_150px_120px]">
            <div className="flex items-center gap-3 rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3">
              <Search className="h-5 w-5 text-[#3ea0ff]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved provider..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </div>

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

            <select
              value={homeFilter}
              onChange={(e) => setHomeFilter(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option className="bg-[#050607]" value="">
                All Home
              </option>
              <option className="bg-[#050607]" value="true">
                Home
              </option>
              <option className="bg-[#050607]" value="false">
                Not Home
              </option>
            </select>

            <select
              value={syncFilter}
              onChange={(e) => setSyncFilter(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option className="bg-[#050607]" value="">
                All Sync
              </option>
              <option className="bg-[#050607]" value="pending">
                Pending
              </option>
              <option className="bg-[#050607]" value="synced">
                Synced
              </option>
              <option className="bg-[#050607]" value="failed">
                Failed
              </option>
            </select>

            <button
              type="button"
              onClick={() => {
                loadSavedProviders();
                loadOracleProviders();
              }}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {oracleLoading && (
          <div className="mb-4 rounded-xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3 text-sm font-bold text-blue-100">
            Loading Oracle providers...
          </div>
        )}

        {listLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3ea0ff]" />
          </div>
        ) : savedProviders.length === 0 ? (
          <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-10 text-center text-slate-400">
            No providers found.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {savedProviders.map((provider) => (
              <div
                key={provider._id}
                className="overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-5 shadow-xl transition hover:-translate-y-1 hover:border-[#3ea0ff]/50"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[#1A79D3]/30 bg-[#06182a]">
                  {provider.providerIconUrl || provider.providerIcon ? (
                    <img
                      src={
                        provider.providerIconUrl ||
                        fileUrl(provider.providerIcon)
                      }
                      alt={provider.providerName}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <ImagePlus className="h-10 w-10 text-slate-600" />
                  )}
                </div>

                <div className="mt-5 text-center">
                  <h3 className="truncate text-lg font-black text-blue-100">
                    {provider.providerName || "—"}
                  </h3>

                  <p className="mt-1 text-sm font-bold text-[#3ea0ff]">
                    {provider.providerCode || "—"}
                  </p>

                  <p className="mt-2 truncate text-xs text-slate-500">
                    Category:{" "}
                    {provider.categoryId?.categoryName?.en || "Unknown"}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span
                      className={`rounded-lg px-3 py-1 text-xs font-black ${
                        provider.status === "active"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {provider.status?.toUpperCase()}
                    </span>

                    {provider.isHome && (
                      <span className="rounded-lg bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white">
                        HOME
                      </span>
                    )}

                    <span className="rounded-lg bg-black/50 px-3 py-1 text-xs font-black text-slate-300">
                      {provider.syncStatus || "pending"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => startEdit(provider)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-2.5 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(provider._id)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  <p className="mt-4 truncate text-[11px] text-slate-600">
                    ID: {provider._id}
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

export default GameProvider;
