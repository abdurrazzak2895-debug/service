import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchGlobalGameData,
  fetchScopedCatalog,
  fetchSearchCatalog,
} from "../../features/globalGame/globalGameSlice";
import {
  selectProvidersByCategory,
  selectGameCategories,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
  selectScopedCatalog,
  selectScopedCatalogKey,
  selectScopedCatalogLoading,
  selectSearchCatalog,
  selectSearchCatalogLoading,
  selectSearchCatalogLoaded,
} from "../../features/globalGame/globalGameSelectors";
import { selectHomePageContentColorSetting } from "../../features/global/globalSelectors";
import JackpotBanner from "../../components/JackpotBanner/JackpotBanner";

const PER_PAGE = 24;

// Games missing a real name or an image render as broken/placeholder
// cards, so they're dropped from every view (browse, filter, search) —
// and pagination is computed after this filter so no empty "phantom"
// pages are left behind for the games that got dropped.
const hasNameAndImage = (game) => {
  const name = String(
    game?.oracleGame?.name || game?.name || game?.gameName || "",
  ).trim();

  const image = String(game?.imageUrl || "").trim();

  return Boolean(name) && Boolean(image);
};

const defaultContentColors = {
  pageBg: "#f1f1f1",
  sectionBg: "transparent",
  sectionTitleText: "#111111",
  sectionBarBg: "#0b66a8",

  cardBg: "#ffffff",
  cardBorder: "transparent",
  cardText: "#111111",
  cardHoverShadow: "rgba(0,0,0,0.12)",

  imageBoxBg: "#0b4f83",
  imagePlaceholderText: "#ffffff",

  skeletonBg: "#e5e7eb",

  buttonBg: "#005eb8",
  buttonText: "#ffffff",
  inactiveButtonBg: "#ffffff",
  inactiveButtonText: "#333333",

  inputBg: "#ffffff",
  inputText: "#333333",
  inputBorder: "transparent",
  inputFocusBorder: "#005eb8",

  emptyText: "#555555",

  paginationBg: "#ffffff",
  paginationText: "#333333",
  paginationDisabledOpacity: "0.50",
};

