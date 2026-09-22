import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";
import silverBadgeImage from "../../assets/leaderboard/silver-badge.webp";
import goldBadgeImage from "../../assets/leaderboard/gold-badge.webp";
import bronzeBadgeImage from "../../assets/leaderboard/bronze-badge.webp";

const topWinners = [
  {
    id: 2,
    position: 2,

    // Silver badge
    image: silverBadgeImage,

    username: "**ham8**",
    earning: 2200.75,

    wrapperClass: "order-1 translate-y-[8px]",

    imageClass: "max-h-[280px] sm:max-h-[315px] lg:max-h-[340px]",

    numberClass: "top-[24%] sm:top-[23%] lg:top-[24%]",

    informationClass: "bottom-[9%] sm:bottom-[8%] lg:bottom-[7%]",
  },

  {
    id: 1,
    position: 1,

    // Gold badge
    image: goldBadgeImage,

    username: "**hasa12**",
    earning: 3023.75,

    wrapperClass: "order-2 -translate-y-[7px]",

    imageClass: "max-h-[310px] sm:max-h-[350px] lg:max-h-[375px]",

    numberClass: "top-[23%] sm:top-[22%] lg:top-[22%]",

    informationClass: "bottom-[9%] sm:bottom-[8%] lg:bottom-[7%]",
  },

  {
    id: 3,
    position: 3,

    // Bronze badge
    image: bronzeBadgeImage,

    username: "**on58**",
    earning: 1420.75,

    wrapperClass: "order-3 translate-y-[8px]",

    imageClass: "max-h-[280px] sm:max-h-[315px] lg:max-h-[340px]",

    numberClass: "top-[24%] sm:top-[23%] lg:top-[24%]",

    informationClass: "bottom-[9%] sm:bottom-[8%] lg:bottom-[7%]",
  },
];

