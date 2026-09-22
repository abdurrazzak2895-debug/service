import React from "react";
import { motion } from "framer-motion";

import { useLanguage } from "../../Context/LanguageProvider";

const CLIENT_URL = (import.meta.env.VITE_CLIENT_URL || "/").replace(/\/$/, "");
const REGISTER_URL =
  import.meta.env.VITE_REGISTER_URL || `${CLIENT_URL}`;

const ExploreCrickexWorld = () => {
  const { isBangla } = useLanguage();

  return (
    <section
      className="relative w-full overflow-hidden px-4 py-16 sm:py-20 lg:py-24"
      style={{
        background:
          "radial-gradient(120% 160% at 20% 0%, #2f6fc4 0%, #1a4f95 45%, #0e3573 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 15% 20%, rgba(255,255,255,0.12) 0%, transparent 70%), radial-gradient(50% 35% at 75% 70%, rgba(255,255,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[34px] font-black italic uppercase leading-tight tracking-tight sm:text-[48px] lg:text-[58px]"
        >
          <span className="text-[#4ee000]">
            {isBangla ? "এক্সপ্লোর " : "Explore "}
          </span>
          <span className="text-white">
            Baj<span className="text-red-500">i</span>man
          </span>
          <span className="text-[#4ee000]">
            {isBangla ? " ওয়ার্ল্ড" : " World"}
          </span>
        </motion.h2>

        <motion.a
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          href={REGISTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 flex h-[46px] w-[190px] items-center justify-center bg-[#4de000] text-[16px] font-bold text-[#0a1f3d] transition duration-200 hover:brightness-110 sm:mt-10 sm:h-[50px] sm:w-[210px]"
          style={{ clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0% 100%)" }}
        >
          <span className="transition-transform duration-200 group-hover:scale-105">
            {isBangla ? "চলো যাই!" : "Let's Go!"}
          </span>
        </motion.a>
      </div>
    </section>
  );
};

export default ExploreCrickexWorld;
