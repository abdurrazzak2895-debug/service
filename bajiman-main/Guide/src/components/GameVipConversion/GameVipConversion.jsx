import React from "react";
import { CircleDollarSign, Star } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import HAT_IMAGE from "../../assets/vip/hat.png";

const conversionData = [
  {
    id: 1,
    product: {
      en: "Slots, Lottery",
      bn: "স্লট, লটারি",
    },
    conversion: 100,
  },
  {
    id: 2,
    product: {
      en: "Sports, Casino, Fishing, Esports, Crash, CockFighting",
      bn: "স্পোর্টস, ক্যাসিনো, ফিশিং, ই-স্পোর্টস, ক্র্যাশ, ককফাইটিং",
    },
    conversion: 50,
  },
  {
    id: 3,
    product: {
      en: "Card, Table, Arcade",
      bn: "কার্ড, টেবিল, আর্কেড",
    },
    conversion: 25,
  },
];

const banglaDigits = {
  0: "০",
  1: "১",
  2: "২",
  3: "৩",
  4: "৪",
  5: "৫",
  6: "৬",
  7: "৭",
  8: "৮",
  9: "৯",
};

const convertToBanglaNumber = (value) => {
  return String(value).replace(/\d/g, (digit) => banglaDigits[digit]);
};

const GameVipConversion = () => {
  const { isBangla } = useLanguage();

  const texts = {
    titleStart: isBangla ? "গেম কনভার্সন" : "Game Conversion For",

    titleHighlight: isBangla
      ? "VIP এক্সপেরিয়েন্স ও VIP পয়েন্ট:"
      : "VIP Experience & VIP Points:",

    productType: isBangla ? "প্রোডাক্টের ধরন" : "Product Type",

    conversion: isBangla ? "কনভার্সন %" : "Conversion %",

    hatAlt: isBangla ? "VIP গেমিং হ্যাট" : "VIP gaming hat",
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#12337c] px-4 py-5 text-white sm:px-6 sm:py-7 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[100px] -top-[150px] h-[480px] w-[230px] rotate-[24deg] bg-[#092860]/35" />

        <div className="absolute left-[47%] top-[-170px] h-[390px] w-[150px] rotate-[-23deg] bg-[#244b91]/15" />

        <div className="absolute -right-[80px] -top-[160px] h-[450px] w-[190px] rotate-[-25deg] bg-[#092860]/30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1110px]">
        {/* Heading */}
        <h1 className="pl-0 text-[25px] font-black leading-[1.18] tracking-[-0.6px] text-white sm:pl-4 sm:text-[31px] lg:text-[36px]">
          <span>{texts.titleStart} </span>

          <span className="text-[#ffb638]">{texts.titleHighlight}</span>
        </h1>

        {/* Main bordered box */}
        <div className="relative mt-[20px] rounded-[4px] border-[4px] border-[#f3cb58] bg-[#0c2461] px-4 py-[36px] sm:px-[17px] lg:px-[17px]">
          {/* Animated hat */}
          <img
            src={HAT_IMAGE}
            alt={texts.hatAlt}
            className="vip-hat pointer-events-none absolute left-[-57px] top-[75px] z-20 hidden h-auto w-[115px] object-contain drop-shadow-[0_9px_12px_rgba(0,0,0,0.3)] sm:block lg:left-[-70px] lg:top-[82px] lg:w-[135px]"
            loading="lazy"
            draggable={false}
          />

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-[14px] border border-[#3977bd] bg-[#194b8e] p-[14px] sm:block">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="h-[41px] bg-[#5894df]">
                  <th className="rounded-l-[5px] px-[13px] text-left text-[12px] font-extrabold text-white">
                    {texts.productType}
                  </th>

                  <th className="w-[250px] rounded-r-[5px] px-[13px] text-right text-[12px] font-extrabold text-white">
                    {texts.conversion}
                  </th>
                </tr>
              </thead>

              <tbody>
                {conversionData.map((item) => (
                  <tr
                    key={item.id}
                    className="h-[70px] border-b border-[#3974ba] last:border-b"
                  >
                    <td className="px-[13px] text-left text-[12px] font-medium text-white">
                      {isBangla ? item.product.bn : item.product.en}
                    </td>

                    <td className="px-[13px]">
                      <ConversionValue
                        value={item.conversion}
                        isBangla={isBangla}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile hat */}
          <div className="mb-4 flex justify-center sm:hidden">
            <img
              src={HAT_IMAGE}
              alt={texts.hatAlt}
              className="vip-hat h-auto w-[125px] object-contain drop-shadow-[0_9px_12px_rgba(0,0,0,0.3)]"
              loading="lazy"
              draggable={false}
            />
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {conversionData.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[11px] border border-[#3977bd] bg-[#194b8e] p-3"
              >
                <div className="rounded-[6px] bg-[#5894df] px-3 py-[9px] text-center text-[11px] font-extrabold text-white">
                  {texts.productType}
                </div>

                <p className="px-2 py-4 text-center text-[13px] font-medium leading-[21px] text-white">
                  {isBangla ? item.product.bn : item.product.en}
                </p>

                <div className="h-px w-full bg-[#3974ba]" />

                <p className="mt-3 text-center text-[10px] font-bold text-white/65">
                  {texts.conversion}
                </p>

                <div className="mt-3 flex justify-center pb-1">
                  <ConversionValue
                    value={item.conversion}
                    isBangla={isBangla}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes vipHatFloating {
            0% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-12px);
            }

            100% {
              transform: translateY(0);
            }
          }

          .vip-hat {
            animation: vipHatFloating 2.8s ease-in-out infinite;
            will-change: transform;
          }

          @media (max-width: 639px) {
            @keyframes vipHatFloating {
              0% {
                transform: translateY(0);
              }

              50% {
                transform: translateY(-8px);
              }

              100% {
                transform: translateY(0);
              }
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .vip-hat {
              animation: none;
            }
          }
        `}
      </style>
    </section>
  );
};

const ConversionValue = ({ value, isBangla }) => {
  return (
    <div className="flex items-center justify-end gap-[10px]">
      <CircleDollarSign
        size={27}
        fill="#e8ac30"
        color="#f6cf69"
        strokeWidth={1.5}
        className="shrink-0 drop-shadow"
      />

      <span className="text-[15px] font-extrabold text-white">
        {isBangla ? "১" : "1"}
      </span>

      <span className="text-[15px] font-extrabold text-white">=</span>

      <Star
        size={29}
        fill="#daa51e"
        color="#f0c74d"
        strokeWidth={1}
        className="shrink-0 drop-shadow"
      />

      <span className="min-w-[43px] text-right text-[15px] font-extrabold text-white">
        {isBangla ? convertToBanglaNumber(value) : value}%
      </span>
    </div>
  );
};

export default GameVipConversion;