const leaderboardData = [
  {
    id: 4,
    position: 4,
    username: "**Bhaga9**",
    earning: 210.3,
  },
  {
    id: 5,
    position: 5,
    username: "*koush5**",
    earning: 278.36,
  },
  {
    id: 6,
    position: 6,
    username: "**vasth77**",
    earning: 202.45,
  },
  {
    id: 7,
    position: 7,
    username: "**vasth77**",
    earning: 202.45,
  },
  {
    id: 8,
    position: 8,
    username: "**vasth77**",
    earning: 202.45,
  },
  {
    id: 9,
    position: 9,
    username: "*koush5**",
    earning: 278.36,
  },
  {
    id: 10,
    position: 10,
    username: "*koush5**",
    earning: 278.36,
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

const formatPosition = (value, isBangla) => {
  const formatted = String(value).padStart(2, "0");

  return isBangla ? convertToBanglaNumber(formatted) : formatted;
};

const formatMoney = (value, isBangla) => {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return isBangla ? convertToBanglaNumber(formatted) : formatted;
};

const ReferralDailyLeaderboard = () => {
  const { isBangla } = useLanguage();

  const texts = {
    title: isBangla ? "দৈনিক রেফারেল লিডারবোর্ড" : "Referral Daily Leaderboard",

    position: isBangla ? "অবস্থান" : "POSITION",

    username: isBangla ? "ইউজারনেম" : "USERNAME",

    earning: isBangla ? "আয়" : "EARNING",

    winnerAlt: isBangla
      ? "রেফারেল লিডারবোর্ড বিজয়ীর ব্যাজ"
      : "Referral leaderboard winner badge",
  };

  return (
    <section className="w-full bg-[#2c579a] px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-[1540px]">
        {/* Heading ribbon */}
        <div className="relative h-[63px] w-full max-w-[620px]">
          <div className="absolute left-0 top-[43px] h-[20px] w-[calc(100%-14px)] bg-[#68e51d] sm:w-[600px]" />

          <div className="leaderboard-heading absolute left-0 top-0 flex h-[43px] w-[calc(100%-23px)] items-center bg-[#217dce] px-5 sm:w-[615px]">
            <h2 className="text-[16px] font-bold text-white sm:text-[18px]">
              {texts.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="mt-[17px] grid grid-cols-1 gap-[18px] lg:grid-cols-[1.06fr_1fr]">
          {/* Top 3 badges */}
          <div className="flex min-h-[350px] items-end overflow-hidden rounded-[16px] border border-[#2bf2c3] bg-[#194d7b] px-2 pb-[7px] pt-3 sm:min-h-[400px] sm:px-5 lg:h-[466px] lg:px-7">
            <div className="grid h-full w-full grid-cols-3 items-end gap-0 sm:gap-2">
              {topWinners.map((winner) => (
                <div
                  key={winner.id}
                  className={`relative flex h-full min-w-0 items-end justify-center ${winner.wrapperClass}`}
                >
                  <div className="relative flex h-full w-full items-center justify-center">
                    {/* Badge image */}
                    <img
                      src={winner.image}
                      alt={`${texts.winnerAlt} ${winner.position}`}
                      className={`h-auto w-full object-contain object-bottom ${winner.imageClass}`}
                      loading="lazy"
                      draggable={false}
                    />

                    {/* Position number */}
                    <div
                      className={`pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 ${winner.numberClass}`}
                    >
                      <span className="block text-center mt-12 text-[30px] font-black leading-none text-[#623300] drop-shadow-[0_1px_1px_rgba(255,255,255,0.15)] sm:text-[42px] lg:text-[50px]">
                        {isBangla
                          ? convertToBanglaNumber(winner.position)
                          : winner.position}
                      </span>
                    </div>

                    {/* Amount and username */}
                    <div
                      className={`pointer-events-none absolute left-1/2 z-20 w-[88%] -translate-x-1/2 text-center font-extrabold leading-[1.12] text-white mb-18 ${winner.informationClass}`}
                    >
                      <p className="whitespace-nowrap text-[11px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)] sm:text-[16px] lg:text-[18px]">
                        ৳{formatMoney(winner.earning, isBangla)}
                      </p>

                      <p className="mt-[3px] truncate text-[10px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)] sm:text-[14px] lg:text-[17px]">
                        {winner.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop/tablet leaderboard */}
          <div className="hidden h-[466px] overflow-hidden rounded-[16px] border border-[#25f0a2] sm:block">
            <table className="h-full w-full table-fixed border-collapse">
              <thead>
                <tr className="h-[43px] bg-[#2b6baa] text-[#00ff38]">
                  <th className="w-[31%] border-b border-r border-[#8ac7f3] px-3 text-center text-[12px] font-extrabold">
                    {texts.position}
                  </th>

                  <th className="w-[38%] border-b border-r border-[#8ac7f3] px-3 text-center text-[12px] font-extrabold">
                    {texts.username}
                  </th>

                  <th className="w-[31%] border-b border-[#8ac7f3] px-3 text-center text-[12px] font-extrabold">
                    {texts.earning}
                  </th>
                </tr>
              </thead>

              <tbody>
                {leaderboardData.map((item) => (
                  <tr
                    key={item.id}
                    className="h-[60px] bg-[#2c68a7] text-white"
                  >
                    <td className="border-b border-r border-[#8ac7f3] px-3 text-center text-[13px] font-extrabold">
                      {formatPosition(item.position, isBangla)}
                    </td>

                    <td className="border-b border-r border-[#8ac7f3] px-3 text-center text-[13px] font-extrabold">
                      {item.username}
                    </td>

                    <td className="border-b border-[#8ac7f3] px-3 text-center text-[13px] font-extrabold">
                      ৳{formatMoney(item.earning, isBangla)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile leaderboard */}
          <div className="overflow-hidden rounded-[13px] border border-[#25f0a2] sm:hidden">
            <div className="grid grid-cols-[70px_1fr_100px] bg-[#00ee37] px-2 py-[10px] text-center text-[10px] font-extrabold text-[#06446c]">
              <span>{texts.position}</span>
              <span>{texts.username}</span>
              <span>{texts.earning}</span>
            </div>

            {leaderboardData.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[70px_1fr_100px] items-center border-t border-[#8ac7f3] bg-[#2c68a7] px-2 py-[13px] text-center text-[11px] font-bold text-white"
              >
                <span>{formatPosition(item.position, isBangla)}</span>

                <span className="truncate px-1">{item.username}</span>

                <span>৳{formatMoney(item.earning, isBangla)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          .leaderboard-heading {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 13px) 100%,
              0 100%
            );
          }

          @media (max-width: 639px) {
            .leaderboard-heading {
              clip-path: polygon(
                0 0,
                100% 0,
                calc(100% - 11px) 100%,
                0 100%
              );
            }
          }
        `}
      </style>
    </section>
  );
};

export default ReferralDailyLeaderboard;
