import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectPopularGames,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";
import { selectHomePageContentColorSetting } from "../../features/global/globalSelectors";

import "swiper/css";
import "swiper/css/free-mode";

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

const PopularGames = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const popularGames = useSelector(selectPopularGames);
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
    const title = item?.gameTitle || item?.game?.gameTitle;
    const localizedTitle =
      typeof title === "string"
        ? title
        : isBangla
          ? title?.bn || title?.en
          : title?.en || title?.bn;

    return (
      localizedTitle ||
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
      className="mt-6 w-full px-2 pb-2 md:px-0"
      style={{ backgroundColor: colors.sectionBg }}
    >
      <div className="mx-auto w-full max-w-[480px] md:max-w-[1130px]">
        <div className="flex h-[30px] items-center">
          <span
            className="mr-2 h-[15px] w-[4px] rounded-full"
            style={{ backgroundColor: colors.sectionBarBg }}
          />
          <h2
            className="text-[14px] font-semibold"
            style={{ color: colors.sectionTitleText }}
          >
            {isBangla ? "জনপ্রিয় গেমস" : "Popular Games"}
          </h2>
        </div>

        {showSkeleton ? (
          <div className="grid grid-cols-2 gap-[8px] px-[6px] md:grid-cols-6 md:gap-[12px]">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="block w-full overflow-hidden rounded-[3px] text-left"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <div
                  className="h-[100px] w-full animate-pulse md:h-[120px]"
                  style={{ backgroundColor: colors.skeletonBg }}
                />
                <div className="h-[34px] px-2 py-[7px]">
                  <div
                    className="h-[13px] w-[80%] animate-pulse rounded"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, FreeMode]}
            loop={popularGames.length > 2}
            freeMode={true}
            speed={4000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            slidesPerView={2.15}
            spaceBetween={8}
            breakpoints={{
              0: {
                slidesPerView: 2.15,
                spaceBetween: 8,
              },
              768: {
                slidesPerView: 6,
                spaceBetween: 12,
              },
            }}
            className="px-[6px]"
          >
            {popularGames.map((item, index) => {
              const gameName = getGameName(item);
              const image = getGameImage(item);

              return (
                <SwiperSlide
                  key={item?._id || item?.id || item?.gameId || index}
                >
                  <button
                    type="button"
                    onClick={() => handleGameClick(item)}
                    className="block w-full cursor-pointer overflow-hidden rounded-[3px] text-left transition"
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
                      {image ? (
                        <img
                          src={image}
                          alt={gameName}
                          className="h-full w-full object-cover"
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
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default PopularGames;
