import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import AMBASSADOR_IMAGE from "../../assets/movie-host-awards/ambassador.png";

const ACHIEVEMENTS = [
  [
    {
      color: "green",
      heading: {
        bn: "ব্রিটিশ বাংলাদেশ ফ্যাশন অ্যান্ড লাইফস্টাইল অ্যাওয়ার্ডস",
        en: "British Bangladesh Fashion & Lifestyle Awards",
      },
      text: {
        bn: "বেস্ট ইন্টারন্যাশনাল ফিমেল মডেল ২০২২",
        en: "Best International Female Model 2022",
      },
    },
    {
      color: "blue",
      heading: { bn: "এশিয়া মডেল ফেস্টিভ্যাল", en: "Asia Model Festival" },
      text: {
        bn: "এশিয়া মডেল স্টার অ্যাওয়ার্ড – ২০১৯",
        en: "Asia Model Star Award – 2019",
      },
    },
  ],
  [
    {
      color: "blue",
      heading: { bn: "প্যারিস ফ্যাশন উইক ২০২২", en: "Paris Fashion Week 2022" },
      text: {
        bn: "বেস্ট ইন্টারন্যাশনাল ফিমেল মডেল",
        en: "Best International Female Model",
      },
    },
    {
      color: "green",
      heading: { bn: "বিফা", en: "BIFA" },
      text: { bn: "বিফা অ্যাওয়ার্ডস ২০২৩", en: "BIFA Awards 2023" },
    },
  ],
  [
    {
      color: "green",
      heading: { bn: "ডেব্যু মুভি", en: "Debut Movie" },
      text: { bn: "রোহিঙ্গা", en: "Rohingya" },
    },
    {
      color: "blue",
      heading: { bn: "মডেলিং", en: "Modeling" },
      text: {
        bn: "র‍্যাম্প ওয়াক অ্যান্ড ফ্যাশন মডেলিং",
        en: "Ramp Walk & Fashion Modeling",
      },
    },
  ],
];

const COLOR_MAP = {
  green: "text-[#4ee000]",
  blue: "text-[#38bdf8]",
};

const rowFade = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const AchievementItem = ({
  item,
  isBangla,
  textSize = "text-[12px] xl:text-[14px]",
}) => (
  <div>
    <p
      className={`flex items-start gap-1 text-[13px] font-bold xl:text-[15px] ${COLOR_MAP[item.color]}`}
    >
      <ArrowUpRight size={14} className="mt-[3px] shrink-0" />
      <span>{isBangla ? item.heading.bn : item.heading.en}</span>
    </p>
    <p className={`mt-2 font-medium text-white ${textSize}`}>
      {isBangla ? item.text.bn : item.text.en}
    </p>
  </div>
);

const MovieHostAwards = () => {
  const { isBangla } = useLanguage();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #1c4f8c 0%, #123156 100%)",
      }}
    >
      {/* =====================================================
          DESKTOP VERSION
      ====================================================== */}
      <div className="relative hidden min-h-[820px] w-full lg:block">
        {/* Green diagonal backdrop */}
        <div
          className="absolute left-0 top-[290px] h-[340px] w-[49%] bg-[#61D81D]"
          style={{ clipPath: "polygon(0 0, 100% 12%, 92% 100%, 0 100%)" }}
        />

        {/* Top-left label */}
        <div
          className="absolute left-0 top-0 z-20 w-[43%] bg-[#071128] px-8 py-6 xl:px-10 xl:py-7"
          style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
        >
          <h2 className="text-[15px] font-bold uppercase leading-tight tracking-wide text-white xl:text-[17px]">
            {isBangla ? "মুভি / হোস্ট" : "Movie / Host"}
          </h2>
          <h2 className="text-[15px] font-bold uppercase leading-tight tracking-wide text-white xl:text-[17px]">
            {isBangla
              ? "অ্যাওয়ার্ডস অ্যান্ড অ্যাচিভমেন্টস"
              : "Awards & Achievements"}
          </h2>
        </div>

        {/* Ambassador image */}
        <motion.img
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          src={AMBASSADOR_IMAGE}
          alt="Tangia Zaman Methila - Movie and Host awards"
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-[9%] z-10 h-[92%] w-auto object-contain object-bottom xl:left-[10%]"
        />

        {/* Achievement rows */}
        <div className="absolute right-[5%] top-[195px] z-20 w-[46%] xl:right-[5.5%] xl:w-[44%]">
          <div className="flex flex-col gap-[45px]">
            {ACHIEVEMENTS.map((row, rowIndex) => (
              <motion.div
                key={rowIndex}
                custom={rowIndex}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={rowFade}
                className="grid grid-cols-2 gap-x-6 bg-[#0a2547]/60 px-6 py-8 xl:gap-x-8 xl:px-8 xl:py-9"
                style={{ clipPath: "polygon(2% 0, 100% 0, 96% 100%, 0 100%)" }}
              >
                {row.map((item, itemIndex) => (
                  <AchievementItem
                    key={itemIndex}
                    item={item}
                    isBangla={isBangla}
                  />
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE AND TABLET VERSION
      ====================================================== */}
      <div className="relative px-5 py-8 sm:px-8 lg:hidden">
        <div
          className="inline-block bg-[#071128] px-5 py-4"
          style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)" }}
        >
          <h2 className="text-[13px] font-bold uppercase leading-tight text-white sm:text-[14px]">
            {isBangla ? "মুভি / হোস্ট" : "Movie / Host"}
          </h2>
          <h2 className="text-[13px] font-bold uppercase leading-tight text-white sm:text-[14px]">
            {isBangla
              ? "অ্যাওয়ার্ডস অ্যান্ড অ্যাচিভমেন্টস"
              : "Awards & Achievements"}
          </h2>
        </div>

        <div className="relative mx-auto mt-6 h-[340px] max-w-[420px] sm:h-[420px]">
          <div
            className="absolute left-0 top-[20%] h-[60%] w-[85%] bg-[#4ee000]"
            style={{ clipPath: "polygon(0 0, 100% 10%, 90% 100%, 0 100%)" }}
          />
          <img
            src={AMBASSADOR_IMAGE}
            alt="Tangia Zaman Methila - Movie and Host awards"
            draggable={false}
            className="pointer-events-none absolute bottom-0 left-0 z-10 h-full w-auto object-contain object-bottom"
          />
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {ACHIEVEMENTS.flat().map((item, index) => (
            <div
              key={index}
              className="bg-[#0a2547]/60 px-5 py-4"
              style={{ clipPath: "polygon(2% 0, 100% 0, 96% 100%, 0 100%)" }}
            >
              <AchievementItem
                item={item}
                isBangla={isBangla}
                textSize="text-[11px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieHostAwards;
