import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";
import GIFT_BOX_IMAGE from "../../assets/vip/gift-box.png";

const VipPointsExample = () => {
  const { isBangla } = useLanguage();

  const texts = {
    titleStart: isBangla ? "কী" : "What is",
    titleHighlight: isBangla ? "VIP পয়েন্ট?" : "VIP Points?",

    description: isBangla
      ? "VIP পয়েন্ট হলো এমন একটি পয়েন্ট, যা বাস্তব টাকার সঙ্গে বিনিময় করা যায়।"
      : "VIP points are the points which can be used to exchange with real cash.",

    example: isBangla ? "উদাহরণ: Silver Tier" : "Example: Silver Tier",

    slotsTitle: isBangla ? "১. Slots টার্নওভার" : "1. Slots Turnover",

    slotsAmount: isBangla ? "৫০,০০০" : "50,000",

    slotsConversion: isBangla
      ? "কনভার্সন: ১০০% → ১ টার্নওভার = ১ পয়েন্ট"
      : "Conversion: 100% → 1 turnover = 1 point",

    slotsResult: isBangla
      ? "৫০,০০০ টার্নওভার = ৫০,০০০ VIP পয়েন্ট"
      : "50,000 turnover = 50,000 VIP Points",

    casinoTitle: isBangla
      ? "২. Live Casino টার্নওভার"
      : "2. Live Casino Turnover",

    casinoAmount: isBangla ? "৮০,০০০" : "80,000",

    casinoConversion: isBangla
      ? "কনভার্সন: ৫০% → ২ টার্নওভার = ১ পয়েন্ট"
      : "Conversion: 50% → 2 turnover = 1 point",

    casinoResult: isBangla
      ? "৮০,০০০ ÷ ২ = ৪০,০০০ VIP পয়েন্ট"
      : "80,000 ÷ 2 = 40,000 VIP Points",

    totalTitle: isBangla ? "৩. মোট VIP পয়েন্ট" : "3. Total VIP Points",

    totalResult: isBangla
      ? "৫০,০০০ + ৪০,০০০ = ৯০,০০০ VIP পয়েন্ট"
      : "50,000 + 40,000 = 90,000 VIP Points",

    exchangeTitle: isBangla
      ? "৪. বাস্তব টাকায় বিনিময়"
      : "4. Exchange to Real Cash",

    exchangeFirstPrefix: isBangla ? "৮০০ VIP পয়েন্ট =" : "800 VIP Points =",

    exchangeFirstValue: isBangla ? "১ টাকা" : "1 Real Cash",

    exchangeSecondPrefix: isBangla ? "৯০,০০০ ÷ ৮০০ =" : "90,000 ÷ 800 =",

    exchangeSecondValue: isBangla ? "১১২.৫ টাকা" : "112.5 Real Cash",

    imageAlt: isBangla
      ? "VIP পয়েন্ট পুরস্কারের বাক্স"
      : "VIP points reward gift box",
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#12337c] px-4 py-5 text-white sm:px-6 sm:py-7 lg:px-8 lg:pb-[80px]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[100px] -top-[160px] h-[480px] w-[220px] rotate-[24deg] bg-[#092860]/35" />

        <div className="absolute left-[47%] top-[-170px] h-[410px] w-[160px] rotate-[-23deg] bg-[#244b91]/15" />

        <div className="absolute -right-[70px] -top-[160px] h-[460px] w-[200px] rotate-[-25deg] bg-[#092860]/30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1100px]">
        {/* Heading */}
        <h1 className="text-[26px] font-black leading-[1.15] tracking-[-0.5px] text-white sm:text-[31px] lg:text-[35px]">
          <span>{texts.titleStart} </span>

          <span className="text-[#ffdd00]">{texts.titleHighlight}</span>
        </h1>

        {/* Description */}
        <p className="mt-[13px] text-[14px] font-medium leading-[22px] text-white sm:text-[15px]">
          {texts.description}
        </p>

        {/* Main box */}
        <div className="relative mt-[30px] rounded-[12px] border-[4px] border-[#f2cb5d] bg-[#0b2862] px-4 pb-5 pt-6 sm:px-[17px] sm:pb-6 lg:min-h-[550px] lg:px-[16px] lg:py-[35px]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[52%_48%] lg:gap-[25px]">
            {/* Left content */}
            <div className="relative z-10">
              <h2 className="mb-[15px] text-[16px] font-extrabold text-white sm:text-[18px]">
                {texts.example}
              </h2>

              {/* Slots */}
              <PointCalculationBlock
                title={texts.slotsTitle}
                amount={texts.slotsAmount}
                lines={[texts.slotsConversion, texts.slotsResult]}
              />

              {/* Casino */}
              <PointCalculationBlock
                title={texts.casinoTitle}
                amount={texts.casinoAmount}
                lines={[texts.casinoConversion, texts.casinoResult]}
                className="mt-[21px]"
              />

              {/* Total */}
              <PointCalculationBlock
                title={texts.totalTitle}
                lines={[texts.totalResult]}
                className="mt-[21px]"
              />

              {/* Exchange */}
              <div className="mt-[21px]">
                <div className="rounded-[9px] bg-gradient-to-r from-[#2860aa] to-[#3479cc] px-[13px] py-[11px]">
                  <h3 className="text-[16px] font-extrabold text-white sm:text-[18px]">
                    {texts.exchangeTitle}
                  </h3>
                </div>

                <div className="mt-[10px] space-y-[6px] text-[12px] font-semibold text-white">
                  <p className="flex flex-wrap items-center gap-[5px]">
                    <span>{texts.exchangeFirstPrefix}</span>

                    <span className="rounded-[6px] bg-[#4ca913] px-[10px] py-[3px] text-[12px] font-extrabold text-white">
                      {texts.exchangeFirstValue}
                    </span>
                  </p>

                  <p className="flex flex-wrap items-center gap-[5px]">
                    <span>{texts.exchangeSecondPrefix}</span>

                    <span className="rounded-[6px] bg-[#4ca913] px-[10px] py-[3px] text-[12px] font-extrabold text-white">
                      {texts.exchangeSecondValue}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile image */}
            <div className="flex items-end justify-center lg:hidden">
              <img
                src={GIFT_BOX_IMAGE}
                alt={texts.imageAlt}
                className="vip-gift-box h-auto w-full max-w-[430px] object-contain drop-shadow-[0_15px_22px_rgba(0,0,0,0.35)]"
                loading="lazy"
                draggable={false}
              />
            </div>

            {/* Desktop image space */}
            <div className="hidden lg:block" />
          </div>

          {/* Desktop gift box */}
          <img
            src={GIFT_BOX_IMAGE}
            alt={texts.imageAlt}
            className="vip-gift-box pointer-events-none absolute bottom-[-31px] right-[-30px] z-20 hidden h-auto w-[485px] object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.36)] lg:block xl:right-[-48px] xl:w-[515px]"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>

      <style>
        {`
          @keyframes vipGiftBoxFloating {
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

          .vip-gift-box {
            animation: vipGiftBoxFloating 3s ease-in-out infinite;
            will-change: transform;
          }

          @media (max-width: 1023px) {
            @keyframes vipGiftBoxFloating {
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
            .vip-gift-box {
              animation: none;
            }
          }
        `}
      </style>
    </section>
  );
};

const PointCalculationBlock = ({
  title,
  amount,
  lines = [],
  className = "",
}) => {
  return (
    <div className={className}>
      <div className="rounded-[9px] bg-gradient-to-r from-[#2860aa] to-[#3479cc] px-[13px] py-[11px]">
        <h3 className="text-[16px] font-extrabold leading-[22px] text-white sm:text-[18px]">
          {title}

          {amount && (
            <>
              {" "}
              <span className="text-[#ffbd2e]">({amount})</span>
            </>
          )}
        </h3>
      </div>

      {lines.length > 0 && (
        <div className="mt-[8px] space-y-[6px] text-[12px] font-medium leading-[18px] text-white">
          {lines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default VipPointsExample;
