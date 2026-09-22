import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectProvidersByCategory,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";
import { selectHomePageContentColorSetting } from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL;

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

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const Providers = ({ title, categoryId }) => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const providersByCategory = useSelector(selectProvidersByCategory);
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

  const providers = useMemo(() => {
    if (!categoryId) return [];

    const list = providersByCategory?.[categoryId];

    return Array.isArray(list) ? list : [];
  }, [providersByCategory, categoryId]);

  const handleProviderClick = (provider) => {
    if (!provider?._id && !provider?.id) return;

    const providerId = provider?._id || provider?.id;

    navigate(`/games?categoryId=${categoryId}&providerDbId=${providerId}`);
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
            {title || (isBangla ? "প্রোভাইডার" : "PROVIDERS")}
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-[6px] px-[6px] md:grid-cols-8 md:gap-[10px]">
          {showSkeleton ? (
            <>
              {Array.from({ length: 16 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[78px] flex-col items-center justify-center overflow-hidden px-1"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div
                    className="mb-[6px] h-[34px] w-[70px] animate-pulse rounded"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                  <div
                    className="h-[12px] w-[55px] animate-pulse rounded"
                    style={{ backgroundColor: colors.skeletonBg }}
                  />
                </div>
              ))}
            </>
          ) : providers.length > 0 ? (
            providers.map((item) => {
              const providerId = item?._id || item?.id;
              const image =
                item?.providerIconUrl || makeImageUrl(item?.providerIcon);
              const name = item?.providerName || item?.providerCode || "";

              return (
                <button
                  key={providerId}
                  type="button"
                  onClick={() => handleProviderClick(item)}
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
                      className="mb-[6px] h-[34px] w-[70px] object-contain"
                      draggable="false"
                    />
                  ) : (
                    <div
                      className="mb-[6px] flex h-[34px] w-[70px] items-center justify-center text-[10px]"
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
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default Providers;
