import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";
import SLOT_MACHINE_IMAGE from "../../assets/vip/slot-machine.png";

const VipExperienceExample = () => {
  const { isBangla } = useLanguage();

  const texts = {
    example: isBangla ? "উদাহরণ" : "Example for",

    title: isBangla
      ? "VIP এক্সপেরিয়েন্স (VE) পয়েন্ট:"
      : "VIP Experience (VE) Point:",

    description: isBangla
      ? "ধরুন, আপনি Silver tier-এ রয়েছেন এবং Slots-এ ৫০,০০০ ও Live Casino-তে ৮০,০০০ টার্নওভার করেছেন:"
      : "If you are in Silver tier and make a turnover of 50,000 on Slots and 80,000 on Live Casino:",

    slotsTitle: isBangla ? "Slots টার্নওভার" : "Slots turnover",

    slotsAmount: isBangla ? "৫০,০০০" : "50,000",

    slotsConversion: isBangla
      ? "Slots কনভার্সন: ১০০%"
      : "Slots conversion: 100%",

    slotsCalculation: isBangla
      ? "→ টার্নওভার ৫০,০০০ × ১০০% = ৫০,০০০"
      : "→ Turnover 50,000 × 100% = 50,000",

    slotsResult: isBangla
      ? "অর্থাৎ, ৫০,০০০ ÷ ১০ = ৫,০০০ VE"
      : "i.e. 50,000 ÷ 10 = 5,000 VE",

    casinoTitle: isBangla ? "Live Casino টার্নওভার" : "Live Casino turnover",

    casinoAmount: isBangla ? "৮০,০০০" : "80,000",

    casinoConversion: isBangla
      ? "Casino কনভার্সন: ৫০%"
      : "Casino conversion: 50%",

    casinoCalculation: isBangla
      ? "→ টার্নওভার ৮০,০০০ × ৫০% = ৪০,০০০"
      : "→ Turnover 80,000 × 50% = 40,000",

    casinoResult: isBangla
      ? "অর্থাৎ, ৪০,০০০ ÷ ১০ = ৪,০০০ VE"
      : "i.e. 40,000 ÷ 10 = 4,000 VE",

    total: isBangla
      ? "মোট অর্জিত VE পয়েন্ট = ৯,০০০ VE"
      : "Total VE Points earned = 9,000 VE",

    imageAlt: isBangla ? "VIP বোনাস স্লট মেশিন" : "VIP bonus slot machine",
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#12337c] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8 lg:pb-[150px]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[100px] -top-[170px] h-[500px] w-[230px] rotate-[24deg] bg-[#092860]/35" />

        <div className="absolute left-[47%] top-[-170px] h-[400px] w-[160px] rotate-[-23deg] bg-[#244b91]/15" />

        <div className="absolute -right-[80px] -top-[160px] h-[470px] w-[200px] rotate-[-25deg] bg-[#092860]/30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1100px]">
        {/* Main box */}
        <div className="relative rounded-[12px] border-[4px] border-[#f3cb58] bg-[#0b2862] px-5 py-6 sm:px-8 sm:py-8 lg:min-h-[420px] lg:px-[36px] lg:py-[35px]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[46%_54%] lg:gap-[25px]">
            {/* Left content */}
            <div className="relative z-10">
              <h2 className="text-[28px] font-black leading-[1.15] tracking-[-0.5px] text-white sm:text-[34px] lg:text-[36px]">
                <span className="block">{texts.example}</span>

                <span className="mt-[2px] block text-[#ffcf00]">
                  {texts.title}
                </span>
              </h2>

              <p className="mt-[16px] max-w-[480px] text-[14px] font-medium leading-[22px] text-white sm:text-[15px] sm:leading-[23px]">
                {texts.description}
              </p>

              {/* Mobile image */}
              <div className="mt-7 flex justify-center lg:hidden">
                <img
                  src={SLOT_MACHINE_IMAGE}
                  alt={texts.imageAlt}
                  className="vip-slot-machine h-auto w-full max-w-[430px] object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.3)]"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            </div>

            {/* Calculations */}
            <div className="relative z-10 flex flex-col justify-center">
              {/* Slots calculation */}
              <CalculationCard
                title={texts.slotsTitle}
                amount={texts.slotsAmount}
                conversion={texts.slotsConversion}
                calculation={texts.slotsCalculation}
                result={texts.slotsResult}
              />

              {/* Casino calculation */}
              <CalculationCard
                title={texts.casinoTitle}
                amount={texts.casinoAmount}
                conversion={texts.casinoConversion}
                calculation={texts.casinoCalculation}
                result={texts.casinoResult}
                className="mt-[18px]"
              />

              {/* Total result */}
              <div className="mt-[18px] flex min-h-[54px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#36a912] to-[#61bf0c] px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.13)]">
                <p className="text-[17px] font-extrabold leading-[23px] text-white sm:text-[20px] lg:text-[22px]">
                  {texts.total}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop animated slot machine */}
          <img
            src={SLOT_MACHINE_IMAGE}
            alt={texts.imageAlt}
            className="vip-slot-machine pointer-events-none absolute bottom-[-145px] left-[-42px] z-20 hidden h-auto w-[545px] object-contain drop-shadow-[0_15px_22px_rgba(0,0,0,0.32)] lg:block xl:left-[-55px] xl:w-[575px]"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>

      <style>
        {`
          @keyframes vipSlotFloating {
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

          .vip-slot-machine {
            animation: vipSlotFloating 3s ease-in-out infinite;
            will-change: transform;
          }

          @media (max-width: 1023px) {
            @keyframes vipSlotFloating {
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
            .vip-slot-machine {
              animation: none;
            }
          }
        `}
      </style>
    </section>
  );
};

const CalculationCard = ({
  title,
  amount,
  conversion,
  calculation,
  result,
  className = "",
}) => {
  return (
    <div className={className}>
      <div className="rounded-[11px] bg-gradient-to-r from-[#2860aa] to-[#3479cc] px-4 py-[13px] sm:px-[15px]">
        <h3 className="text-[17px] font-extrabold leading-[23px] text-white sm:text-[20px]">
          {title} <span className="text-[#ffbd2e]">({amount}):</span>
        </h3>
      </div>

      <div className="px-0 pt-[7px] text-[13px] font-semibold leading-[22px] text-white sm:text-[15px]">
        <p>{conversion}</p>

        <p>{calculation}</p>

        <p>
          {result.includes("=") ? (
            <>
              {result.split("=")[0]}=
              <strong className="font-black">{result.split("=")[1]}</strong>
            </>
          ) : (
            result
          )}
        </p>
      </div>
    </div>
  );
};

export default VipExperienceExample;
