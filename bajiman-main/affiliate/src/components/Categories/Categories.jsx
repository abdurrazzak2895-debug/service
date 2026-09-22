import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import HotsGame from "../HotsGame/HotsGame";
import Sports from "../Sports/Sports";
import Providers from "../Providers/Providers";
import {
  selectGameCategories,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";
import {
  selectCategorySectionSetting,
  selectGlobalLoading,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const defaultCategorySetting = {
  sectionBg: "#0b66a8",
  navBg: "#074b7f",
  activeItemBg: "#0b66a8",
  inactiveItemBg: "#074b7f",
  itemTextColor: "#ffffff",
  activeBorderColor: "#1fa7ff",
  hotImage: "",
  sportsImage: "",
  hotImageUrl: "",
  sportsImageUrl: "",
};

const fallbackHotIcon =
  "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-hotgame.png?v=1779771685731";

const fallbackSportsIcon =
  "https://img.c88rx.com/cx/h5/assets/images/icon-set/theme-icon/nav/icon-sport.png?v=1779771685731";

const Categories = () => {
  const [activeKey, setActiveKey] = useState("hot");
  const { isBangla } = useLanguage();

  const dbCategories = useSelector(selectGameCategories);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const categorySectionSetting = useSelector(selectCategorySectionSetting);

  const setting = {
    ...defaultCategorySetting,
    ...(categorySectionSetting || {}),
  };

  const showSkeleton = loading || !loaded || globalLoading || !globalLoaded;

  const staticCategories = useMemo(
    () => [
      {
        key: "hot",
        name: { bn: "হট গেম", en: "Hot Game" },
        icon:
          setting.hotImageUrl ||
          makeImageUrl(setting.hotImage) ||
          fallbackHotIcon,
        type: "hot",
      },
      {
        key: "sports",
        name: { bn: "স্পোর্ট", en: "Sports" },
        icon:
          setting.sportsImageUrl ||
          makeImageUrl(setting.sportsImage) ||
          fallbackSportsIcon,
        type: "sports",
      },
    ],
    [
      setting.hotImage,
      setting.hotImageUrl,
      setting.sportsImage,
      setting.sportsImageUrl,
    ],
  );

  const categories = useMemo(() => {
    const dynamicCategories = Array.isArray(dbCategories)
      ? dbCategories.map((item) => ({
          key: item?._id,
          id: item?._id,
          name: {
            bn: item?.categoryName?.bn || item?.categoryTitle?.bn || "",
            en: item?.categoryName?.en || item?.categoryTitle?.en || "",
          },
          icon: item?.iconImageUrl || makeImageUrl(item?.iconImage),
          type: "category",
          raw: item,
        }))
      : [];

    return [...staticCategories, ...dynamicCategories];
  }, [dbCategories, staticCategories]);

  const activeCategory = categories.find((item) => item.key === activeKey);

  return (
    <>
      <section
        className="w-full md:bg-transparent"
        style={{ backgroundColor: setting.sectionBg }}
      >
        <div className="mx-auto w-full max-w-[480px] md:max-w-[1125px]">
          <div
            className="no-scrollbar flex overflow-x-auto md:rounded-sm"
            style={{ backgroundColor: setting.navBg }}
          >
            {showSkeleton ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="relative flex h-[88px] min-w-[72px] flex-col items-center justify-center gap-[8px] md:min-w-[100px]"
                    style={{ backgroundColor: setting.navBg }}
                  >
                    <div className="h-[36px] w-[36px] animate-pulse rounded-full bg-white/25" />
                    <div className="h-[12px] w-[48px] animate-pulse rounded bg-white/25" />
                  </div>
                ))}
              </>
            ) : (
              categories.map((item) => {
                const isActive = activeKey === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveKey(item.key)}
                    className="relative flex h-[88px] min-w-[72px] cursor-pointer flex-col items-center justify-center gap-[8px] transition-all duration-200 md:min-w-[100px]"
                    style={{
                      backgroundColor: isActive
                        ? setting.activeItemBg
                        : setting.inactiveItemBg,
                    }}
                  >
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={isBangla ? item.name.bn : item.name.en}
                        className="h-[36px] w-[36px] object-contain"
                        draggable="false"
                      />
                    ) : (
                      <div className="h-[36px] w-[36px]" />
                    )}

                    <span
                      className="text-[14px] font-bold leading-none drop-shadow-sm"
                      style={{ color: setting.itemTextColor }}
                    >
                      {isBangla ? item.name.bn : item.name.en}
                    </span>

                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 h-[3px] w-full"
                        style={{ backgroundColor: setting.activeBorderColor }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
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

      {activeKey === "hot" && <HotsGame />}

      {activeKey === "sports" && <Sports />}

      {activeKey !== "hot" && activeKey !== "sports" && activeCategory && (
        <Providers
          title={isBangla ? activeCategory?.name?.bn : activeCategory?.name?.en}
          categoryId={activeCategory?.id}
        />
      )}
    </>
  );
};

export default Categories;
