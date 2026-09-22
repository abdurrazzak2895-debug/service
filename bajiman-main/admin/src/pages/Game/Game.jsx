import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit,
  Flame,
  Gamepad2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
  Heart,
  BadgePlus,
  ArrowDownAZ,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;
const GAMES_PER_PAGE = 50;

const FLAG_FIELDS = [
  { key: "isHot", title: "HOT", icon: Flame },
  { key: "isFavorites", title: "Favorites", icon: Heart },
  { key: "isLatest", title: "Latest", icon: BadgePlus },
  { key: "isAZ", title: "A-Z", icon: ArrowDownAZ },
];

const getDefaultFlags = () =>
  FLAG_FIELDS.reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {});

const initialAddFlags = {
  image: null,
  oracleImageType: "thumbnail",
  status: "active",
  ...getDefaultFlags(),
};

const initialEditFlags = {
  image: null,
  oracleImageType: "thumbnail",
  status: "active",
  ...getDefaultFlags(),
};

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const cleanText = (value = "") => String(value || "").trim();

const getOracleGameId = (game) => {
  return cleanText(game?.game_uid || game?.gameUId || "");
};

const getOracleGameImage = (game, type = "thumbnail") => {
  if (!game) return "";

  const images = game?.images || {};

  if (type === "original") {
    return game?.original || images?.original || game?.raw?.original || "";
  }

  if (type === "height") {
    return game?.height || images?.height || game?.raw?.height || "";
  }

  return (
    game?.thumbnail ||
    images?.thumbnail ||
    game?.raw?.thumbnail ||
    game?.original ||
    images?.original ||
    ""
  );
};

const normalizeOracleGames = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.games)
      ? payload.games
      : Array.isArray(payload?.data?.games)
        ? payload.data.games
        : [];

  return list
    .filter((game) => game?.game_uid || game?.gameUId)
    .map((game) => ({
      ...game,
      name: game?.name || "",
      game_uid: getOracleGameId(game),
      provider: game?.provider || "",
      category: game?.category || "",
      status: game?.status,
      original:
        game?.original || game?.images?.original || game?.raw?.original || "",
      height: game?.height || game?.images?.height || game?.raw?.height || "",
      thumbnail:
        game?.thumbnail ||
        game?.images?.thumbnail ||
        game?.raw?.thumbnail ||
        "",
    }));
};

