import React, { useMemo, useState } from "react";

import { useLanguage } from "../../Context/LanguageProvider";

const earningRatios = [
  {
    id: 1,
    minimum: 100,
    maximum: 10000,
    turnover: {
      en: "৳100 – ৳10,000",
      bn: "৳১০০ – ৳১০,০০০",
    },
    rates: {
      tier1: 0.1,
      tier2: 0.06,
      tier3: 0.02,
    },
  },
  {
    id: 2,
    minimum: 10001,
    maximum: 30000,
    turnover: {
      en: "৳10,001 – ৳30,000",
      bn: "৳১০,০০১ – ৳৩০,০০০",
    },
    rates: {
      tier1: 0.15,
      tier2: 0.07,
      tier3: 0.03,
    },
  },
  {
    id: 3,
    minimum: 30001,
    maximum: Infinity,
    turnover: {
      en: "৳30,001 and above",
      bn: "৳৩০,০০১ এবং তার বেশি",
    },
    rates: {
      tier1: 0.2,
      tier2: 0.09,
      tier3: 0.04,
    },
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

const formatAmount = (value, isBangla = false) => {
  const numericValue = Number(value) || 0;

  const formattedValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);

  return isBangla ? convertToBanglaNumber(formattedValue) : formattedValue;
};

const ReferralEarningCalculator = () => {
  const { isBangla } = useLanguage();

  const [turnover, setTurnover] = useState("");
  const [selectedTier, setSelectedTier] = useState("tier1");
  const [calculatedRebate, setCalculatedRebate] = useState(0);
  const [error, setError] = useState("");

  const texts = {
    ratioTitle: isBangla ? "রেফারেল আয়ের অনুপাত" : "Referral Earning Ratio",

    turnover: isBangla ? "টার্নওভার" : "TURNOVER",
    tier1: isBangla ? "টিয়ার ১" : "TIER 1",
    tier2: isBangla ? "টিয়ার ২" : "TIER 2",
    tier3: isBangla ? "টিয়ার ৩" : "TIER 3",

    calculatorTitle: isBangla
      ? "ক্যাশ রিবেট ক্যালকুলেটর"
      : "Cash Rebate Calculator",

    enterTurnover: isBangla ? "টার্নওভার লিখুন*" : "Enter Turnover*",

    selectTier: isBangla ? "টিয়ার নির্বাচন করুন*" : "Select Tier*",

    calculate: isBangla ? "হিসাব করুন" : "Calculate",

    minimumError: isBangla
      ? "সর্বনিম্ন টার্নওভার ৳১০০ হতে হবে।"
      : "Minimum turnover must be ৳100.",

    invalidError: isBangla
      ? "সঠিক টার্নওভার পরিমাণ লিখুন।"
      : "Please enter a valid turnover amount.",
  };

  const tierOptions = useMemo(
    () => [
      {
        value: "tier1",
        label: texts.tier1,
      },
      {
        value: "tier2",
        label: texts.tier2,
      },
      {
        value: "tier3",
        label: texts.tier3,
      },
    ],
    [isBangla],
  );

  const handleTurnoverChange = (event) => {
    const value = event.target.value;

    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setTurnover(value);
      setError("");
    }
  };

  const calculateRebate = () => {
    const turnoverAmount = Number(turnover);

    if (!turnover || Number.isNaN(turnoverAmount) || turnoverAmount <= 0) {
      setCalculatedRebate(0);
      setError(texts.invalidError);
      return;
    }

    if (turnoverAmount < 100) {
      setCalculatedRebate(0);
      setError(texts.minimumError);
      return;
    }

    const matchedRange = earningRatios.find(
      (range) =>
        turnoverAmount >= range.minimum && turnoverAmount <= range.maximum,
    );

    if (!matchedRange) {
      setCalculatedRebate(0);
      setError(texts.invalidError);
      return;
    }

    const percentage = matchedRange.rates[selectedTier];

    const rebate = (turnoverAmount * percentage) / 100;

    setCalculatedRebate(rebate);
    setError("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      calculateRebate();
    }
  };

  return (
    <section className="w-full bg-[#28559a] px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-[1525px] overflow-hidden rounded-[18px] border-[4px] border-[#3d9cff] bg-[#0b3e71]">
        {/* Referral earning heading */}
        <HeadingRibbon title={texts.ratioTitle} />

        {/* Desktop ratio table */}
        <div className="hidden w-full overflow-hidden sm:block">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="h-[42px] bg-[#21ef2b] text-black">
                <th className="px-2 text-center text-[12px] font-extrabold">
                  {texts.turnover}
                </th>

                <th className="px-2 text-center text-[12px] font-extrabold">
                  {texts.tier1}
                </th>

                <th className="px-2 text-center text-[12px] font-extrabold">
                  {texts.tier2}
                </th>

                <th className="px-2 text-center text-[12px] font-extrabold">
                  {texts.tier3}
                </th>
              </tr>
            </thead>

            <tbody>
              {earningRatios.map((row) => (
                <tr
                  key={row.id}
                  className="h-[40px] border-b border-[#3484c5] bg-[#094783] text-white last:border-b-0"
                >
                  <td className="px-2 text-center text-[13px] font-extrabold">
                    {isBangla ? row.turnover.bn : row.turnover.en}
                  </td>

                  <td className="px-2 text-center text-[13px] font-extrabold">
                    {isBangla
                      ? convertToBanglaNumber(row.rates.tier1)
                      : row.rates.tier1}
                    %
                  </td>

                  <td className="px-2 text-center text-[13px] font-extrabold">
                    {isBangla
                      ? convertToBanglaNumber(row.rates.tier2)
                      : row.rates.tier2}
                    %
                  </td>

                  <td className="px-2 text-center text-[13px] font-extrabold">
                    {isBangla
                      ? convertToBanglaNumber(row.rates.tier3)
                      : row.rates.tier3}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile ratio cards */}
        <div className="grid grid-cols-1 gap-3 px-3 pb-4 sm:hidden">
          {earningRatios.map((row) => (
            <div
              key={row.id}
              className="overflow-hidden rounded-[10px] border border-[#318bd0] bg-[#094783]"
            >
              <div className="bg-[#21ef2b] px-4 py-[9px] text-center text-[13px] font-extrabold text-black">
                {isBangla ? row.turnover.bn : row.turnover.en}
              </div>

              <div className="grid grid-cols-3 divide-x divide-[#3484c5]">
                <div className="px-2 py-3 text-center">
                  <p className="text-[10px] font-bold text-white/60">
                    {texts.tier1}
                  </p>

                  <p className="mt-1 text-[13px] font-extrabold text-white">
                    {isBangla
                      ? convertToBanglaNumber(row.rates.tier1)
                      : row.rates.tier1}
                    %
                  </p>
                </div>

                <div className="px-2 py-3 text-center">
                  <p className="text-[10px] font-bold text-white/60">
                    {texts.tier2}
                  </p>

                  <p className="mt-1 text-[13px] font-extrabold text-white">
                    {isBangla
                      ? convertToBanglaNumber(row.rates.tier2)
                      : row.rates.tier2}
                    %
                  </p>
                </div>

                <div className="px-2 py-3 text-center">
                  <p className="text-[10px] font-bold text-white/60">
                    {texts.tier3}
                  </p>

                  <p className="mt-1 text-[13px] font-extrabold text-white">
                    {isBangla
                      ? convertToBanglaNumber(row.rates.tier3)
                      : row.rates.tier3}
                    %
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calculator heading */}
        <HeadingRibbon title={texts.calculatorTitle} />

        {/* Calculator */}
        <div className="px-4 pb-[18px] pt-[16px] sm:px-6 sm:pb-[19px]">
          <div className="mx-auto flex max-w-[660px] flex-col items-stretch justify-center gap-4 md:flex-row md:items-end md:gap-[35px]">
            {/* Turnover input */}
            <div className="w-full md:w-[180px]">
              <label
                htmlFor="turnover"
                className="mb-[7px] block text-center text-[14px] font-bold text-[#ff4354]"
              >
                {texts.enterTurnover}
              </label>

              <div className="relative">
                <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] font-medium text-white">
                  ৳
                </span>

                <input
                  id="turnover"
                  type="text"
                  inputMode="decimal"
                  value={turnover}
                  onChange={handleTurnoverChange}
                  onKeyDown={handleKeyDown}
                  placeholder="00,00.00"
                  className="h-[43px] w-full rounded-[8px] border border-white bg-[#3e91ed] pl-[30px] pr-3 text-[14px] font-medium text-white outline-none placeholder:text-white focus:border-[#69ed31] focus:ring-2 focus:ring-[#69ed31]/25"
                />
              </div>
            </div>

            {/* Tier selection */}
            <div className="w-full md:w-[182px]">
              <label
                htmlFor="tier"
                className="mb-[7px] block text-center text-[14px] font-bold text-[#ff4354]"
              >
                {texts.selectTier}
              </label>

              <div className="rounded-[8px] border border-white bg-[#061e3e] p-[2px]">
                <select
                  id="tier"
                  value={selectedTier}
                  onChange={(event) => {
                    setSelectedTier(event.target.value);
                    setError("");
                  }}
                  className="h-[37px] w-full cursor-pointer rounded-[5px] border-0 bg-[#3e91ed] px-[14px] text-[14px] font-medium text-white outline-none"
                >
                  {tierOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#3e91ed] text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Equals sign */}
            <div className="hidden h-[43px] items-center justify-center text-[18px] font-extrabold text-[#ff4354] md:flex">
              =
            </div>

            {/* Result */}
            <div className="w-full md:w-[180px]">
              <label className="mb-[7px] block text-center text-[14px] font-bold text-transparent md:hidden">
                Result
              </label>

              <div className="relative flex h-[43px] items-center rounded-[8px] border border-white bg-gradient-to-b from-[#20e86b] to-[#0dd756] px-[14px] text-[14px] font-medium text-white">
                <span className="mr-1">৳</span>

                <span>{formatAmount(calculatedRebate, isBangla)}</span>
              </div>
            </div>
          </div>

          {/* Mobile equals */}
          <div className="my-2 text-center text-[20px] font-extrabold text-[#ff4354] md:hidden">
            =
          </div>

          {/* Error */}
          {error && (
            <p className="mt-3 text-center text-[12px] font-medium text-[#ff6c78]">
              {error}
            </p>
          )}

          {/* Calculate button */}
          <div className="mt-[30px] flex justify-center">
            <button
              type="button"
              onClick={calculateRebate}
              className="h-[34px] min-w-[130px] cursor-pointer rounded-[6px] border border-white bg-gradient-to-b from-[#7aebff] via-[#2b98dc] to-[#0754b9] px-5 text-[14px] font-extrabold text-white shadow-[0_2px_5px_rgba(0,0,0,0.28)] transition-all hover:brightness-110 active:translate-y-px"
            >
              {texts.calculate}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeadingRibbon = ({ title }) => {
  return (
    <div className="relative h-[63px] w-full max-w-[500px]">
      <div className="absolute left-0 top-[16px] h-[47px] w-[calc(100%-18px)] bg-[#70e91c] sm:w-[480px]" />

      <div className="earning-heading-shape absolute left-0 top-0 flex h-[43px] w-[calc(100%-24px)] items-center bg-[#1d7dce] px-4 sm:w-[495px]">
        <h2 className="text-[15px] font-bold text-white sm:text-[17px]">
          {title}
        </h2>
      </div>

      <style>
        {`
          .earning-heading-shape {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 21px) 100%,
              0 100%
            );
          }

          @media (max-width: 639px) {
            .earning-heading-shape {
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
    </div>
  );
};

export default ReferralEarningCalculator;
