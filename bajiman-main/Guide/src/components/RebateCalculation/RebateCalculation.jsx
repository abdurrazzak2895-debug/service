import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";

const rebateData = [
  {
    id: 1,
    player: {
      en: "A",
      bn: "A",
    },
    turnover: 50000,
    tier: {
      en: "Tier 1",
      bn: "টিয়ার ১",
    },
    rebatePercentage: 0.2,
    rebateEarned: 100,
  },
  {
    id: 2,
    player: {
      en: "B",
      bn: "B",
    },
    turnover: 50000,
    tier: {
      en: "Tier 2",
      bn: "টিয়ার ২",
    },
    rebatePercentage: 0.09,
    rebateEarned: 45,
  },
  {
    id: 3,
    player: {
      en: "C",
      bn: "C",
    },
    turnover: 50000,
    tier: {
      en: "Tier 3",
      bn: "টিয়ার ৩",
    },
    rebatePercentage: 0.04,
    rebateEarned: 20,
  },
];

const formatEnglishNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

const convertToBanglaNumber = (value) => {
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

  return String(value).replace(/\d/g, (digit) => banglaDigits[digit]);
};

const formatNumber = (number, isBangla) => {
  const formatted = formatEnglishNumber(number);

  return isBangla ? convertToBanglaNumber(formatted) : formatted;
};

const RebateCalculation = () => {
  const { isBangla } = useLanguage();

  const texts = {
    title: isBangla
      ? "রিবেট কীভাবে হিসাব করা হয়?"
      : "How Rebates get Calculate?",

    description: isBangla
      ? "Player A-এর টার্নওভার ৫০,০০০ হলে আপনি ৳১০০ পাবেন; Player B-এর টার্নওভার ৫০,০০০ হলে আপনি ৳৪৫ পাবেন; এবং Player C-এর টার্নওভার ৫০,০০০ হলে আপনি ৳২০ পাবেন।"
      : "If Player A has a turnover of 50,000, you will get ৳100; if Player B has a turnover of 50,000, you will get ৳45; and if Player C has a turnover of 50,000, you will get ৳20.",

    player: isBangla ? "প্লেয়ার" : "PLAYER",
    turnover: isBangla ? "টার্নওভার" : "TURNOVER",
    tier: isBangla ? "টিয়ার" : "TIER",
    rebate: isBangla ? "রিবেট %" : "REBATE %",
    earned: isBangla ? "অর্জিত রিবেট (৳)" : "REBATE EARNED (৳)",
  };

  return (
    <section className="w-full bg-[#28559a] px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-[1525px] overflow-hidden rounded-[18px] border-[4px] border-[#3d9cff] bg-[#0b3e71]">
        {/* Heading ribbon */}
        <div className="relative h-[65px] w-full max-w-[500px]">
          <div className="absolute left-0 top-[16px] h-[48px] w-[calc(100%-18px)] bg-[#70e91c] sm:w-[480px]" />

          <div className="rebate-title-shape absolute left-0 top-0 flex h-[43px] w-[calc(100%-24px)] items-center bg-[#1d7dce] px-4 sm:w-[495px]">
            <h2 className="text-[15px] font-bold text-white sm:text-[17px]">
              {texts.title}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="px-4 pb-[14px] text-[14px] font-normal leading-[22px] text-white sm:px-[17px] sm:text-[16px] lg:text-[17px]">
          {texts.description}
        </p>

        {/* Desktop table */}
        <div className="hidden w-full overflow-hidden sm:block">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="h-[43px] bg-[#21ef2b] text-[#020902]">
                <th className="px-2 text-center text-[12px] font-extrabold uppercase">
                  {texts.player}
                </th>

                <th className="px-2 text-center text-[12px] font-extrabold uppercase">
                  {texts.turnover}
                </th>

                <th className="px-2 text-center text-[12px] font-extrabold uppercase">
                  {texts.tier}
                </th>

                <th className="px-2 text-center text-[12px] font-extrabold uppercase">
                  {texts.rebate}
                </th>

                <th className="px-2 text-center text-[12px] font-extrabold uppercase">
                  {texts.earned}
                </th>
              </tr>
            </thead>

            <tbody>
              {rebateData.map((row, index) => {
                const isLastRow = index === rebateData.length - 1;

                return (
                  <tr
                    key={row.id}
                    className={`h-[41px] text-white ${
                      isLastRow
                        ? "rebate-active-row"
                        : "border-b border-[#2884c8] bg-[#094783]"
                    }`}
                  >
                    <td className="px-2 text-center text-[13px] font-extrabold">
                      {isBangla ? row.player.bn : row.player.en}
                    </td>

                    <td className="px-2 text-center text-[13px] font-extrabold">
                      {formatNumber(row.turnover, isBangla)}
                    </td>

                    <td className="px-2 text-center text-[13px] font-extrabold">
                      {isBangla ? row.tier.bn : row.tier.en}
                    </td>

                    <td className="px-2 text-center text-[13px] font-extrabold">
                      <span
                        className={isLastRow ? "bg-[#0755e5] px-[2px]" : ""}
                      >
                        {formatNumber(row.rebatePercentage, isBangla)}%
                      </span>
                    </td>

                    <td className="px-2 text-center text-[13px] font-extrabold">
                      <span
                        className={isLastRow ? "bg-[#0755e5] px-[2px]" : ""}
                      >
                        {formatNumber(row.rebateEarned, isBangla)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 px-3 pb-4 sm:hidden">
          {rebateData.map((row, index) => {
            const isLastRow = index === rebateData.length - 1;

            return (
              <div
                key={row.id}
                className={`overflow-hidden rounded-[12px] border ${
                  isLastRow
                    ? "border-[#74ceff] bg-gradient-to-b from-[#2599dc] via-[#07558e] to-[#073660] shadow-[inset_0_0_8px_rgba(97,200,255,0.85)]"
                    : "border-[#2781c7] bg-[#094783]"
                }`}
              >
                <div className="flex items-center justify-between bg-[#21ef2b] px-4 py-2 text-[#020902]">
                  <span className="text-[12px] font-extrabold">
                    {texts.player}
                  </span>

                  <span className="text-[15px] font-extrabold">
                    {isBangla ? row.player.bn : row.player.en}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/60">
                      {texts.turnover}
                    </p>

                    <p className="mt-1 text-[14px] font-bold text-white">
                      {formatNumber(row.turnover, isBangla)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/60">
                      {texts.tier}
                    </p>

                    <p className="mt-1 text-[14px] font-bold text-white">
                      {isBangla ? row.tier.bn : row.tier.en}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/60">
                      {texts.rebate}
                    </p>

                    <p className="mt-1 text-[14px] font-bold text-white">
                      {formatNumber(row.rebatePercentage, isBangla)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/60">
                      {texts.earned}
                    </p>

                    <p className="mt-1 text-[14px] font-bold text-white">
                      ৳{formatNumber(row.rebateEarned, isBangla)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>
        {`
          .rebate-title-shape {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 21px) 100%,
              0 100%
            );
          }

          .rebate-active-row {
            background:
              linear-gradient(
                180deg,
                #239bdf 0%,
                #07598e 35%,
                #073963 72%,
                #062f56 100%
              );
            box-shadow:
              inset 0 0 0 3px #73cfff,
              inset 0 0 12px rgba(88, 195, 255, 0.9);
          }

          @media (max-width: 639px) {
            .rebate-title-shape {
              clip-path: polygon(
                0 0,
                100% 0,
                calc(100% - 17px) 100%,
                0 100%
              );
            }
          }
        `}
      </style>
    </section>
  );
};

export default RebateCalculation;
