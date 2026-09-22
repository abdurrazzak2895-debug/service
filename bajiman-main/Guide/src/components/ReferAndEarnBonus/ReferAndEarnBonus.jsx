import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";

const referralBonusData = [
  {
    id: 1,
    label: {
      en: "Your Bonus",
      bn: "আপনার বোনাস",
    },
    value: {
      en: "৳150",
      bn: "৳১৫০",
    },
  },
  {
    id: 2,
    label: {
      en: "Friend's Bonus",
      bn: "বন্ধুর বোনাস",
    },
    value: {
      en: "৳150",
      bn: "৳১৫০",
    },
  },
  {
    id: 3,
    label: {
      en: "Min/Deposit Turnover",
      bn: "সর্বনিম্ন ডিপোজিট/টার্নওভার",
    },
    value: {
      en: "৳2,000 / ৳6,000",
      bn: "৳২,০০০ / ৳৬,০০০",
    },
  },
  {
    id: 4,
    label: {
      en: "Referrer Deposit/Turnover",
      bn: "রেফারারের ডিপোজিট/টার্নওভার",
    },
    value: {
      en: "৳5,000 / ৳10,000",
      bn: "৳৫,০০০ / ৳১০,০০০",
    },
  },
  {
    id: 5,
    label: {
      en: "Turnover",
      bn: "টার্নওভার",
    },
    value: {
      en: "10x",
      bn: "১০ গুণ",
    },
  },
  {
    id: 6,
    label: {
      en: "Bonus Claim",
      bn: "বোনাস ক্লেইম",
    },
    value: {
      en: "Unlimited",
      bn: "সীমাহীন",
    },
  },
];

const ReferAndEarnBonus = () => {
  const { isBangla } = useLanguage();

  const texts = {
    heading: isBangla
      ? "রেফার করুন এবং আয় করুন"
      : "Refer and Earn",

    offer: isBangla
      ? "আপনার আমন্ত্রণ জানানো প্রতিটি বন্ধুর জন্য ৳৩০০ আয় করুন!"
      : "Earn ৳300 for each friend you invite!",

    description: isBangla
      ? "আপনার বন্ধুদের সঙ্গে আনন্দ ভাগ করে নিন এবং প্রতিটি সফল রেফারেলের জন্য ৳৩০০ আয় করুন! সহজেই আপনার আয় বাড়ানোর এটি একটি দারুণ সুযোগ।"
      : "Share the fun with your friends and earn ৳300 for every referral! It’s your chance to multiply your earnings effortlessly.",
  };

  return (
    <section className="w-full bg-[#28559a] px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-[1525px] overflow-hidden rounded-[18px] border-[4px] border-[#3d9cff] bg-[#0b3e71]">
        {/* Main heading */}
        <HeadingRibbon title={texts.heading} />

        {/* Offer ribbon */}
        <div className="relative mt-[14px] h-[48px] w-full max-w-[650px]">
          <div className="offer-ribbon flex h-[42px] w-[calc(100%-20px)] items-center bg-gradient-to-r from-[#73db30] to-[#98df3f] px-3 sm:w-[645px]">
            <h3 className="text-[15px] font-bold text-white sm:text-[17px]">
              {texts.offer}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="px-4 pb-[13px] pt-[5px] text-[14px] font-normal leading-[22px] text-white sm:px-[17px] sm:text-[16px] lg:text-[17px]">
          {texts.description}
        </p>

        {/* Desktop and tablet table */}
        <div className="hidden px-4 pb-0 sm:block lg:px-[151px]">
          <div className="overflow-hidden rounded-t-[13px] border-x border-t border-[#8ac7f3]">
            <table className="w-full table-fixed border-collapse">
              <tbody>
                {referralBonusData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`h-[40px] text-white ${
                      index === 0
                        ? "bg-gradient-to-b from-[#2787bb] to-[#176397]"
                        : "bg-gradient-to-r from-[#154d7d] to-[#0c3c69]"
                    }`}
                  >
                    <td className="w-1/2 border-b border-r border-[#8ac7f3] px-4 text-center text-[13px] font-extrabold">
                      {isBangla ? row.label.bn : row.label.en}
                    </td>

                    <td className="w-1/2 border-b border-[#8ac7f3] px-4 text-center text-[13px] font-extrabold">
                      {isBangla ? row.value.bn : row.value.en}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="grid grid-cols-1 gap-3 px-3 pb-4 sm:hidden">
          {referralBonusData.map((row, index) => (
            <div
              key={row.id}
              className={`overflow-hidden rounded-[10px] border border-[#80c6f7] ${
                index === 0
                  ? "bg-gradient-to-b from-[#2787bb] to-[#176397]"
                  : "bg-gradient-to-r from-[#154d7d] to-[#0c3c69]"
              }`}
            >
              <div className="border-b border-[#80c6f7] px-4 py-[9px] text-center text-[12px] font-bold text-white/75">
                {isBangla ? row.label.bn : row.label.en}
              </div>

              <div className="px-4 py-[11px] text-center text-[15px] font-extrabold text-white">
                {isBangla ? row.value.bn : row.value.en}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          .refer-heading-ribbon {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 21px) 100%,
              0 100%
            );
          }

          .offer-ribbon {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 20px) 100%,
              0 100%
            );
            box-shadow: 6px 6px 0 #147fe1;
          }

          @media (max-width: 639px) {
            .refer-heading-ribbon {
              clip-path: polygon(
                0 0,
                100% 0,
                calc(100% - 17px) 100%,
                0 100%
              );
            }

            .offer-ribbon {
              clip-path: polygon(
                0 0,
                100% 0,
                calc(100% - 16px) 100%,
                0 100%
              );
              box-shadow: 4px 5px 0 #147fe1;
            }
          }
        `}
      </style>
    </section>
  );
};

const HeadingRibbon = ({ title }) => {
  return (
    <div className="relative h-[63px] w-full max-w-[500px]">
      <div className="absolute left-0 top-[16px] h-[47px] w-[calc(100%-18px)] bg-[#70e91c] sm:w-[480px]" />

      <div className="refer-heading-ribbon absolute left-0 top-0 flex h-[43px] w-[calc(100%-24px)] items-center bg-[#1d7dce] px-4 sm:w-[495px]">
        <h2 className="text-[15px] font-bold text-white sm:text-[17px]">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default ReferAndEarnBonus;