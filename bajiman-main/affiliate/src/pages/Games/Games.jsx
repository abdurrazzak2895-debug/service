import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchGlobalGameData } from "../../features/globalGame/globalGameSlice";
import {
  selectGlobalGames,
  selectProvidersByCategory,
  selectGameCategories,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";
import { selectHomePageContentColorSetting } from "../../features/global/globalSelectors";

const PER_PAGE = 24;

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

  const games = useSelector(selectGlobalGames);
  const categories = useSelector(selectGameCategories);
  const providersByCategory = useSelector(selectProvidersByCategory);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchGlobalGameData());
    }
  }, [dispatch, loaded]);

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

  const filteredGames = useMemo(() => {
    let list = Array.isArray(games) ? games : [];

    if (categoryId) {
      list = list.filter(
        (game) => String(game.categoryId) === String(categoryId),
      );
    }

    if (providerDbId && providerDbId !== "all") {
      list = list.filter(
        (game) => String(game.providerDbId) === String(providerDbId),
      );
    }

    if (filter) {
      list = list.filter((game) => Boolean(game?.[filter]));
    }

    if (search.trim()) {
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
  }, [games, categoryId, providerDbId, filter, search]);

  const totalPages = Math.ceil(filteredGames.length / PER_PAGE) || 1;

  const paginatedGames = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredGames.slice(start, start + PER_PAGE);
  }, [filteredGames, page]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, providerDbId, filter, search]);

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

  const showSkeleton = loading || !loaded;

  return (
    <section
      className="w-full pb-6 pt-3"
      style={{ backgroundColor: colors.pageBg }}
    >
      <div className="mx-auto w-full max-w-[480px] px-2 md:max-w-[1200px] md:px-0">
        <div className="mb-4 flex items-center gap-2">
          <div className="no-scrollbar flex flex-1 gap-[10px] overflow-x-auto">
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

            {showSkeleton
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
        </div>

        <div className="grid grid-cols-2 gap-[8px] md:grid-cols-6 md:gap-[16px]">
          {showSkeleton
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
                      {game?.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt={gameName}
                          className="h-full w-full"
                          draggable="false"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-[12px]"
                          style={{ color: colors.imagePlaceholderText }}
                        >
                          No Image
                        </div>
                      )}
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

        {!showSkeleton && paginatedGames.length === 0 && (
          <div
            className="py-10 text-center text-[14px]"
            style={{ color: colors.emptyText }}
          >
            {isBangla ? "কোনো গেম পাওয়া যায়নি" : "No games found"}
          </div>
        )}

        {!showSkeleton && totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="h-[32px] cursor-pointer rounded-[3px] px-3 text-[13px] disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.paginationBg,
                color: colors.paginationText,
                opacity:
                  page <= 1 ? colors.paginationDisabledOpacity || "0.50" : "1",
              }}
            >
              Prev
            </button>

            <span
              className="text-[13px]"
              style={{ color: colors.paginationText }}
            >
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="h-[32px] cursor-pointer rounded-[3px] px-3 text-[13px] disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.paginationBg,
                color: colors.paginationText,
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
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Games;
