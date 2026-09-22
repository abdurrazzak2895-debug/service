import React from "react";
import { motion } from "framer-motion";

import { useLanguage } from "../../Context/LanguageProvider";
import HERO_BACKGROUND from "../../assets/hero/hero-background.png";
import FRONT_PERSON from "../../assets/hero/front-person.png";
import RED_DRESS_PERSON from "../../assets/hero/red-dress-person.png";
import PROFILE_PERSON from "../../assets/hero/profile-person.png";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Hero = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="relative w-full overflow-hidden bg-[#071128]">
      {/* =====================================================
          DESKTOP VERSION
      ====================================================== */}
      <div className="relative hidden min-h-[935px] w-full lg:block xl:min-h-[985px]">
        {/* Top blue section */}
        <div
          className="absolute inset-x-0 top-0 h-[410px] bg-[#145bb0] bg-cover bg-center xl:h-[455px]"
          style={{
            backgroundImage: `url("${HERO_BACKGROUND}")`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b4084]/30 via-transparent to-[#135cb4]/20" />
        </div>

        {/* Middle green section */}
        <div className="absolute left-0 top-[410px] h-[200px] w-[51.3%] bg-[#4ee000] xl:top-[455px] xl:h-[200px]" />

        {/* Quote dark section */}
        <div
          className="absolute right-0 top-[410px] h-[200px] w-[51.3%] bg-[#071128] xl:top-[455px] xl:h-[200px]"
          style={{
            clipPath: "polygon(5% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* Lower blue background */}
        <div
          className="absolute left-0 top-[610px] h-[200px] w-[49%] bg-[#145286] xl:top-[655px] xl:h-[200px]"
          style={{
            background: "linear-gradient(180deg, #175a8e 0%, #124774 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -bottom-24 left-0 h-[170px] w-[620px] rounded-[50%] border border-white/25" />
            <div className="absolute -bottom-16 left-20 h-[120px] w-[540px] rounded-[50%] border border-white/15" />
          </div>
        </div>

        {/* Profile green section */}
        <div
          className="absolute right-0 top-[610px] h-[200px] w-[56%] bg-[#4ee000] xl:top-[655px] xl:h-[200px]"
          style={{
            clipPath: "polygon(8% 0, 100% 0, 100% 100%, 3% 100%)",
          }}
        />

        {/* Bottom title dark section */}
        <div
          className="absolute bottom-0 left-0 h-[125px] w-[47%] bg-[#071128] xl:h-[130px]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 96% 100%, 0 100%)",
          }}
        />

        {/* Bottom right blue section */}
        <div className="absolute bottom-0 right-0 h-[125px] w-[55%] bg-[#285fa4] xl:h-[130px]" />

        {/* Main container */}
        <div className="absolute inset-0 mx-auto w-full max-w-auto">
          {/* Red-dress image */}
          <motion.img
            initial={{
              opacity: 0,
              x: 35,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            src={RED_DRESS_PERSON}
            alt="Tangia Zaman Methila in red dress"
            draggable={false}
            className="pointer-events-none absolute left-[35%] top-[28px] z-10 h-[382px] w-auto object-contain object-bottom xl:left-[35.5%] xl:h-[427px]"
          />

          {/* Large front image */}
          <motion.img
            initial={{
              opacity: 0,
              x: -45,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.9,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            src={FRONT_PERSON}
            alt="Miss Universe Bangladesh Tangia Zaman Methila"
            draggable={false}
            className="pointer-events-none absolute -bottom-0 left-[12.5%] z-30 h-[790px] w-auto object-contain object-bottom xl:left-[13.5%] xl:h-[885px]"
          />

          {/* Left arrow shape */}
          <button
            type="button"
            aria-label="Previous ambassador"
            className="absolute left-[19.5%] top-[230px] z-40 h-[60px] w-[31px] cursor-pointer transition-transform hover:scale-110 xl:left-[20%] xl:top-[250px]"
          >
            <span
              className="absolute inset-0 bg-[#ff4b4f]"
              style={{
                clipPath: "polygon(100% 0, 25% 50%, 100% 100%)",
              }}
            />
          </button>

          {/* Hero introduction */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="absolute left-[52.2%] top-[32px] z-20 w-[36%] max-w-[530px] xl:top-[35px]"
          >
            <motion.p
              variants={fadeUp}
              className="font-sans text-[15px] font-black uppercase leading-[1.15] text-white xl:text-[19px]"
            >
              {isBangla ? (
                <>
                  মিস ইউনিভার্স বাংলাদেশ ২০২৫
                  <br />
                  আমাদের ব্র্যান্ড অ্যাম্বাসেডর
                </>
              ) : (
                <>
                  Miss Universe Bangladesh 2025
                  <br />
                  Our Brand Ambassador
                </>
              )}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-4 font-sans text-[52px] font-black uppercase italic leading-[0.89] tracking-[-3px] text-[#4ee000] xl:text-[67px]"
            >
              {isBangla ? (
                <>
                  তানজিয়া
                  <br />
                  জামান
                  <br />
                  <span className="ml-8 text-white">মিথিলা</span>
                </>
              ) : (
                <>
                  Tangia
                  <br />
                  Zaman
                  <br />
                  <span className="ml-8 text-white">Methila</span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-3 max-w-[510px] text-[10px] font-bold leading-[1.4] text-white xl:text-[12px]"
            >
              {isBangla
                ? "তানজিয়া জামান মিথিলা ২০২৫ সালে দ্বিতীয়বারের মতো মিস ইউনিভার্স বাংলাদেশ নির্বাচিত হয়েছেন। তিনি একজন জনপ্রিয় মডেল, বলিউড অভিনেত্রী ও টিভি উপস্থাপক। তিনি ২০১৯ সালে মিস সুপ্রান্যাশনাল বাংলাদেশ এবং ২০২২ সালে সেরা আন্তর্জাতিক নারী মডেলের পুরস্কার অর্জন করেন।"
                : "Tangia Zaman Methila has been re-crowned Miss Universe Bangladesh 2025, her second win after 2020. A celebrated model, Bollywood actress, and TV host, she continues to shine globally, having earlier won Miss Supranational Bangladesh 2019 and the Best International Female Model award at the 2022 British Bangladesh Fashion & Lifestyle Awards."}
            </motion.p>
          </motion.div>

          {/* Right arrow shape */}
          <button
            type="button"
            aria-label="Next ambassador"
            className="absolute right-[17%] top-[235px] z-40 h-[60px] w-[31px] cursor-pointer transition-transform hover:scale-110 xl:right-[17.5%] xl:top-[260px]"
          >
            <span
              className="absolute inset-0 bg-[#4ee000]"
              style={{
                clipPath: "polygon(0 0, 75% 50%, 0 100%)",
              }}
            />
          </button>

          {/* Quote */}
          <motion.blockquote
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.4,
            }}
            transition={{
              duration: 0.6,
            }}
            className="absolute left-[65.5%] top-[472px] z-20 w-[28%] -translate-x-1/2 text-[10px] font-bold uppercase leading-[1.7] tracking-wide text-white xl:top-[520px] xl:text-[11px]"
            style={{
              fontFamily: '"Comic Sans MS", cursive',
            }}
          >
            {isBangla
              ? "“বাজিমান পরিবারের ব্র্যান্ড অ্যাম্বাসেডর হিসেবে যোগ দিতে পেরে আমি সত্যিই সম্মানিত ও আনন্দিত। এই ব্র্যান্ড খেলাধুলা এবং বিনোদনের মাধ্যমে লক্ষ লক্ষ মানুষের সঙ্গে সংযোগ তৈরি করে। ভক্ত ও খেলোয়াড়দের জন্য স্মরণীয় অভিজ্ঞতা তৈরি করার অপেক্ষায় আছি। এই অংশীদারত্ব একটি রোমাঞ্চকর যাত্রার শুরু মাত্র!”"
              : "“I am truly honored and excited to join the Bajiman family as their brand ambassador. It’s a brand that connects millions through sports and entertainment. I look forward to creating memorable experiences for fans & players. This partnership is just the beginning of an exciting journey ahead!”"}
          </motion.blockquote>

          {/* Small profile image */}
          <motion.img
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.65,
            }}
            src={PROFILE_PERSON}
            alt="Tangia Zaman Methila profile"
            draggable={false}
            className="pointer-events-none absolute bottom-[125px] left-[50%] z-20 h-[180px] w-auto object-contain object-bottom xl:bottom-[130px] xl:h-[195px]"
          />

          {/* Personal details */}
          <motion.div
            initial={{
              opacity: 0,
              x: 25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.6,
            }}
            className="absolute bottom-[144px] left-[65%] z-20 text-[#072b45] xl:bottom-[155px]"
          >
            <div>
              <h3 className="text-[11px] font-black uppercase xl:text-[13px]">
                {isBangla ? "জন্মতারিখ" : "Date of Birth"}
              </h3>

              <p className="text-[10px] font-medium xl:text-[12px]">
                {isBangla
                  ? "৩১ জানুয়ারি ১৯৯২ (৩৩ বছর)"
                  : "31 Jan 1992 (33 Years)"}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-[11px] font-black uppercase xl:text-[13px]">
                {isBangla ? "উচ্চতা" : "Height"}
              </h3>

              <p className="text-[10px] font-medium xl:text-[12px]">1.64 m</p>
            </div>

            <div className="mt-4">
              <h3 className="text-[11px] font-black uppercase xl:text-[13px]">
                {isBangla ? "পেশা" : "Profession"}
              </h3>

              <p className="text-[10px] font-medium xl:text-[12px]">
                {isBangla
                  ? "মডেল, অভিনেত্রী, টিভি উপস্থাপক"
                  : "Model, Actress, TV Host"}
              </p>
            </div>
          </motion.div>

          {/* Bottom title */}
          <motion.h2
            initial={{
              opacity: 0,
              x: -25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.55,
            }}
            className="absolute bottom-[51px] left-[3.2%] z-30 text-[13px] font-medium uppercase tracking-wide text-white xl:bottom-[54px] xl:text-[15px]"
          >
            {isBangla ? "বিউটি কুইন টাইটেলস" : "Beauty Queen Titles"}
          </motion.h2>
        </div>
      </div>

      {/* =====================================================
          MOBILE AND TABLET VERSION
      ====================================================== */}
      <div className="relative lg:hidden">
        {/* Mobile top section */}
        <div
          className="relative overflow-hidden bg-[#145bb0] bg-cover bg-center px-4 pb-0 pt-7 sm:px-8 sm:pt-10"
          style={{
            backgroundImage: `url("${HERO_BACKGROUND}")`,
          }}
        >
          <div className="absolute inset-0 bg-[#0d4b96]/20" />

          {/* Mobile heading */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="relative z-20 text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-black uppercase leading-[1.25] text-white sm:text-[14px]"
            >
              {isBangla ? (
                <>
                  মিস ইউনিভার্স বাংলাদেশ ২০২৫
                  <br />
                  আমাদের ব্র্যান্ড অ্যাম্বাসেডর
                </>
              ) : (
                <>
                  Miss Universe Bangladesh 2025
                  <br />
                  Our Brand Ambassador
                </>
              )}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-3 font-sans text-[39px] font-black uppercase italic leading-[0.87] tracking-[-2px] text-[#4ee000] sm:text-[54px]"
            >
              {isBangla ? (
                <>
                  তানজিয়া জামান
                  <br />
                  <span className="text-white">মিথিলা</span>
                </>
              ) : (
                <>
                  Tangia Zaman
                  <br />
                  <span className="text-white">Methila</span>
                </>
              )}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-4 max-w-[560px] text-[10px] font-semibold leading-[1.5] text-white/95 sm:text-[12px]"
            >
              {isBangla
                ? "তানজিয়া জামান মিথিলা ২০২৫ সালে দ্বিতীয়বারের মতো মিস ইউনিভার্স বাংলাদেশ নির্বাচিত হয়েছেন। তিনি একজন জনপ্রিয় মডেল, অভিনেত্রী এবং টিভি উপস্থাপক।"
                : "Tangia Zaman Methila has been re-crowned Miss Universe Bangladesh 2025. A celebrated model, actress and TV host, she continues to shine globally."}
            </motion.p>
          </motion.div>

          {/* Mobile people */}
          <div className="relative z-10 mx-auto mt-2 h-[390px] max-w-[520px] sm:h-[500px]">
            <motion.img
              initial={{
                opacity: 0,
                x: 25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.75,
              }}
              src={RED_DRESS_PERSON}
              alt=""
              draggable={false}
              className="absolute bottom-0 right-[5%] h-[78%] w-auto object-contain object-bottom sm:right-[8%] sm:h-[82%]"
            />

            <motion.img
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.1,
              }}
              src={FRONT_PERSON}
              alt="Tangia Zaman Methila"
              draggable={false}
              className="absolute bottom-0 left-[-4%] z-20 h-[92%] w-auto object-contain object-bottom sm:left-[3%] sm:h-[96%]"
            />

            {/* Mobile arrows */}
            <span
              className="absolute left-1 top-[45%] z-30 h-[42px] w-[24px] bg-[#ff4b4f]"
              style={{
                clipPath: "polygon(100% 0, 25% 50%, 100% 100%)",
              }}
            />

            <span
              className="absolute right-1 top-[45%] z-30 h-[42px] w-[24px] bg-[#4ee000]"
              style={{
                clipPath: "polygon(0 0, 75% 50%, 0 100%)",
              }}
            />
          </div>
        </div>

        {/* Mobile quote */}
        <div className="relative bg-[#071128] px-6 py-9 text-center sm:px-12 sm:py-11">
          <blockquote
            className="mx-auto max-w-[570px] text-[10px] font-bold uppercase leading-[1.7] text-white sm:text-[12px]"
            style={{
              fontFamily: '"Comic Sans MS", cursive',
            }}
          >
            {isBangla
              ? "“ব্র্যান্ড অ্যাম্বাসেডর হিসেবে এই পরিবারের সঙ্গে যোগ দিতে পেরে আমি সত্যিই সম্মানিত এবং আনন্দিত। এই অংশীদারত্ব একটি রোমাঞ্চকর যাত্রার শুরু মাত্র!”"
              : "“I am truly honored and excited to join the Bajiman family as their brand ambassador. I look forward to creating memorable experiences for fans and players. This partnership is just the beginning of an exciting journey ahead!”"}
          </blockquote>
        </div>

        {/* Mobile profile details */}
        <div className="relative grid min-h-[245px] grid-cols-[42%_58%] overflow-hidden bg-[#4ee000]">
          <div className="relative flex items-end justify-center">
            <img
              src={PROFILE_PERSON}
              alt="Tangia Zaman Methila profile"
              draggable={false}
              className="max-h-[230px] w-full object-contain object-bottom"
            />
          </div>

          <div className="flex flex-col justify-center px-4 py-7 text-[#072b45] sm:px-7">
            <div>
              <h3 className="text-[11px] font-black uppercase sm:text-[13px]">
                {isBangla ? "জন্মতারিখ" : "Date of Birth"}
              </h3>

              <p className="text-[10px] sm:text-[12px]">
                {isBangla
                  ? "৩১ জানুয়ারি ১৯৯২ (৩৩ বছর)"
                  : "31 Jan 1992 (33 Years)"}
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-[11px] font-black uppercase sm:text-[13px]">
                {isBangla ? "উচ্চতা" : "Height"}
              </h3>

              <p className="text-[10px] sm:text-[12px]">1.64 m</p>
            </div>

            <div className="mt-4">
              <h3 className="text-[11px] font-black uppercase sm:text-[13px]">
                {isBangla ? "পেশা" : "Profession"}
              </h3>

              <p className="text-[10px] sm:text-[12px]">
                {isBangla
                  ? "মডেল, অভিনেত্রী, টিভি উপস্থাপক"
                  : "Model, Actress, TV Host"}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile title */}
        <div className="relative h-[90px] overflow-hidden bg-[#285fa4]">
          <div
            className="flex h-full w-[82%] items-center bg-[#071128] px-6"
            style={{
              clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)",
            }}
          >
            <h2 className="text-[12px] font-medium uppercase tracking-wide text-white sm:text-[14px]">
              {isBangla ? "বিউটি কুইন টাইটেলস" : "Beauty Queen Titles"}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
