import React from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectSports,
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

const Sports = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const sports = useSelector(selectSports);
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

  const handleSportClick = (item) => {
    const gameId = item?.gameId || "";
    if (!gameId) return;

    navigate(`/play-game/${gameId}?uid=${gameId}`);
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
            {isBangla ? "স্পোর্টস" : "SPORTS"}
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-[6px] px-[6px] md:grid-cols-8 md:gap-[10px]">
          {showSkeleton
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[78px] flex-col items-center justify-center overflow-hidden px-1"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div
                    className="mb-[5px] h-[38px] w-[58px] animate-pulse rounded"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                  <div
                    className="h-[12px] w-[70%] animate-pulse rounded"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                </div>
              ))
            : Array.isArray(sports) && sports.length > 0
              ? sports.map((item, index) => {
                  const name = isBangla
                    ? item?.name?.bn || item?.name?.en || ""
                    : item?.name?.en || item?.name?.bn || "";

                  const image = item?.iconImageUrl || "";

                  return (
                    <button
                      key={item?._id || item?.id || item?.gameId || index}
                      type="button"
                      onClick={() => handleSportClick(item)}
                      className="flex h-[78px] cursor-pointer flex-col items-center justify-center overflow-hidden px-1 transition"
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
                          alt={name}
                          className="mb-[5px] h-[38px] w-[58px] object-contain"
                          draggable="false"
                        />
                      ) : (
                        <div
                          className="mb-[5px] flex h-[38px] w-[58px] items-center justify-center text-[10px]"
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
                        {name}
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

export default Sports;
