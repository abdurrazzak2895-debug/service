import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import banner1 from "../../assets/hero/banner-1.jpg";
import banner2 from "../../assets/hero/banner-2.jpg";

const staticSliders = [
  {
    id: 1,
    image: banner1,
    alt: "Bajiman banner 1",
  },
  {
    id: 2,
    image: banner2,
    alt: "Bajiman banner 2",
  },
];

const HeroSlider = () => {
  return (
    <section className="guide-hero-slider w-full overflow-hidden bg-[#0b66a8] md:bg-[#08316b]">
      <div className="relative mx-auto w-full">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          loop={staticSliders.length > 1}
          speed={900}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            el: ".guide-hero-pagination",
          }}
          navigation={{
            nextEl: ".guide-hero-next",
            prevEl: ".guide-hero-prev",
          }}
          className="guide-main-swiper !h-[160px] sm:!h-[260px] md:!h-[360px] lg:!h-[430px]"
        >
          {staticSliders.map((slider, index) => (
            <SwiperSlide key={slider.id}>
              <div className="relative h-full w-full overflow-hidden bg-[#082056]">
                <img
                  src={slider.image}
                  alt={slider.alt}
                  className="h-full w-full object-full"
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />

                {/* Optional dark overlay */}
                <div className="pointer-events-none absolute inset-0 bg-black/[0.02]" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Previous button */}
        <button
          type="button"
          className="guide-hero-prev hero-arrow absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/25 text-[#c5cbd3] backdrop-blur-[2px] transition-all duration-200 hover:scale-105 hover:bg-black/40 hover:text-white md:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft size={25} strokeWidth={2} />
        </button>

        {/* Next button */}
        <button
          type="button"
          className="guide-hero-next hero-arrow absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/25 text-[#c5cbd3] backdrop-blur-[2px] transition-all duration-200 hover:scale-105 hover:bg-black/40 hover:text-white md:flex"
          aria-label="Next slide"
        >
          <ChevronRight size={25} strokeWidth={2} />
        </button>

        {/* Pagination */}
        <div className="guide-hero-pagination absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-[6px]" />
      </div>

      <style>
        {`
          .guide-main-swiper {
            width: 100%;
          }

          .guide-main-swiper .swiper-slide {
            width: 100%;
            height: 100%;
          }

          .guide-hero-pagination .swiper-pagination-bullet {
            width: 20px;
            height: 3px;
            margin: 0 !important;
            border-radius: 999px;
            background: #7aa7d9;
            opacity: 1;
            transition:
              width 0.25s ease,
              background-color 0.25s ease;
          }

          .guide-hero-pagination .swiper-pagination-bullet-active {
            width: 28px;
            background: #ffffff;
          }

          .guide-hero-prev.swiper-button-disabled,
          .guide-hero-next.swiper-button-disabled {
            cursor: not-allowed;
            opacity: 0.35;
          }

          @media (max-width: 639px) {
            .guide-hero-pagination {
              bottom: 8px;
            }

            .guide-hero-pagination .swiper-pagination-bullet {
              width: 15px;
              height: 3px;
            }

            .guide-hero-pagination .swiper-pagination-bullet-active {
              width: 23px;
            }
          }
        `}
      </style>
    </section>
  );
};

export default HeroSlider;
