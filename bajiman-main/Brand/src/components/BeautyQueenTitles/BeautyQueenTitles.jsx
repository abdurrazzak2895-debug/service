import React from "react";
import { motion } from "framer-motion";

import { useLanguage } from "../../Context/LanguageProvider";

const TITLES = [
  {
    title: {
      bn: "মিস সুপ্রান্যাশনাল বাংলাদেশ ২০১৯",
      en: "Miss Supranational Bangladesh 2019",
    },
    category: { bn: "বিউটি পেজেন্ট", en: "Beauty Pageant" },
  },
  {
    title: {
      bn: "মিস ইউনিভার্স বাংলাদেশ ২০২০ ও ২০২৫",
      en: "Miss Universe Bangladesh 2020 & 2025",
    },
    category: { bn: "বিউটি পেজেন্ট", en: "Beauty Pageant" },
  },
];

const rowFade = {
  hidden: { opacity: 0, y: 16 },
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

const BeautyQueenTitles = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="bg-[#285fa4] px-6 py-10 sm:px-10 lg:px-16 lg:py-12 xl:px-24">
      <div className="mx-auto flex max-w-[1300px] flex-col gap-5 xl:gap-6">
        {TITLES.map((item, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={rowFade}
            className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-6"
          >
            <div
              className="flex min-h-[56px] items-center bg-[#3d76bd] px-6 py-4 sm:min-w-[360px] xl:min-w-[420px] xl:px-8"
              style={{
                clipPath: "polygon(3% 0, 100% 0, 97% 100%, 0 100%)",
              }}
            >
              <p className="text-[13px] font-bold text-white sm:text-[15px] xl:text-[16px]">
                {isBangla ? item.title.bn : item.title.en}
              </p>
            </div>

            <div
              className="flex min-h-[56px] flex-1 items-center bg-[#153661] px-6 py-4 sm:max-w-[560px] xl:px-8"
              style={{
                clipPath: "polygon(3% 0, 100% 0, 97% 100%, 0 100%)",
              }}
            >
              <p className="text-[13px] font-medium text-white/90 sm:text-[14px] xl:text-[15px]">
                {isBangla ? item.category.bn : item.category.en}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BeautyQueenTitles;