const Games = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBangla } = useLanguage();

  const homePageContentColorSetting = useSelector(
    selectHomePageContentColorSetting,
  );

  const colors = {
    ...defaultContentColors,
    ...(homePageContentColorSetting || {}),
  };

  const categoryId = searchParams.get("categoryId") || "";
  const providerDbId = searchParams.get("providerDbId") || "all";
  const effectiveProviderId = providerDbId !== "all" ? providerDbId : "";

  const categories = useSelector(selectGameCategories);
  const providersByCategory = useSelector(selectProvidersByCategory);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const scopedCatalog = useSelector(selectScopedCatalog);
  const scopedCatalogKey = useSelector(selectScopedCatalogKey);
  const scopedCatalogLoading = useSelector(selectScopedCatalogLoading);

  const searchCatalog = useSelector(selectSearchCatalog);
  const searchCatalogLoading = useSelector(selectSearchCatalogLoading);
  const searchCatalogLoaded = useSelector(selectSearchCatalogLoaded);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  const isSearching = Boolean(search.trim());
  const scopeKey = `${categoryId}|${effectiveProviderId}`;

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchGlobalGameData());
    }
  }, [dispatch, loaded]);

  // Browse view needs the full category/provider list (not just one
  // server-paginated page) so games without a name/image can be filtered
  // out client-side and pagination still lines up with what's actually
  // shown — no leftover "phantom" pages for the games that got dropped.
  useEffect(() => {
    dispatch(
      fetchScopedCatalog({
        categoryId: categoryId || undefined,
        providerDbId: effectiveProviderId || undefined,
      }),
    );
  }, [dispatch, categoryId, effectiveProviderId]);

  // Full site-wide catalog is only fetched the first time the user
  // actually searches (once categories have loaded, since the fetch runs
  // one request per category), then reused for every keystroke so search
  // matches every game site-wide instead of just the current category.
  useEffect(() => {
    if (
      isSearching &&
      loaded &&
      !searchCatalogLoaded &&
      !searchCatalogLoading
    ) {
      dispatch(fetchSearchCatalog());
    }
  }, [
    isSearching,
    loaded,
    searchCatalogLoaded,
    searchCatalogLoading,
    dispatch,
  ]);

  const resetKey = `${scopeKey}|${isSearching ? search.trim().toLowerCase() : ""}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const providers = useMemo(() => {
    const list = providersByCategory?.[categoryId];
    return Array.isArray(list) ? list : [];
  }, [providersByCategory, categoryId]);

  const category = useMemo(() => {
    return categories.find((item) => String(item._id) === String(categoryId));
  }, [categories, categoryId]);

  const title = isBangla
    ? category?.categoryName?.bn || category?.categoryTitle?.bn || "গেমস"
    : category?.categoryName?.en || category?.categoryTitle?.en || "Games";

  // Browse uses the full scoped (category/provider) catalog; search uses
  // the full site-wide catalog. Either way we filter client-side and
  // paginate the filtered result ourselves, so pages always match what's
  // actually visible.
  const filteredGames = useMemo(() => {
    let list = isSearching ? searchCatalog : scopedCatalog;
    list = Array.isArray(list) ? list : [];

    list = list.filter(hasNameAndImage);

    if (filter) {
      list = list.filter((game) => Boolean(game?.[filter]));
    }

    if (isSearching) {
      const q = search.trim().toLowerCase();

      list = list.filter((game) => {
        const name = String(
          game?.oracleGame?.name ||
            game?.name ||
            game?.gameName ||
            game?.gameUId ||
            "",
        ).toLowerCase();

        const uid = String(game?.gameUId || "").toLowerCase();
        const provider = String(
          game?.provider?.providerName || game?.provider?.providerCode || "",
        ).toLowerCase();

        return name.includes(q) || uid.includes(q) || provider.includes(q);
      });
    }

    return list;
  }, [scopedCatalog, searchCatalog, isSearching, filter, search]);

  const totalGames = filteredGames.length;
  const totalPages = Math.max(Math.ceil(totalGames / PER_PAGE), 1);

  const paginatedGames = useMemo(
    () => filteredGames.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filteredGames, page],
  );

  const pageNumbers = useMemo(() => {
    const delta = 1;
    const range = [];

    for (let i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    const withDots = [];
    let prev = 0;

    range.forEach((i) => {
      if (prev) {
        if (i - prev === 2) {
          withDots.push(prev + 1);
        } else if (i - prev > 1) {
          withDots.push(`dots-${i}`);
        }
      }

      withDots.push(i);
      prev = i;
    });

    return withDots;
  }, [page, totalPages]);

  const handleProviderChange = (providerId) => {
    setSearchParams({
      categoryId,
      providerDbId: providerId,
    });
  };

  const handleGameClick = (game) => {
    if (!game?.gameId) return;
    navigate(`/play-game/${game.gameId}?uid=${game.gameUId || ""}`);
  };

  const showProvidersSkeleton = loading || !loaded;
  const showGamesSkeleton = isSearching
    ? !searchCatalogLoaded
    : scopedCatalogLoading || scopedCatalogKey !== scopeKey;

  return (
    <section
      className="w-full pb-6 pt-3"
      style={{ backgroundColor: colors.pageBg }}
    >
      <div className="mx-auto w-full max-w-[480px] px-2 md:max-w-[1200px] md:px-0">
        <JackpotBanner />

        <div className="mb-4 flex items-center gap-2">
          <div className="provider-scroll flex flex-1 gap-[10px] overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => handleProviderChange("all")}
              className="h-[30px] min-w-[94px] cursor-pointer rounded-[3px] text-[13px] font-medium"
              style={{
                backgroundColor:
                  providerDbId === "all"
                    ? colors.buttonBg
                    : colors.inactiveButtonBg,
                color:
                  providerDbId === "all"
                    ? colors.buttonText
                    : colors.inactiveButtonText,
              }}
            >
              ALL
            </button>

            {showProvidersSkeleton
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[30px] min-w-[94px] animate-pulse rounded-[3px]"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                ))
              : providers.map((provider) => {
                  const id = provider?._id || provider?.id;
                  const active = String(providerDbId) === String(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleProviderChange(id)}
                      className="h-[30px] min-w-[94px] cursor-pointer truncate rounded-[3px] px-2 text-[13px] font-medium"
                      style={{
                        backgroundColor: active
                          ? colors.buttonBg
                          : colors.inactiveButtonBg,
                        color: active
                          ? colors.buttonText
                          : colors.inactiveButtonText,
                      }}
                    >
                      {provider?.providerName || provider?.providerCode}
                    </button>
                  );
                })}
          </div>

          <button
            type="button"
            className="flex h-[40px] w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-[3px]"
            style={{
              backgroundColor: colors.buttonBg,
              color: colors.buttonText,
            }}
          >
            <Search size={20} />
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex h-[30px] items-center">
            <span
              className="mr-1 h-[15px] w-[4px] rounded-full"
              style={{ backgroundColor: colors.sectionBarBg }}
            />
            <h2
              className="text-[14px] font-semibold"
              style={{ color: colors.sectionTitleText }}
            >
              {title}
            </h2>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-[28px] w-[120px] rounded-[3px] px-2 text-[12px] outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
              border: `1px solid ${colors.inputBorder}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.inputFocusBorder;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.inputBorder;
            }}
          >
            <option value="">Filter</option>
            <option value="isHot">Hot</option>
            <option value="isFavorites">Favorites</option>
            <option value="isLatest">Latest</option>
            <option value="isAZ">A-Z</option>
          </select>
        </div>

        <div className="mb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBangla ? "গেম সার্চ করুন..." : "Search game..."}
            className="h-[34px] w-full rounded-[3px] px-3 text-[13px] outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.inputText,
              border: `1px solid ${colors.inputBorder}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.inputFocusBorder;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = colors.inputBorder;
            }}
          />

          {isSearching && searchCatalogLoading && !searchCatalogLoaded && (
            <p
              className="mt-1 text-[11px]"
              style={{ color: colors.emptyText }}
            >
              {isBangla
                ? "সব গেম লোড হচ্ছে... (শুধু প্রথমবার)"
                : "Loading all games... (first time only)"}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-[8px] md:grid-cols-6 md:gap-[16px]">
          {showGamesSkeleton
            ? Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[3px]"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div
                    className="h-[100px] animate-pulse md:h-[120px]"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                  <div className="h-[34px] px-2 py-[7px]">
                    <div
                      className="h-[13px] w-[80%] animate-pulse rounded"
                      style={{ backgroundColor: colors.skeletonBg }}
                    />
                  </div>
                </div>
              ))
            : paginatedGames.map((game) => {
                const gameName =
                  game?.oracleGame?.name ||
                  game?.name ||
                  game?.gameName ||
                  game?.gameUId ||
                  "Game";

                return (
                  <button
                    key={game?.gameId || game?._id}
                    type="button"
                    onClick={() => handleGameClick(game)}
                    className="block cursor-pointer overflow-hidden rounded-[3px] text-left transition"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 2px 8px ${colors.cardHoverShadow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      className="h-[100px] w-full overflow-hidden md:h-[120px]"
                      style={{ backgroundColor: colors.imageBoxBg }}
                    >
                      <img
                        src={game.imageUrl}
                        alt={gameName}
                        className="h-full w-full"
                        draggable="false"
                      />
                    </div>

                    <p
                      className="h-[34px] w-full truncate px-2 py-[7px] text-[13px] leading-none md:text-[14px]"
                      style={{ color: colors.cardText }}
                    >
                      {gameName}
                    </p>
                  </button>
                );
              })}
        </div>

        {!showGamesSkeleton && paginatedGames.length === 0 && (
          <div
            className="py-10 text-center text-[14px]"
            style={{ color: colors.emptyText }}
          >
            {isBangla ? "কোনো গেম পাওয়া যায়নি" : "No games found"}
          </div>
        )}

        {!showGamesSkeleton && totalGames > 0 && (
          <div className="mt-5">
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-[6px]">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="h-[32px] cursor-pointer rounded-[4px] px-3 text-[13px] font-medium disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.paginationBg,
                    color: colors.paginationText,
                    border: `1px solid ${colors.skeletonBg}`,
                    opacity:
                      page <= 1
                        ? colors.paginationDisabledOpacity || "0.50"
                        : "1",
                  }}
                >
                  Prev
                </button>

                {pageNumbers.map((item) =>
                  typeof item === "number" ? (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className="h-[32px] min-w-[32px] cursor-pointer rounded-[4px] px-2 text-[13px] transition"
                      style={{
                        backgroundColor:
                          item === page
                            ? colors.buttonBg
                            : colors.paginationBg,
                        color:
                          item === page
                            ? colors.buttonText
                            : colors.paginationText,
                        border:
                          item === page
                            ? "none"
                            : `1px solid ${colors.skeletonBg}`,
                        fontWeight: item === page ? 700 : 500,
                      }}
                    >
                      {item}
                    </button>
                  ) : (
                    <span
                      key={item}
                      className="px-1 text-[13px] select-none"
                      style={{
                        color: colors.paginationText,
                        opacity: colors.paginationDisabledOpacity || "0.50",
                      }}
                    >
                      …
                    </span>
                  ),
                )}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="h-[32px] cursor-pointer rounded-[4px] px-3 text-[13px] font-medium disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: colors.paginationBg,
                    color: colors.paginationText,
                    border: `1px solid ${colors.skeletonBg}`,
                    opacity:
                      page >= totalPages
                        ? colors.paginationDisabledOpacity || "0.50"
                        : "1",
                  }}
                >
                  Next
                </button>
              </div>
            )}

            <div
              className="mt-2 text-center text-[12px]"
              style={{ color: colors.emptyText }}
            >
              {isBangla
                ? `পেজ ${page}/${totalPages} • মোট ${totalGames}`
                : `Page ${page}/${totalPages} • Total ${totalGames}`}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .provider-scroll::-webkit-scrollbar {
          display: none;
        }

        .provider-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (min-width: 768px) {
          .provider-scroll::-webkit-scrollbar {
            display: block;
            height: 5px;
          }

          .provider-scroll::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.25);
            border-radius: 20px;
          }

          .provider-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .provider-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
          }
        }
      `}</style>
    </section>
  );
};

export default Games;
