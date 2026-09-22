// src/components/WheelTermsCondition/WheelTermsCondition.jsx

import React, { useCallback, useEffect, useState } from "react";
import { FaExclamationTriangle, FaFileContract, FaSyncAlt } from "react-icons/fa";
import { motion } from "framer-motion";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";

const defaultDesign = {
  pageBackgroundColor: "#172178",
  cardGradientFrom: "#172b88",
  cardGradientTo: "#4b4b4b",
  cardBorderColor: "#5364ba",
  cardBorderWidth: 1,
  cardBorderRadius: 18,
  cardShadowColor: "#000000",
  titleGradientFrom: "#ffb65c",
  titleGradientTo: "#c79b00",
  titleBorderColor: "#f5ca24",
  titleTextColor: "#ffffff",
  headingTextColor: "#ffffff",
  contentTextColor: "#ffffff",
  titleFontSize: 22,
  headingFontSize: 15,
  contentFontSize: 14,
  contentLineHeight: 1.8,
  maxWidth: 900,
};

const WheelTermsCondition = () => {
  const { isBangla } = useLanguage();

  const t = (bn, en) => (isBangla ? bn : en);

  const [terms, setTerms] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadTerms = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/api/wheel-terms");

      setTerms(data?.terms || null);
    } catch (requestError) {
      setTerms(null);

      if (requestError?.response?.status === 404) {
        setError(
          t(
            "হুইল-এর শর্তাবলী বর্তমানে পাওয়া যাচ্ছে না।",
            "Wheel Terms & Conditions are currently unavailable.",
          ),
        );

        return;
      }

      setError(
        requestError?.response?.data?.message ||
          t("শর্তাবলী লোড করা যায়নি।", "Failed to load Terms & Conditions."),
      );
    } finally {
      setLoading(false);
    }
  }, [isBangla]);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const getLanguageText = (value) => {
    return (isBangla ? value?.bn : value?.en) || value?.en || value?.bn || "";
  };

  if (loading) {
    return <TermsLoading />;
  }

  if (error || !terms) {
    return (
      <TermsError
        message={error}
        retryText={t("আবার চেষ্টা করুন", "Try Again")}
        onRetry={loadTerms}
      />
    );
  }

  const design = {
    ...defaultDesign,
    ...(terms.design || {}),
  };

  const title =
    getLanguageText(terms.title) || t("শর্তাবলী", "Terms & Conditions");

  const heading =
    getLanguageText(terms.heading) || t("লাকি হুইল", "LUCKY WHEEL");

  const content = getLanguageText(terms.content);

  const cardShadow = `0 20px 45px -12px ${design.cardShadowColor}`;

  return (
    <section
      className="relative w-full overflow-hidden px-3 pb-8 pt-12 sm:px-5 sm:pb-12 sm:pt-16 lg:px-8"
      style={{
        backgroundColor: design.pageBackgroundColor,
      }}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.12, 0.25, 0.12],

            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-400 blur-3xl"
        />

        <motion.div
          animate={{
            opacity: [0.1, 0.22, 0.1],

            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-400 blur-3xl"
        />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 35,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className="relative z-10 mx-auto"
        style={{
          maxWidth: `${Number(design.maxWidth || 900)}px`,
        }}
      >
        {/* Terms content card */}
        <div
          className="relative px-4 pb-7 pt-14 sm:px-7 sm:pb-10 sm:pt-16 lg:px-10 lg:pb-12"
          style={{
            minHeight: "400px",

            background: `linear-gradient(180deg, ${design.cardGradientFrom}, ${design.cardGradientTo})`,

            border: `${Number(
              design.cardBorderWidth || 0,
            )}px solid ${design.cardBorderColor}`,

            borderRadius: `${Number(design.cardBorderRadius || 0)}px`,

            boxShadow: cardShadow,
          }}
        >
          {/* Floating title badge */}
          <motion.div
            initial={{
              opacity: 0,
              y: -25,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.25,
              duration: 0.5,
              type: "spring",
              stiffness: 160,
              damping: 14,
            }}
            className="absolute left-1/2 top-0 flex min-w-[220px] max-w-[90%] -translate-x-1/2 -translate-y-1/2 items-center justify-center px-5 py-2.5 text-center font-extrabold sm:min-w-[290px] sm:px-7 sm:py-3"
            style={{
              background: `linear-gradient(180deg, ${design.titleGradientFrom}, ${design.titleGradientTo})`,

              border: `2px solid ${design.titleBorderColor}`,

              borderRadius: "15px",

              color: design.titleTextColor,

              fontSize: `clamp(16px, 4vw, ${Number(
                design.titleFontSize || 22,
              )}px)`,

              boxShadow: `0 5px 0 ${design.titleBorderColor}70, 0 10px 22px ${design.cardShadowColor}99`,

              textShadow: "0 2px 2px rgba(0,0,0,.45)",
            }}
          >
            <FaFileContract className="mr-2 shrink-0 text-[0.85em]" />

            <span className="truncate">{title}</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.5,
            }}
            className="break-words font-extrabold"
            style={{
              color: design.headingTextColor,

              fontSize: `clamp(13px, 3vw, ${Number(
                design.headingFontSize || 15,
              )}px)`,

              textShadow: "0 2px 2px rgba(0,0,0,.35)",
            }}
          >
            {heading}
          </motion.h2>

          {/* Divider */}
          <motion.div
            initial={{
              width: 0,
              opacity: 0,
            }}
            animate={{
              width: "72px",
              opacity: 1,
            }}
            transition={{
              delay: 0.45,
              duration: 0.55,
            }}
            className="mt-3 h-[3px] rounded-full"
            style={{
              background: `linear-gradient(90deg, ${design.titleGradientFrom}, ${design.titleGradientTo})`,
            }}
          />

          {/* Terms content */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.5,
              duration: 0.55,
            }}
            className="mt-5 whitespace-pre-line break-words font-medium sm:mt-6"
            style={{
              color: design.contentTextColor,

              fontSize: `clamp(12px, 2.5vw, ${Number(
                design.contentFontSize || 14,
              )}px)`,

              lineHeight: Number(design.contentLineHeight || 1.8),

              textShadow: "0 1px 2px rgba(0,0,0,.3)",
            }}
          >
            {content}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

/* ======================================================
   LOADING
====================================================== */

const TermsLoading = () => (
  <div className="flex min-h-[420px] w-full items-center justify-center bg-[#172178] p-5">
    <div className="text-center text-white">
      <FaSyncAlt className="mx-auto animate-spin text-4xl text-yellow-400" />

      <p className="mt-4 text-sm font-bold text-white/70">
        Loading Terms & Conditions...
      </p>
    </div>
  </div>
);

/* ======================================================
   ERROR
====================================================== */

const TermsError = ({ message, retryText, onRetry }) => (
  <div className="flex min-h-[420px] w-full items-center justify-center bg-[#172178] p-5">
    <div className="w-full max-w-md rounded-2xl border border-yellow-400/30 bg-black/25 p-7 text-center text-white">
      <FaExclamationTriangle className="mx-auto text-4xl text-yellow-400" />

      <p className="mt-4 text-sm leading-6 text-white/70">
        {message || "Terms & Conditions are unavailable."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 cursor-pointer rounded-xl bg-yellow-500 px-6 py-2.5 text-sm font-extrabold text-black transition hover:bg-yellow-400"
      >
        {retryText}
      </button>
    </div>
  </div>
);

export default WheelTermsCondition;
