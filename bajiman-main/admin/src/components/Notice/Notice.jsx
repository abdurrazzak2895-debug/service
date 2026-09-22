import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";

const Notice = () => {
  const { isBangla } = useLanguage();

  const noticeText = useMemo(() => {
    return isBangla
      ? "আজই ৬০% পর্যন্ত কমিশন পান! আজই BABU88 এজেন্ট হন! আজই ৬০% পর্যন্ত কমিশন পান! আজই BABU88 এজেন্ট হন!"
      : "Get up to 60% commission today! Become a BABU88 agent today! Get up to 60% commission today! Become a BABU88 agent today!";
  }, [isBangla]);

  return (
    <div className="w-full bg-[#2b2b2b]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        {/* yellow pill */}
        <div className="bg-[#f5b400] rounded-md sm:rounded-md px-3 sm:px-6 py-2 sm:py-3 overflow-hidden">
          <div className="notice-viewport">
            <div className="notice-single text-black font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">
              {noticeText}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .notice-viewport{
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        /* start from right outside, exit left outside, immediately restart */
        .notice-single{
          display: inline-block;
          will-change: transform;
          animation: noticeOne 16s linear infinite;
        }

        @keyframes noticeOne{
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        /* accessibility */
        @media (prefers-reduced-motion: reduce){
          .notice-single{
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Notice;