const Game = () => {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedProviderDbId, setSelectedProviderDbId] = useState("");

  const [providerGames, setProviderGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingSelectedGames, setLoadingSelectedGames] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchGame, setSearchGame] = useState("");

  const [form, setForm] = useState(initialAddFlags);
  const [imagePreview, setImagePreview] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState(initialEditFlags);
  const [editPreview, setEditPreview] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item._id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const selectedProvider = useMemo(
    () => providers.find((item) => item._id === selectedProviderDbId),
    [providers, selectedProviderDbId],
  );

  const selectedCategoryName = selectedCategory?.categoryName?.en || "";
  const selectedProviderCode = selectedProvider?.providerCode || "";

  const inputClass =
    "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

  const labelClass = "mb-2 block text-sm font-bold text-blue-100";

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);

      const res = await api.get("/api/game-categories/admin/all");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];

      setCategories(
        list.filter((item) => !item.status || item.status === "active"),
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load categories",
      );
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProviders = async (categoryId) => {
    if (!categoryId) {
      setProviders([]);
      setSelectedProviderDbId("");
      return;
    }

    try {
      setLoadingProviders(true);

      const res = await api.get("/api/game-providers", {
        params: { categoryId, limit: 500, status: "active" },
      });

      setProviders(res.data?.data?.providers || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load providers");
    } finally {
      setLoadingProviders(false);
    }
  };

  const loadSelectedGames = async (providerDbId = selectedProviderDbId) => {
    if (!providerDbId) {
      setSelectedGames([]);
      return;
    }

    try {
      setLoadingSelectedGames(true);

      const res = await api.get("/api/games", {
        params: { providerDbId, limit: 10000 },
      });

      setSelectedGames(res.data?.data?.games || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load selected games",
      );
    } finally {
      setLoadingSelectedGames(false);
    }
  };

  const loadOracleGames = async () => {
    if (!selectedProviderCode) {
      setProviderGames([]);
      setCurrentPage(1);
      return;
    }

    try {
      setLoadingGames(true);

      const res = await api.get(`/api/games/oracle/${selectedProviderCode}`);
      const games = normalizeOracleGames(res.data?.data || res.data);

      setProviderGames(games);
      setCurrentPage(1);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load Oracle games",
      );
      setProviderGames([]);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProviders(selectedCategoryId);
  }, [selectedCategoryId]);

  useEffect(() => {
    loadSelectedGames(selectedProviderDbId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviderDbId]);

  useEffect(() => {
    loadOracleGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProviderCode]);

  useEffect(() => {
    if (!form.image) {
      setImagePreview("");
      return;
    }

    const url = URL.createObjectURL(form.image);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  useEffect(() => {
    if (!editForm.image) return;

    const url = URL.createObjectURL(editForm.image);
    setEditPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [editForm.image]);

  useEffect(() => {
    if (!editingGame || editForm.image) return;

    if (editingGame.image) {
      setEditPreview(fileUrl(editingGame.image));
      return;
    }

    setEditPreview(
      getOracleGameImage(editingGame.oracleGame, editForm.oracleImageType),
    );
  }, [editForm.oracleImageType, editingGame, editForm.image]);

  const resetAddForm = () => {
    setForm(initialAddFlags);
    setImagePreview("");
  };

  const filteredOracleGames = useMemo(() => {
    const q = searchGame.trim().toLowerCase();

    if (!q) return providerGames;

    return providerGames.filter((game) => {
      const name = String(game?.name || "").toLowerCase();
      const gameUId = String(game?.game_uid || "").toLowerCase();
      const category = String(game?.category || "").toLowerCase();
      const provider = String(game?.provider || "").toLowerCase();

      return (
        name.includes(q) ||
        gameUId.includes(q) ||
        category.includes(q) ||
        provider.includes(q)
      );
    });
  }, [providerGames, searchGame]);

  const totalPages =
    Math.ceil(filteredOracleGames.length / GAMES_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;

  const paginatedGames = filteredOracleGames.slice(
    startIndex,
    startIndex + GAMES_PER_PAGE,
  );

  const isGameSelected = (gameUId) => {
    return selectedGames.some(
      (item) => String(item.gameUId) === String(gameUId),
    );
  };

  const getSelectedGame = (gameUId) => {
    return selectedGames.find(
      (item) => String(item.gameUId) === String(gameUId),
    );
  };

  const selectedCountThisPage = useMemo(() => {
    return paginatedGames.reduce((total, game) => {
      return isGameSelected(getOracleGameId(game)) ? total + 1 : total;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedGames, selectedGames]);

  const allSelectedThisPage =
    paginatedGames.length > 0 &&
    selectedCountThisPage === paginatedGames.length;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const appendGameFormData = (fd, gameUId, flags = form) => {
    fd.append("categoryId", selectedCategoryId);
    fd.append("providerDbId", selectedProviderDbId);
    fd.append("gameUId", gameUId);
    fd.append("oracleImageType", flags.oracleImageType || "thumbnail");
    fd.append("status", flags.status || "active");

    FLAG_FIELDS.forEach((item) => {
      fd.append(item.key, String(Boolean(flags[item.key])));
    });
  };

  const handleSelectGame = async (game) => {
    if (!selectedCategoryId) return toast.error("Please select category");
    if (!selectedProviderDbId) return toast.error("Please select provider");

    const gameUId = getOracleGameId(game);
    if (!gameUId) return toast.error("game_uid not found from Oracle API");

    const alreadySelected = isGameSelected(gameUId);

    try {
      if (alreadySelected) {
        const selectedDoc = getSelectedGame(gameUId);

        if (!selectedDoc?._id) {
          return toast.error("Selected game data not found");
        }

        await api.delete(`/api/games/${selectedDoc._id}`);

        setSelectedGames((prev) =>
          prev.filter((item) => item._id !== selectedDoc._id),
        );

        toast.success("Game removed");
        return;
      }

      const fd = new FormData();

      appendGameFormData(fd, gameUId);

      if (form.image instanceof File) {
        fd.append("image", form.image);
      }

      const res = await api.post("/api/games", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedGames((prev) => [res.data?.data, ...prev]);
      toast.success("Game added");
      resetAddForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Operation failed");
    }
  };

  const handleSelectAllThisPage = async () => {
    if (bulkLoading) return;
    if (!paginatedGames.length) return;
    if (!selectedCategoryId) return toast.error("Please select category");
    if (!selectedProviderDbId) return toast.error("Please select provider");

    try {
      setBulkLoading(true);

      let added = 0;
      let skipped = 0;
      let failed = 0;

      for (const game of paginatedGames) {
        const gameUId = getOracleGameId(game);

        if (!gameUId || isGameSelected(gameUId)) {
          skipped += 1;
          continue;
        }

        const fd = new FormData();
        appendGameFormData(fd, gameUId);

        try {
          const res = await api.post("/api/games", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          setSelectedGames((prev) => [res.data?.data, ...prev]);
          added += 1;
        } catch {
          failed += 1;
        }
      }

      if (added) toast.success(`Selected ${added} games`);
      if (skipped) toast.info(`Skipped ${skipped} games`);
      if (failed) toast.error(`Failed ${failed} games`);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleRemoveAllThisPage = async () => {
    if (bulkLoading) return;
    if (!paginatedGames.length) return;

    try {
      setBulkLoading(true);

      let removed = 0;
      let skipped = 0;
      let failed = 0;

      for (const game of paginatedGames) {
        const selectedDoc = getSelectedGame(getOracleGameId(game));

        if (!selectedDoc?._id) {
          skipped += 1;
          continue;
        }

        try {
          await api.delete(`/api/games/${selectedDoc._id}`);

          setSelectedGames((prev) =>
            prev.filter((item) => item._id !== selectedDoc._id),
          );

          removed += 1;
        } catch {
          failed += 1;
        }
      }

      if (removed) toast.success(`Removed ${removed} games`);
      if (skipped) toast.info(`Skipped ${skipped} not selected`);
      if (failed) toast.error(`Failed ${failed} removes`);
    } finally {
      setBulkLoading(false);
    }
  };

  const openEditModal = (selectedDoc, oracleGame = null) => {
    const imageType = selectedDoc.oracleImageType || "thumbnail";

    setEditingGame({
      ...selectedDoc,
      oracleGame,
    });

    const flags = getDefaultFlags();

    FLAG_FIELDS.forEach((item) => {
      flags[item.key] = Boolean(selectedDoc[item.key]);
    });

    setEditForm({
      image: null,
      oracleImageType: imageType,
      status: selectedDoc.status || "active",
      ...flags,
    });

    if (selectedDoc.image) {
      setEditPreview(fileUrl(selectedDoc.image));
    } else {
      setEditPreview(getOracleGameImage(oracleGame, imageType));
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGame(null);
    setEditForm(initialEditFlags);
    setEditPreview("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingGame?._id) return;

    try {
      const fd = new FormData();

      fd.append("oracleImageType", editForm.oracleImageType || "thumbnail");
      fd.append("status", editForm.status || "active");

      FLAG_FIELDS.forEach((item) => {
        fd.append(item.key, String(Boolean(editForm[item.key])));
      });

      if (editForm.image instanceof File) {
        fd.append("image", editForm.image);
      }

      const res = await api.put(`/api/games/${editingGame._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSelectedGames((prev) =>
        prev.map((item) =>
          item._id === editingGame._id ? res.data?.data : item,
        ),
      );

      toast.success("Game updated");
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    }
  };

  const handleRemoveCustomImage = async () => {
    if (!editingGame?._id) return;

    try {
      const res = await api.patch(`/api/games/${editingGame._id}/remove-image`);

      setSelectedGames((prev) =>
        prev.map((item) =>
          item._id === editingGame._id ? res.data?.data : item,
        ),
      );

      toast.success("Custom image removed");
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove image");
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedProviderDbId("");
    setProviderGames([]);
    setSelectedGames([]);
    setCurrentPage(1);
    setSearchGame("");
    resetAddForm();
  };

  const handleProviderChange = (providerDbId) => {
    setSelectedProviderDbId(providerDbId);
    setProviderGames([]);
    setSelectedGames([]);
    setCurrentPage(1);
    setSearchGame("");
    resetAddForm();
  };

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Gamepad2 className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Game{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Select category and provider, then add Oracle games. Oracle image
              URL DB-তে save হবে না; শুধু custom uploaded image save হবে।
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[#3ea0ff]" />
              <div>
                <p className="text-sm font-black text-blue-100">Oracle Games</p>
                <p className="text-xs text-blue-200/80">50 games per page</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
        <div className="mb-5">
          <h2 className="text-xl font-black">Select Category & Provider</h2>
          <p className="text-sm text-slate-400">
            Provider games will load from Oracle API by providerCode.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Select Category</label>

            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option className="bg-[#050607]" value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Choose category..."}
              </option>

              {categories.map((category) => (
                <option
                  className="bg-[#050607]"
                  key={category._id}
                  value={category._id}
                >
                  {category.categoryName?.en} • {category.categoryName?.bn}
                </option>
              ))}
            </select>

            {selectedCategoryId && (
              <p className="mt-2 text-xs text-[#3ea0ff]/90">
                Selected:{" "}
                <span className="font-black">{selectedCategoryName}</span>
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Select Provider</label>

            <select
              value={selectedProviderDbId}
              onChange={(e) => handleProviderChange(e.target.value)}
              disabled={!selectedCategoryId || loadingProviders}
              className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <option className="bg-[#050607]" value="">
                {!selectedCategoryId
                  ? "Select category first"
                  : loadingProviders
                    ? "Loading providers..."
                    : "Choose provider..."}
              </option>

              {providers.map((provider) => (
                <option
                  className="bg-[#050607]"
                  key={provider._id}
                  value={provider._id}
                >
                  {provider.providerName} ({provider.providerCode})
                </option>
              ))}
            </select>

            {selectedProvider && (
              <p className="mt-2 text-xs text-[#3ea0ff]/90">
                Provider Code:{" "}
                <span className="font-mono font-black">
                  {selectedProvider.providerCode}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {selectedProviderDbId && providerGames.length > 0 && !loadingGames && (
        <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-xl font-black">Bulk Actions</h2>
              <p className="text-sm text-slate-400">
                This page selected{" "}
                <span className="font-black text-[#3ea0ff]">
                  {selectedCountThisPage}/{paginatedGames.length}
                </span>{" "}
                games
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_160px_170px_170px]">
              <div className="flex items-center gap-3 rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3">
                <Search className="h-5 w-5 text-[#3ea0ff]" />

                <input
                  value={searchGame}
                  onChange={(e) => {
                    setSearchGame(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search game name, uid, category..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                />
              </div>

              <button
                type="button"
                onClick={loadOracleGames}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
              >
                <RefreshCw className="h-4 w-4" />
                Reload
              </button>

              <button
                type="button"
                onClick={handleSelectAllThisPage}
                disabled={bulkLoading || allSelectedThisPage}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Select All Page
              </button>

              <button
                type="button"
                onClick={handleRemoveAllThisPage}
                disabled={bulkLoading || selectedCountThisPage === 0}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Remove All Page
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-6">
            {FLAG_FIELDS.map((flag) => (
              <ToggleCard
                key={flag.key}
                title={`Bulk ${flag.title}`}
                subtitle="Apply when adding"
                checked={form[flag.key]}
                icon={flag.icon}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, [flag.key]: value }))
                }
              />
            ))}

            <div>
              <label className={labelClass}>Oracle Image Type</label>
              <select
                value={form.oracleImageType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    oracleImageType: e.target.value,
                  }))
                }
                className={`${inputClass} cursor-pointer`}
              >
                <option className="bg-[#050607]" value="thumbnail">
                  Thumbnail
                </option>
                <option className="bg-[#050607]" value="height">
                  Height
                </option>
                <option className="bg-[#050607]" value="original">
                  Original
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Bulk Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
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
        </section>
      )}

      {providerGames.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-black/35 p-4">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-2 text-sm font-bold text-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm font-bold text-slate-300">
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-2 text-sm font-bold text-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {!selectedProviderDbId ? (
        <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-10 text-center shadow-2xl">
          <Gamepad2 className="mx-auto mb-4 h-14 w-14 text-slate-500" />
          <h3 className="text-xl font-black">Select category and provider</h3>
        </section>
      ) : loadingGames || loadingSelectedGames ? (
        <section className="flex min-h-[320px] items-center justify-center rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-10 shadow-2xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#3ea0ff]" />
        </section>
      ) : providerGames.length === 0 ? (
        <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-10 text-center shadow-2xl">
          <Gamepad2 className="mx-auto mb-4 h-14 w-14 text-slate-500" />
          <h3 className="text-xl font-black">No games available</h3>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paginatedGames.map((game) => {
            const gameUId = getOracleGameId(game);
            const selected = isGameSelected(gameUId);
            const selectedDoc = getSelectedGame(gameUId);
            const displayName = game.name || "Unnamed Game";
            const imageType =
              selectedDoc?.oracleImageType || form.oracleImageType;

            const imageToShow = selectedDoc?.image
              ? fileUrl(selectedDoc.image)
              : getOracleGameImage(game, imageType);

            return (
              <div
                key={gameUId}
                className={`overflow-hidden rounded-2xl border bg-black/30 shadow-xl transition hover:-translate-y-1 ${
                  selected
                    ? "border-emerald-400/50 shadow-emerald-950/30"
                    : "border-[#1A79D3]/20 hover:border-[#3ea0ff]/50"
                }`}
              >
                <div className="relative h-48 bg-black/40">
                  {imageToShow ? (
                    <img
                      src={imageToShow}
                      alt={displayName}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-600">
                      <ImagePlus className="h-10 w-10" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {selected && (
                    <div className="absolute right-3 top-3 rounded-xl bg-emerald-500 px-3 py-1 text-xs font-black text-white">
                      SELECTED
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {FLAG_FIELDS.map((flag) => {
                      const active = selected
                        ? selectedDoc?.[flag.key]
                        : form[flag.key];

                      if (!active) return null;

                      return (
                        <span
                          key={flag.key}
                          className="rounded-full bg-[#3ea0ff] px-3 py-1 text-xs font-black text-white"
                        >
                          {flag.title}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-black text-blue-100">
                    {displayName}
                  </h3>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <p className="truncate">game_uid: {gameUId || "—"}</p>
                    <p className="truncate">
                      Provider: {game.provider || selectedProviderCode || "—"}
                    </p>
                    <p className="truncate">Category: {game.category || "—"}</p>
                    <p className="truncate">
                      Image Type:{" "}
                      {selectedDoc?.oracleImageType || form.oracleImageType}
                    </p>
                  </div>

                  {!selected && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-bold text-blue-100">
                        Custom Image Optional
                      </label>

                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 px-4 py-3 text-sm font-black text-blue-100 hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
                        <UploadCloud className="h-5 w-5" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              image: e.target.files?.[0] || null,
                            }))
                          }
                          className="hidden"
                        />
                      </label>

                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Custom Preview"
                          className="mt-3 h-28 w-full rounded-xl object-cover"
                        />
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelectGame(game)}
                    className={`mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
                      selected
                        ? "border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                        : "bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white"
                    }`}
                  >
                    {selected ? (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Add to Platform
                      </>
                    )}
                  </button>

                  {selected && (
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedDoc, game)}
                      className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Image / Flags
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {providerGames.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-black/35 p-4">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-2 text-sm font-bold text-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm font-bold text-slate-300">
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-2 text-sm font-bold text-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[72vh] w-full max-w-[850px] overflow-y-auto rounded-3xl border border-[#1A79D3]/25 bg-[#050607] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Edit Game</h2>
                <p className="text-sm text-slate-400">
                  Update custom image, Oracle image type, flags and status.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-xl bg-[#1A79D3]/10 p-2 hover:bg-[#1A79D3]/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className={labelClass}>Game Preview</label>

                <div className="overflow-hidden rounded-2xl border border-[#1A79D3]/20 bg-black/40">
                  {editPreview ? (
                    <img
                      src={editPreview}
                      alt="Preview"
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-slate-600">
                      <ImagePlus className="h-12 w-12" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Oracle Image Type</label>

                <select
                  value={editForm.oracleImageType}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      oracleImageType: e.target.value,
                    }))
                  }
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-[#050607]" value="thumbnail">
                    Thumbnail
                  </option>
                  <option className="bg-[#050607]" value="height">
                    Height
                  </option>
                  <option className="bg-[#050607]" value="original">
                    Original
                  </option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Upload Custom Image</label>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 px-4 py-4 text-sm font-black text-blue-100 hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
                  <UploadCloud className="h-5 w-5" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        image: e.target.files?.[0] || null,
                      }))
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {FLAG_FIELDS.map((flag) => (
                  <ToggleCard
                    key={flag.key}
                    title={flag.title}
                    subtitle="Show badge / filter"
                    checked={editForm[flag.key]}
                    icon={flag.icon}
                    onChange={(value) =>
                      setEditForm((prev) => ({
                        ...prev,
                        [flag.key]: value,
                      }))
                    }
                  />
                ))}
              </div>

              <div>
                <label className={labelClass}>Status</label>

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
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

              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="submit"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={handleRemoveCustomImage}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-yellow-300/20 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-500/20"
                >
                  Remove Custom Image
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleCard = ({ title, subtitle, checked, onChange, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#1A79D3]/20 bg-black/40 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A79D3]/15 text-[#3ea0ff]">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-16 cursor-pointer rounded-full transition ${
          checked ? "bg-[#1A79D3]" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
            checked ? "left-9" : "left-1"
          }`}
        />
      </button>
    </div>
  );
};

export default Game;
