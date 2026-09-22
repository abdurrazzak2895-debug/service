import React, { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { useLanguage } from "../../Context/LanguageProvider";
import SliderPromoModal from "../SliderPromoModal/SliderPromoModal";
import {
  selectSliders,
  selectGlobalLoading,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL;

const defaultColors = {
  sectionBg: "#0B66A8",
  desktopSectionBg: "#f5f5f5",
  slideBg: "#082056",
  arrowColor: "#9ca3af",
  arrowHoverColor: "#4b5563",
  paginationBg: "#7aa7d9",
  paginationActiveBg: "#2f79c9",
  mobileSkeletonBg: "rgba(255,255,255,0.2)",
  desktopSkeletonBg: "#d1d5db",
  skeletonDotBg: "rgba(122,167,217,0.5)",
  skeletonDotActiveBg: "#7aa7d9",
};

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
};

const getColor = (slider, key) => {
  return slider?.[key] || defaultColors[key];
};

const Slider = () => {
  const { isBangla } = useLanguage();
  const sliders = useSelector(selectSliders);
  const loading = useSelector(selectGlobalLoading);
  const loaded = useSelector(selectGlobalLoaded);

  const [activePromo, setActivePromo] = useState(null);

  const handleSlideClick = (slider) => {
    if (slider?.mode === "promo") {
      setActivePromo(slider);
      return;
    }

    if (slider?.link) {
      window.open(slider.link, "_blank", "noopener,noreferrer");
    }
  };

  const showSkeleton = loading || !loaded;
  const hasSliders = Array.isArray(sliders) && sliders.length > 0;

  const colorSource = useMemo(() => {
    if (hasSliders) return sliders[0];
    return defaultColors;
  }, [hasSliders, sliders]);

  const colors = {
    sectionBg: getColor(colorSource, "sectionBg"),
    desktopSectionBg: getColor(colorSource, "desktopSectionBg"),
    slideBg: getColor(colorSource, "slideBg"),
    arrowColor: getColor(colorSource, "arrowColor"),
    arrowHoverColor: getColor(colorSource, "arrowHoverColor"),
    paginationBg: getColor(colorSource, "paginationBg"),
    paginationActiveBg: getColor(colorSource, "paginationActiveBg"),
    mobileSkeletonBg: getColor(colorSource, "mobileSkeletonBg"),
    desktopSkeletonBg: getColor(colorSource, "desktopSkeletonBg"),
    skeletonDotBg: getColor(colorSource, "skeletonDotBg"),
    skeletonDotActiveBg: getColor(colorSource, "skeletonDotActiveBg"),
  };

  const activePromoTitle = activePromo
    ? (isBangla ? activePromo.promoTitle?.bn : activePromo.promoTitle?.en) ||
      activePromo.promoTitle?.en ||
      activePromo.promoTitle?.bn ||
      ""
    : "";

  const activePromoDescription = activePromo
    ? (isBangla
        ? activePromo.promoDescription?.bn
        : activePromo.promoDescription?.en) ||
      activePromo.promoDescription?.en ||
      activePromo.promoDescription?.bn ||
      ""
    : "";

  return (
    <>
    <section
      className="slider-section w-full overflow-hidden py-4"
      style={{
        "--slider-mobile-section-bg": colors.sectionBg,
        "--slider-desktop-section-bg": colors.desktopSectionBg,
        "--slider-slide-bg": colors.slideBg,
        "--slider-arrow-color": colors.arrowColor,
        "--slider-arrow-hover-color": colors.arrowHoverColor,
        "--slider-pagination-bg": colors.paginationBg,
        "--slider-pagination-active-bg": colors.paginationActiveBg,
        "--slider-mobile-skeleton-bg": colors.mobileSkeletonBg,
        "--slider-desktop-skeleton-bg": colors.desktopSkeletonBg,
        "--slider-skeleton-dot-bg": colors.skeletonDotBg,
        "--slider-skeleton-dot-active-bg": colors.skeletonDotActiveBg,
      }}
    >
      <div className="relative mx-auto w-full max-w-[480px] overflow-hidden md:max-w-[1200px] md:px-10">
        {showSkeleton ? (
          <>
            <div className="block md:hidden">
              <div className="slider-mobile-skeleton h-[130px] w-full animate-pulse rounded-[3px]" />

              <div className="mt-3 flex justify-center gap-[6px]">
                <div className="slider-skeleton-dot-active h-[2px] w-[20px] animate-pulse rounded-full" />
                <div className="slider-skeleton-dot h-[2px] w-[20px] animate-pulse rounded-full" />
                <div className="slider-skeleton-dot h-[2px] w-[20px] animate-pulse rounded-full" />
              </div>
            </div>

            <div className="hidden md:block">
              <div className="slider-desktop-skeleton h-[300px] w-full animate-pulse rounded-[3px]" />

              <div className="mt-3 flex justify-center gap-[6px]">
                <div className="slider-skeleton-dot-active h-[2px] w-[20px] animate-pulse rounded-full" />
                <div className="slider-skeleton-dot h-[2px] w-[20px] animate-pulse rounded-full" />
                <div className="slider-skeleton-dot h-[2px] w-[20px] animate-pulse rounded-full" />
              </div>
            </div>
          </>
        ) : hasSliders ? (
          <>
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              loop={true}
              speed={900}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
                el: ".custom-slider-pagination",
              }}
              navigation={{
                nextEl: ".custom-slider-next",
                prevEl: ".custom-slider-prev",
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1.25,
                  spaceBetween: 8,
                  centeredSlides: true,
                },
                768: {
                  slidesPerView: 1,
                  spaceBetween: 0,
                  centeredSlides: false,
                },
              }}
              className="!overflow-visible md:!overflow-hidden"
            >
              {sliders.map((item, index) => {
                const desktopSrc =
                  item?.desktopImageUrl || makeImageUrl(item?.desktopImage);
                const mobileSrc =
                  item?.mobileImageUrl || makeImageUrl(item?.mobileImage);

                const clickable =
                  item?.mode === "promo" ? true : Boolean(item?.link);

                return (
                  <SwiperSlide key={item?._id || index} className="!h-auto">
                    {({ isActive }) => (
                      <div
                        role={clickable ? "button" : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onClick={() => handleSlideClick(item)}
                        className={`relative w-full overflow-hidden shadow-md transition-all duration-500
                          h-[130px] rounded-[3px]
                          md:h-[300px]
                          ${clickable ? "cursor-pointer" : ""}
                          ${
                            isActive
                              ? "scale-100 opacity-100"
                              : "scale-[0.96] opacity-95 md:scale-100 md:opacity-100"
                          }
                        `}
                        style={{
                          backgroundColor:
                            item?.slideBg || colors.slideBg || "#082056",
                        }}
                      >
                        <img
                          src={mobileSrc || desktopSrc}
                          alt={`slider-mobile-${index + 1}`}
                          className="h-full w-full object-cover md:hidden"
                          draggable="false"
                        />

                        <img
                          src={desktopSrc || mobileSrc}
                          alt={`slider-desktop-${index + 1}`}
                          className="hidden h-full w-full object-cover md:block"
                          draggable="false"
                        />
                      </div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <button className="custom-slider-prev slider-arrow absolute left-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center transition md:flex">
              <ChevronLeft size={28} />
            </button>

            <button className="custom-slider-next slider-arrow absolute right-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center transition md:flex">
              <ChevronRight size={28} />
            </button>

            <div className="custom-slider-pagination mt-3 flex justify-center gap-[6px]" />
          </>
        ) : null}
      </div>

      <style>{`
        .slider-section {
          background: var(--slider-mobile-section-bg);
        }

        .slider-mobile-skeleton {
          background: var(--slider-mobile-skeleton-bg);
        }

        .slider-desktop-skeleton {
          background: var(--slider-desktop-skeleton-bg);
        }

        .slider-skeleton-dot {
          background: var(--slider-skeleton-dot-bg);
        }

        .slider-skeleton-dot-active {
          background: var(--slider-skeleton-dot-active-bg);
        }

        .slider-arrow {
          color: var(--slider-arrow-color);
        }

        .slider-arrow:hover {
          color: var(--slider-arrow-hover-color);
        }

        .custom-slider-pagination .swiper-pagination-bullet {
          width: 20px;
          height: 2px;
          border-radius: 999px;
          background: var(--slider-pagination-bg);
          opacity: 1;
          margin: 0 !important;
        }

        .custom-slider-pagination .swiper-pagination-bullet-active {
          background: var(--slider-pagination-active-bg);
          width: 28px;
        }

        .swiper-button-disabled {
          opacity: 0.35;
        }

        @media (min-width: 768px) {
          .slider-section {
            background: var(--slider-desktop-section-bg);
          }
        }
      `}</style>
    </section>

      <SliderPromoModal
        open={Boolean(activePromo)}
        onClose={() => setActivePromo(null)}
        image={
          activePromo?.promoImageUrl || makeImageUrl(activePromo?.promoImage)
        }
        title={activePromoTitle}
        description={activePromoDescription}
        table={activePromo?.promoTable}
      />
    </>
  );
};

export default Slider;
