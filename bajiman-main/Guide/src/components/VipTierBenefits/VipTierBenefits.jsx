import React, { useMemo, useState } from "react";
import {
  Banknote,
  CircleDollarSign,
  CreditCard,
  Gift,
  Star,
} from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import bronzeTierImage from "../../assets/vip-tiers/bronze.webp";
import silverTierImage from "../../assets/vip-tiers/silver.webp";
import goldTierImage from "../../assets/vip-tiers/gold.webp";
import emeraldTierImage from "../../assets/vip-tiers/emerald.webp";
import rubyTierImage from "../../assets/vip-tiers/ruby.webp";
import diamondTierImage from "../../assets/vip-tiers/diamond.webp";
import sapphireTierImage from "../../assets/vip-tiers/sapphire.webp";

const vipTiers = [
  {
    id: "bronze",
    name: {
      en: "Bronze",
      bn: "ব্রোঞ্জ",
    },
    image: bronzeTierImage,
    theme: {
      pageBackground: "#10357e",
      panelBackground: "#9c5815",
      panelBackgroundLight: "#b86b1c",
      rowBackground: "rgba(232, 143, 42, 0.82)",
      selectedBackground: "rgba(255,255,255,0.26)",
      selectedBorder: "#e0c18c",
      text: "#ffffff",
      mutedText: "#372414",
    },
    benefits: {
      vipPoints: null,
      pointsToCash: 1200,
      slotsRebate: "0.70%",
      casinoRebate: "0.35%",
      sportsRebate: "0.20%",
      pointConversion: 10,
      maintenance: null,
      paymentSolutions: false,
      instantPayments: false,
      manager: false,
      birthdayBonus: false,
      exclusiveRewards: false,
      deluxeGifts: false,
    },
  },
  {
    id: "silver",
    name: {
      en: "Silver",
      bn: "সিলভার",
    },
    image: silverTierImage,
    theme: {
      pageBackground: "#10357e",
      panelBackground: "#d5d8de",
      panelBackgroundLight: "#edf0f4",
      rowBackground: "rgba(238,238,239,0.88)",
      selectedBackground: "rgba(88,145,231,0.28)",
      selectedBorder: "#84aef0",
      text: "#123b7d",
      mutedText: "#7287aa",
    },
    benefits: {
      vipPoints: 10000,
      pointsToCash: 1100,
      slotsRebate: "0.80%",
      casinoRebate: "0.45%",
      sportsRebate: "0.30%",
      pointConversion: 10,
      maintenance: 5000,
      paymentSolutions: true,
      instantPayments: false,
      manager: false,
      birthdayBonus: false,
      exclusiveRewards: false,
      deluxeGifts: false,
    },
  },
  {
    id: "gold",
    name: {
      en: "Gold",
      bn: "গোল্ড",
    },
    image: goldTierImage,
    theme: {
      pageBackground: "#10357e",
      panelBackground: "#a87b12",
      panelBackgroundLight: "#d9a525",
      rowBackground: "rgba(221,170,43,0.87)",
      selectedBackground: "rgba(255,232,133,0.25)",
      selectedBorder: "#ffe082",
      text: "#ffffff",
      mutedText: "#4e3909",
    },
    benefits: {
      vipPoints: 25000,
      pointsToCash: 1000,
      slotsRebate: "0.90%",
      casinoRebate: "0.55%",
      sportsRebate: "0.40%",
      pointConversion: 10,
      maintenance: 4500,
      paymentSolutions: true,
      instantPayments: true,
      manager: false,
      birthdayBonus: false,
      exclusiveRewards: false,
      deluxeGifts: false,
    },
  },
  {
    id: "emerald",
    name: {
      en: "Emerald",
      bn: "এমেরাল্ড",
    },
    image: emeraldTierImage,
    theme: {
      pageBackground: "#10357e",
      panelBackground: "#08766e",
      panelBackgroundLight: "#0aa58c",
      rowBackground: "rgba(15,169,142,0.82)",
      selectedBackground: "rgba(85,255,210,0.21)",
      selectedBorder: "#45f0cb",
      text: "#ffffff",
      mutedText: "#c8f9ed",
    },
    benefits: {
      vipPoints: 50000,
      pointsToCash: 900,
      slotsRebate: "1.00%",
      casinoRebate: "0.65%",
      sportsRebate: "0.50%",
      pointConversion: 10,
      maintenance: 4000,
      paymentSolutions: true,
      instantPayments: true,
      manager: true,
      birthdayBonus: false,
      exclusiveRewards: false,
      deluxeGifts: false,
    },
  },
  {
    id: "ruby",
    name: {
      en: "Ruby",
      bn: "রুবি",
    },
    image: rubyTierImage,
    theme: {
      pageBackground: "#10357e",
      panelBackground: "#9b153b",
      panelBackgroundLight: "#ce2856",
      rowBackground: "rgba(212,45,91,0.83)",
      selectedBackground: "rgba(255,145,170,0.22)",
      selectedBorder: "#ff809e",
      text: "#ffffff",
      mutedText: "#ffd5df",
    },
    benefits: {
      vipPoints: 100000,
      pointsToCash: 800,
      slotsRebate: "1.10%",
      casinoRebate: "0.75%",
      sportsRebate: "0.60%",
      pointConversion: 10,
      maintenance: 3500,
      paymentSolutions: true,
      instantPayments: true,
      manager: true,
      birthdayBonus: true,
      exclusiveRewards: false,
      deluxeGifts: false,
    },
  },
  {
    id: "diamond",
    name: {
      en: "Diamond",
      bn: "ডায়মন্ড",
    },
    image: diamondTierImage,
    theme: {
      pageBackground: "#10357e",
      panelBackground: "#176ba0",
      panelBackgroundLight: "#269ed0",
      rowBackground: "rgba(50,157,205,0.84)",
      selectedBackground: "rgba(120,224,255,0.24)",
      selectedBorder: "#74ddff",
      text: "#ffffff",
      mutedText: "#d4f6ff",
    },
    benefits: {
      vipPoints: 250000,
      pointsToCash: 700,
      slotsRebate: "1.20%",
      casinoRebate: "0.85%",
      sportsRebate: "0.70%",
      pointConversion: 10,
      maintenance: 3000,
      paymentSolutions: true,
      instantPayments: true,
      manager: true,
      birthdayBonus: true,
      exclusiveRewards: true,
      deluxeGifts: false,
    },
  },
  {
    id: "sapphire",
    name: {
      en: "Sapphire",
      bn: "স্যাফায়ার",
    },
    image: sapphireTierImage,
    theme: {
      pageBackground: "#10357e",
      panelBackground: "#233c9c",
      panelBackgroundLight: "#345bd4",
      rowBackground: "rgba(59,91,205,0.86)",
      selectedBackground: "rgba(125,154,255,0.24)",
      selectedBorder: "#8ca8ff",
      text: "#ffffff",
      mutedText: "#dce4ff",
    },
    benefits: {
      vipPoints: 500000,
      pointsToCash: 600,
      slotsRebate: "1.30%",
      casinoRebate: "0.95%",
      sportsRebate: "0.80%",
      pointConversion: 10,
      maintenance: 2500,
      paymentSolutions: true,
      instantPayments: true,
      manager: true,
      birthdayBonus: true,
      exclusiveRewards: true,
      deluxeGifts: true,
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

const toBanglaNumber = (value) =>
  String(value).replace(/\d/g, (digit) => banglaDigits[digit]);

const formatNumber = (value, isBangla) => {
  const formatted = new Intl.NumberFormat("en-US").format(value);

  return isBangla ? toBanglaNumber(formatted) : formatted;
};

const VipTierBenefits = () => {
  const { isBangla } = useLanguage();
  const [selectedTierId, setSelectedTierId] = useState("bronze");

  const selectedTier = useMemo(
    () => vipTiers.find((tier) => tier.id === selectedTierId) || vipTiers[0],
    [selectedTierId],
  );

  const { theme, benefits } = selectedTier;

  const texts = {
    section: isBangla ? "VIP টিয়ার সুবিধাসমূহ" : "VIP Tier Benefits",

    vipPoints: isBangla ? "VIP পয়েন্ট" : "VIP Points",

    pointsToCash: isBangla ? "VIP পয়েন্ট থেকে নগদ টাকা" : "VIP Points to Cash",

    slotsRebate: isBangla ? "Slots ইনস্ট্যান্ট রিবেট" : "Slots Instant Rebate",

    casinoRebate: isBangla
      ? "Live Casino ইনস্ট্যান্ট রিবেট"
      : "Live Casino Instant Rebate",

    sportsRebate: isBangla
      ? "Sports ইনস্ট্যান্ট রিবেট"
      : "Sports Instant Rebate",

    conversion: isBangla ? "VIP পয়েন্ট কনভার্সন" : "VIP Point Conversion",

    maintenance: isBangla
      ? "VIP পয়েন্ট মেইনটেন্যান্স"
      : "VIP Point Maintenance",

    paymentSolutions: isBangla ? "VIP পেমেন্ট সুবিধা" : "VIP Payment Solutions",

    instantPayments: isBangla
      ? "VIP ইনস্ট্যান্ট পেমেন্ট"
      : "VIP Instant Payments",

    manager: isBangla ? "VIP ডেডিকেটেড ম্যানেজার" : "VIP Dedicated Manager",

    birthdayBonus: isBangla ? "VIP জন্মদিনের বোনাস" : "VIP Birthday Bonus",

    exclusiveRewards: isBangla ? "VIP বিশেষ পুরস্কার" : "VIP Exclusive Rewards",

    deluxeGifts: isBangla ? "VIP ডিলাক্স উপহার" : "VIP Deluxe Gifts",

    yes: isBangla ? "হ্যাঁ" : "Yes",
  };

  const benefitRows = [
    benefits.vipPoints !== null && {
      id: "vip-points",
      label: texts.vipPoints,
      type: "points",
      value: benefits.vipPoints,
    },
    {
      id: "cash",
      label: texts.pointsToCash,
      type: "cash",
      value: benefits.pointsToCash,
    },
    {
      id: "slots",
      label: texts.slotsRebate,
      type: "rebate",
      value: benefits.slotsRebate,
    },
    {
      id: "casino",
      label: texts.casinoRebate,
      type: "rebate",
      value: benefits.casinoRebate,
    },
    {
      id: "sports",
      label: texts.sportsRebate,
      type: "rebate",
      value: benefits.sportsRebate,
    },
    {
      id: "conversion",
      label: texts.conversion,
      type: "conversion",
      value: benefits.pointConversion,
    },
    {
      id: "maintenance",
      label: texts.maintenance,
      type: "points-or-empty",
      value: benefits.maintenance,
    },
    {
      id: "payment",
      label: texts.paymentSolutions,
      type: "boolean",
      value: benefits.paymentSolutions,
    },
    {
      id: "instant-payment",
      label: texts.instantPayments,
      type: "boolean",
      value: benefits.instantPayments,
    },
    {
      id: "manager",
      label: texts.manager,
      type: "boolean",
      value: benefits.manager,
    },
    {
      id: "birthday",
      label: texts.birthdayBonus,
      type: "boolean",
      value: benefits.birthdayBonus,
    },
    {
      id: "rewards",
      label: texts.exclusiveRewards,
      type: "boolean",
      value: benefits.exclusiveRewards,
    },
    {
      id: "gifts",
      label: texts.deluxeGifts,
      type: "boolean",
      value: benefits.deluxeGifts,
    },
  ].filter(Boolean);

  return (
    <section
      className="relative w-full overflow-hidden px-3 py-5 sm:px-6 lg:px-8"
      style={{
        backgroundColor: theme.pageBackground,
      }}
      aria-label={texts.section}
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[95px] top-0 h-full w-[220px] rotate-[-7deg] bg-[#0b2c72]/75 shadow-[25px_0_60px_rgba(17,85,220,0.28)]" />

        <div className="absolute -right-[95px] top-0 h-full w-[220px] rotate-[7deg] bg-[#0b2c72]/75 shadow-[-25px_0_60px_rgba(17,85,220,0.28)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1100px] rounded-[7px] border-[4px] border-[#f4cf62] bg-[#092667] p-4 sm:p-[16px]">
        {/* Tier selector */}
        <div
          className="vip-polygon-background overflow-x-auto rounded-[14px] p-2 sm:p-[9px]"
          style={{
            backgroundColor: theme.panelBackground,
          }}
        >
          <div className="flex min-w-max items-stretch justify-start gap-2 sm:w-full sm:min-w-0 sm:justify-between">
            {vipTiers.map((tier) => {
              const isSelected = tier.id === selectedTierId;

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTierId(tier.id)}
                  className="flex w-[92px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-[6px] border px-2 py-[8px] transition-all duration-300 hover:-translate-y-1 sm:w-[13.5%] sm:min-w-[85px]"
                  style={{
                    backgroundColor: isSelected
                      ? theme.selectedBackground
                      : "transparent",

                    borderColor: isSelected
                      ? theme.selectedBorder
                      : "transparent",

                    boxShadow: isSelected
                      ? `0 0 12px ${theme.selectedBorder}55`
                      : "none",
                  }}
                >
                  <img
                    src={tier.image}
                    alt={isBangla ? tier.name.bn : tier.name.en}
                    className={`h-[66px] w-[66px] object-contain transition-all duration-300 sm:h-[72px] sm:w-[72px] ${
                      isSelected
                        ? "scale-105 brightness-110 saturate-125"
                        : "grayscale brightness-75 opacity-75"
                    }`}
                    loading="lazy"
                    draggable={false}
                  />

                  <span
                    className="mt-1 text-[11px] font-bold"
                    style={{
                      color: isSelected ? theme.text : theme.mutedText,
                    }}
                  >
                    {isBangla ? tier.name.bn : tier.name.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div
          className="vip-polygon-background mt-4 overflow-hidden rounded-[14px] p-2 sm:p-[9px]"
          style={{
            backgroundColor: theme.panelBackground,
          }}
        >
          <div className="flex flex-col gap-[7px]">
            {benefitRows.map((row) => (
              <div
                key={row.id}
                className="grid min-h-[40px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[4px] px-3 py-[8px] sm:px-[11px]"
                style={{
                  backgroundColor: theme.rowBackground,
                  color: theme.text,
                }}
              >
                <span className="text-[11px] font-bold sm:text-[12px]">
                  {row.label}
                </span>

                <BenefitValue
                  row={row}
                  isBangla={isBangla}
                  yesText={texts.yes}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          .vip-polygon-background {
            position: relative;
            isolation: isolate;
          }

          .vip-polygon-background::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            opacity: 0.16;
            background-image:
              linear-gradient(
                30deg,
                rgba(255,255,255,0.28) 12%,
                transparent 12.5%,
                transparent 87%,
                rgba(255,255,255,0.28) 87.5%
              ),
              linear-gradient(
                150deg,
                rgba(0,0,0,0.2) 12%,
                transparent 12.5%,
                transparent 87%,
                rgba(0,0,0,0.2) 87.5%
              );
            background-size: 220px 130px;
          }

          .vip-polygon-background {
            scrollbar-width: thin;
            scrollbar-color:
              var(--vip-scroll-thumb, #7aa6db)
              transparent;
          }

          .vip-polygon-background::-webkit-scrollbar {
            height: 5px;
          }

          .vip-polygon-background::-webkit-scrollbar-track {
            background: transparent;
          }

          .vip-polygon-background::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: #7aa6db;
          }
        `}
      </style>
    </section>
  );
};

const BenefitValue = ({ row, isBangla, yesText }) => {
  if (row.type === "points") {
    return (
      <span className="flex items-center gap-2 whitespace-nowrap text-[12px] font-extrabold sm:text-[13px]">
        <Star size={17} fill="#cf9d20" color="#e8c14e" strokeWidth={1} />

        {formatNumber(row.value, isBangla)}
      </span>
    );
  }

  if (row.type === "cash") {
    return (
      <span className="flex items-center gap-[7px] whitespace-nowrap text-[12px] font-extrabold sm:text-[13px]">
        <Gift size={17} color="#f4c13f" fill="#d89022" />

        {formatNumber(row.value, isBangla)}

        <span>›</span>

        <CircleDollarSign
          size={17}
          fill="#b7b8b9"
          color="#d9d9d9"
          strokeWidth={1}
        />

        <span>{isBangla ? "১" : "1"}</span>
      </span>
    );
  }

  if (row.type === "rebate") {
    return (
      <span className="flex items-center gap-[7px] whitespace-nowrap text-[12px] font-extrabold sm:text-[13px]">
        <Banknote size={18} color="#10b83f" fill="#40dc62" strokeWidth={1.5} />

        {isBangla ? toBanglaNumber(row.value) : row.value}
      </span>
    );
  }

  if (row.type === "conversion") {
    return (
      <span className="flex items-center gap-[7px] whitespace-nowrap text-[12px] font-extrabold sm:text-[13px]">
        <CircleDollarSign
          size={17}
          fill="#b7b8b9"
          color="#d9d9d9"
          strokeWidth={1}
        />

        {isBangla ? toBanglaNumber(row.value) : row.value}

        <span>›</span>

        <Star size={17} fill="#cf9d20" color="#e8c14e" strokeWidth={1} />

        <span>{isBangla ? "১" : "1"}</span>
      </span>
    );
  }

  if (row.type === "points-or-empty") {
    if (!row.value) {
      return <span className="text-[14px] font-extrabold">–</span>;
    }

    return (
      <span className="flex items-center gap-2 whitespace-nowrap text-[12px] font-extrabold sm:text-[13px]">
        <Star size={17} fill="#cf9d20" color="#e8c14e" strokeWidth={1} />

        {formatNumber(row.value, isBangla)}
      </span>
    );
  }

  if (row.type === "boolean") {
    if (!row.value) {
      return <span className="text-[14px] font-extrabold">–</span>;
    }

    return (
      <span className="flex items-center gap-2 whitespace-nowrap text-[12px] font-extrabold sm:text-[13px]">
        <CreditCard
          size={17}
          color="#ffd12b"
          fill="#e5a719"
          strokeWidth={1.5}
        />

        {yesText}
      </span>
    );
  }

  return <span className="text-[14px] font-extrabold">–</span>;
};

export default VipTierBenefits;
