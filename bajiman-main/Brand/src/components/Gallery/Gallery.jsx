import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

import gallery1 from "../../assets/gallery/gallery-1.png";
import gallery2 from "../../assets/gallery/gallery-2.png";
import gallery3 from "../../assets/gallery/gallery-3.png";
import gallery4 from "../../assets/gallery/gallery-4.png";
import gallery5 from "../../assets/gallery/gallery-5.png";
import gallery6 from "../../assets/gallery/gallery-6.png";

const ALL_IMAGES = [gallery1, gallery2, gallery3, gallery5, gallery4, gallery6];

const ROW_ONE = ALL_IMAGES;
const ROW_TWO = [...ALL_IMAGES].reverse();

const TILT = ["-rotate-3", "rotate-3", "-rotate-2"];

const GalleryRow = ({ images, reverseDirection, tiltOffset = 0, className = "" }) => {
  return (
    <div className={className}>
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2200,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          reverseDirection,
        }}
        speed={900}
        rewind
        allowTouchMove
        slidesPerView={1.4}
        spaceBetween={24}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 28 },
          1024: { slidesPerView: 3, spaceBetween: 36 },
        }}
        className="!py-4"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div
              className={`h-[170px] w-full overflow-hidden rounded-[6px] shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:h-[200px] lg:h-[220px] ${
                TILT[(index + tiltOffset) % TILT.length]
              }`}
            >
              <img
                src={src}
                alt="Bajiman highlight"
                draggable={false}
                className="pointer-events-none h-full w-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const Gallery = () => {
  return (
    <section className="w-full overflow-hidden bg-[#1c4f95] px-4 py-14 sm:px-8 sm:py-16 lg:px-12">
      <div className="mx-auto max-w-[1536px]">
        <GalleryRow images={ROW_ONE} tiltOffset={0} />
        <GalleryRow
          images={ROW_TWO}
          reverseDirection
          tiltOffset={1}
          className="mt-10 sm:mt-12"
        />
      </div>
    </section>
  );
};

export default Gallery;
