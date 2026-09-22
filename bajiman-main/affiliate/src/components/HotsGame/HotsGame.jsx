import React from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectHotGames,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";
import { selectHomePageContentColorSetting } from "../../features/global/globalSelectors";

const defaultContentColors = {
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
};

const HotsGame = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const hotGames = useSelector(selectHotGames);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const homePageContentColorSetting = useSelector(
    selectHomePageContentColorSetting,
  );

  const colors = {
    ...defaultContentColors,
    ...(homePageContentColorSetting || {}),
  };

  const showSkeleton = loading || !loaded;

  const getGameId = (item) => {
    return item?.game?.gameId || item?.gameId || item?._id || "";
  };

  const getGameUId = (item) => {
    return item?.game?.gameUId || item?.gameUId || item?.gameId || "";
  };

  const getGameName = (item) => {
    return (
      item?.game?.oracleGame?.name ||
      item?.game?.name ||
      item?.game?.gameName ||
      item?.game?.gameUId ||
      item?.name ||
      item?.gameUId ||
      item?.gameId ||
      "Game"
    );
  };

  const getGameImage = (item) => {
    return (
      item?.imageUrl ||
      item?.game?.imageUrl ||
      item?.game?.customImageUrl ||
      item?.game?.oracleImageUrl ||
      item?.game?.oracleGame?.thumbnail ||
      item?.game?.oracleGame?.original ||
      ""
    );
  };

  const handleGameClick = (item) => {
    const gameId = getGameId(item);
    const gameUId = getGameUId(item);

    if (!gameId) return;

    navigate(`/play-game/${gameId}?uid=${gameUId}`);
  };

  return (
    <section
      className="w-full pb-2"
      style={{ backgroundColor: colors.sectionBg }}
    >
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1140px]">
        <div className="flex h-[30px] items-center px-2">
          <span
            className="mr-2 h-[15px] w-[4px] rounded-full"
            style={{ backgroundColor: colors.sectionBarBg }}
          />
          <h2
            className="text-[14px] font-semibold uppercase"
            style={{ color: colors.sectionTitleText }}
          >
            {isBangla ? "হট গেমস" : "HOT"}
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-[6px] px-[6px] md:grid-cols-8 md:gap-[10px]">
          {showSkeleton
            ? Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[78px] flex-col items-center justify-center overflow-hidden px-1 md:h-[78px]"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div
                    className="mb-[5px] h-[38px] w-[52px] animate-pulse rounded"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                  <div
                    className="h-[12px] w-[70%] animate-pulse rounded"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                </div>
              ))
            : Array.isArray(hotGames) && hotGames.length > 0
              ? hotGames.map((item, index) => {
                  const gameName = getGameName(item);
                  const image = getGameImage(item);

                  return (
                    <button
                      key={item?._id || item?.id || item?.gameId || index}
                      type="button"
                      onClick={() => handleGameClick(item)}
                      className="flex h-[78px] cursor-pointer flex-col items-center justify-center overflow-hidden px-1 transition md:h-[78px]"
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
                      {image ? (
                        <img
                          src={image}
                          alt={gameName}
                          className="mb-[5px] h-[38px] w-[52px] object-contain"
                          draggable="false"
                        />
                      ) : (
                        <div
                          className="mb-[5px] flex h-[38px] w-[52px] items-center justify-center text-[10px]"
                          style={{
                            backgroundColor: colors.imageBoxBg,
                            color: colors.imagePlaceholderText,
                          }}
                        >
                          No Image
                        </div>
                      )}

                      <p
                        className="w-full truncate text-center text-[12px] leading-none md:text-[14px]"
                        style={{ color: colors.cardText }}
                      >
                        {gameName}
                      </p>
                    </button>
                  );
                })
              : null}
        </div>
      </div>
    </section>
  );
};

export default HotsGame;
