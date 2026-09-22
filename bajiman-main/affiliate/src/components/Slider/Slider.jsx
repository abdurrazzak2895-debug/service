import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateSliderSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL;
const DEFAULT_BG =
  "https://crickexpartner.com/wp-content/uploads/2024/03/banner-bg.jpeg";

const DEFAULT_SLIDES = [
  "https://crickexpartner.com/wp-content/uploads/2026/04/2_BAN.png",
  "https://crickexpartner.com/wp-content/uploads/2026/04/1_BAN.png",
];

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (
    String(path).startsWith("http://") ||
    String(path).startsWith("https://")
  ) {
    return path;
  }
  return `${API_URL}/${String(path).replace(/^\/+/, "")}`;
};

const SliderSkeleton = () => (
  <section className="w-full bg-[#061532] px-2 py-4 md:py-10 lg:px-8">
    <div className="mx-auto w-full max-w-[1415px] animate-pulse">
      <div className="aspect-[5/2] w-full rounded-xl bg-white/10" />
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <div className="h-[10px] w-[10px] rounded-full bg-white/20" />
        <div className="h-[10px] w-[10px] rounded-full bg-white/20" />
      </div>
    </div>
  </section>
);

const Slider = () => {
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateSliderSetting);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const slides = useMemo(() => {
    const list = Array.isArray(setting?.slides) ? setting.slides : [];

    const activeSlides = list
      .filter((item) => item?.status !== "inactive")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item, index) => ({
        image: item.imageUrl || makeImageUrl(item.image),
        link: item.link || "",
        alt: item.alt || `Banner ${index + 1}`,
      }))
      .filter((item) => item.image);

    if (activeSlides.length) return activeSlides;

    return DEFAULT_SLIDES.map((image, index) => ({
      image,
      link: "",
      alt: `Banner ${index + 1}`,
    }));
  }, [setting]);

  const bgImage =
    setting?.bgImageUrl || makeImageUrl(setting?.bgImage) || DEFAULT_BG;

  const interval = Number(setting?.interval || 4500);
  const autoPlay = setting?.autoPlay !== false;

  const dotActiveBg = setting?.dotActiveBg || "#087cff";
  const dotInactiveBg = setting?.dotInactiveBg || "#151515";
  const dotHoverBg = setting?.dotHoverBg || "#087cff";

  useEffect(() => {
    if (!slides.length) return;
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [slides.length, autoPlay, interval]);

  useEffect(() => {
    if (active >= slides.length) {
      setActive(0);
    }
  }, [active, slides.length]);

  const openSlide = (link = "") => {
    if (!link) return;

    if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.href = link;
  };

  if (!globalLoaded && globalLoading) {
    return <SliderSkeleton />;
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat py-4 md:py-10"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
      }}
    >
      <div className="mx-auto w-full max-w-[1500px] px-2 lg:px-8">
        <div className="relative mx-auto aspect-[5/2] w-full max-w-[1415px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${active}-${slides[active]?.image}`}
              src={slides[active]?.image}
              alt={slides[active]?.alt || `Banner ${active + 1}`}
              onClick={() => openSlide(slides[active]?.link)}
              className={`absolute inset-0 h-full w-full object-contain ${
                slides[active]?.link ? "cursor-pointer" : ""
              }`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {slides.length > 1 && (
          <div className="mt-[-1px] flex items-center justify-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActive(index)}
                onMouseEnter={(e) => {
                  if (active !== index)
                    e.currentTarget.style.backgroundColor = dotHoverBg;
                }}
                onMouseLeave={(e) => {
                  if (active !== index)
                    e.currentTarget.style.backgroundColor = dotInactiveBg;
                }}
                className="h-[10px] w-[10px] cursor-pointer rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    active === index ? dotActiveBg : dotInactiveBg,
                  transform: active === index ? "scale(1.1)" : "scale(1)",
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Slider;
