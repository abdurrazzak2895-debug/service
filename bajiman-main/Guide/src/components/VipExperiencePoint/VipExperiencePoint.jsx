import React from "react";
import { CircleDollarSign, Star } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import SUITCASE_IMAGE from "../../assets/vip/suitcase.png";

const VipExperiencePoint = () => {
  const { isBangla } = useLanguage();

  const texts = {
    titleStart: isBangla ? "কী" : "What is",
    titleHighlight: isBangla
      ? "VIP এক্সপেরিয়েন্স (VE) পয়েন্ট?"
      : "VIP Experience (VE) Point?",

    description: isBangla
      ? "VIP Experience (VE) পয়েন্ট আপনার টার্নওভার থেকে অর্জিত হয় এবং আপনার VIP টিয়ার নির্ধারণে ব্যবহৃত হয়। তবে এই পয়েন্ট বাস্তব টাকায় রূপান্তর করা যাবে না।"
      : "VIP Experience (VE) Points are earned from your turnover and used to determine your VIP tier, but they cannot be converted into real cash.",

    conversionTitle: isBangla
      ? "VIP এক্সপেরিয়েন্স (VE) রূপান্তর:"
      : "VIP Experience (VE) Conversion:",

    productType: isBangla ? "প্রোডাক্টের ধরন" : "Product Type",

    turnover: isBangla ? "টার্নওভার | VE" : "Turnover | VE",

    productList: isBangla
      ? "ব্রোঞ্জ, সিলভার, গোল্ড, এমেরাল্ড, রুবি, ডায়মন্ড"
      : "Bronze, Silver, Gold, Emerald, Ruby, Diamond",

    conversionValue: isBangla ? "১০ = ১ VE" : "10 = 1 VE",

    suitcaseAlt: isBangla ? "VIP পুরস্কারের স্যুটকেস" : "VIP reward suitcase",
  };

  return (
    <section className="vip-experience-section relative w-full overflow-hidden bg-[#12337c] px-4 py-5 text-white sm:px-6 sm:py-7 lg:px-8">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[100px] -top-[120px] h-[460px] w-[230px] rotate-[24deg] bg-[#08285f]/45" />

        <div className="absolute left-[45%] top-[-180px] h-[420px] w-[170px] rotate-[-25deg] bg-[#21488d]/20" />

        <div className="absolute -right-[65px] -top-[150px] h-[460px] w-[200px] rotate-[-24deg] bg-[#092961]/35" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1100px]">
        {/* Main heading */}
        <h1 className="text-[25px] font-black leading-[1.18] tracking-[-0.5px] text-white sm:text-[31px] lg:text-[36px]">
          <span>{texts.titleStart} </span>

          <span className="text-[#ffb638]">{texts.titleHighlight}</span>
        </h1>

        {/* Description */}
        <p className="mt-[5px] max-w-[850px] text-[14px] font-semibold leading-[22px] text-white sm:text-[15px] sm:leading-[25px] lg:text-[16px]">
          {texts.description}
        </p>

        {/* Conversion box */}
        <div className="relative mt-[20px] rounded-[4px] border-[4px] border-[#f3cb58] bg-[#0c2461] px-4 pb-[18px] pt-[17px] sm:px-[18px] sm:pb-[19px] lg:px-[18px]">
          {/* Suitcase image */}
          <img
            src={SUITCASE_IMAGE}
            alt={texts.suitcaseAlt}
            className="vip-suitcase pointer-events-none absolute right-[-28px] top-[-50px] z-20 hidden h-auto w-[145px] object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.25)] sm:block lg:right-[-49px] lg:top-[-29px] lg:w-[155px]"
            loading="lazy"
            draggable={false}
          />

          <h2 className="pr-0 text-[18px] font-extrabold leading-[24px] text-white sm:pr-[120px] sm:text-[20px] lg:text-[21px]">
            {texts.conversionTitle}
          </h2>

          {/* Desktop and tablet table */}
          <div className="mt-[17px] hidden overflow-hidden rounded-[14px] border border-[#3977bd] bg-[#194b8e] p-[14px] sm:block">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="h-[41px] rounded-[5px] bg-[#5894df]">
                  <th className="rounded-l-[5px] px-[13px] text-left text-[12px] font-extrabold text-white">
                    {texts.productType}
                  </th>

                  <th className="rounded-r-[5px] px-[13px] text-right text-[12px] font-extrabold text-white">
                    {texts.turnover}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="h-[70px] border-b border-[#3974ba]">
                  <td className="px-[13px] text-left text-[12px] font-medium text-white">
                    {texts.productList}
                  </td>

                  <td className="px-[13px]">
                    <div className="flex items-center justify-end gap-[10px]">
                      <CircleDollarSign
                        size={27}
                        fill="#e8ac30"
                        color="#f6cf69"
                        strokeWidth={1.5}
                        className="shrink-0 drop-shadow"
                      />

                      <span className="text-[15px] font-extrabold text-white">
                        {isBangla ? "১০" : "10"}
                      </span>

                      <span className="text-[15px] font-extrabold text-white">
                        =
                      </span>

                      <Star
                        size={29}
                        fill="#daa51e"
                        color="#f0c74d"
                        strokeWidth={1}
                        className="shrink-0 drop-shadow"
                      />

                      <span className="text-[15px] font-extrabold text-white">
                        {isBangla ? "১ VE" : "1 VE"}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile suitcase */}
          <div className="mt-4 flex justify-center sm:hidden">
            <img
              src={SUITCASE_IMAGE}
              alt={texts.suitcaseAlt}
              className="vip-suitcase h-auto w-[135px] object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.25)]"
              loading="lazy"
              draggable={false}
            />
          </div>

          {/* Mobile conversion card */}
          <div className="mt-3 overflow-hidden rounded-[12px] border border-[#3977bd] bg-[#194b8e] p-3 sm:hidden">
            <div className="rounded-[6px] bg-[#5894df] px-3 py-[10px] text-center text-[12px] font-extrabold text-white">
              {texts.productType}
            </div>

            <p className="px-2 py-4 text-center text-[13px] font-medium leading-[21px] text-white">
              {texts.productList}
            </p>

            <div className="h-px w-full bg-[#3974ba]" />

            <p className="mt-3 text-center text-[11px] font-bold text-white/65">
              {texts.turnover}
            </p>

            <div className="mt-3 flex items-center justify-center gap-[9px] pb-2">
              <CircleDollarSign
                size={27}
                fill="#e8ac30"
                color="#f6cf69"
                strokeWidth={1.5}
              />

              <span className="text-[15px] font-extrabold text-white">
                {isBangla ? "১০" : "10"}
              </span>

              <span className="text-[15px] font-extrabold text-white">=</span>

              <Star size={29} fill="#daa51e" color="#f0c74d" strokeWidth={1} />

              <span className="text-[15px] font-extrabold text-white">
                {isBangla ? "১ VE" : "1 VE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes vipSuitcaseFloating {
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

          .vip-suitcase {
            animation: vipSuitcaseFloating 2.8s ease-in-out infinite;
            will-change: transform;
          }

          @media (max-width: 639px) {
            @keyframes vipSuitcaseFloating {
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
            .vip-suitcase {
              animation: none;
            }
          }
        `}
      </style>
    </section>
  );
};

export default VipExperiencePoint;
