import React from "react";
import { Link } from "react-router";

import { useLanguage } from "../../Context/LanguageProvider";

const achievementData = [
  {
    id: 1,
    users: 15,
    bonus: 300,
  },
  {
    id: 2,
    users: 30,
    bonus: 700,
  },
  {
    id: 3,
    users: 50,
    bonus: 1500,
  },
  {
    id: 4,
    users: 75,
    bonus: 2500,
  },
  {
    id: 5,
    users: 150,
    bonus: 5000,
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

const formatNumber = (value, isBangla) => {
  const formatted = new Intl.NumberFormat("en-US").format(value);

  return isBangla ? convertToBanglaNumber(formatted) : formatted;
};

const MonthlyAchievementBonus = () => {
  const { isBangla } = useLanguage();

  const texts = {
    mainTitle: isBangla ? "মাসিক অর্জন বোনাস" : "Monthly Achievement Bonus",

    subTitle: isBangla
      ? "আপনার মাসিক পুরস্কার আনলক করুন"
      : "Unlock Your Monthly Rewards",

    description: isBangla
      ? "প্রতি মাসে নতুন ব্যবহারকারীদের আমন্ত্রণ জানান এবং ৳১০,০০০ পর্যন্ত পুরস্কার আনলক করুন! আপনি যত বেশি রেফার করবেন, আপনার পুরস্কার তত বেশি হবে। পুরস্কারের ধাপ অতিক্রম করতে থাকুন এবং সর্বোচ্চ স্থান অর্জন করুন!"
      : "Invite new users every month and unlock rewards up to ৳10,000! The more you refer, the higher you soar. Keep leveling up your rewards and claim the top spot!",

    tableTitle: isBangla ? "অর্জনের তালিকা" : "Achievement Table",

    users: isBangla
      ? "সর্বমোট ডিপোজিটকারী ব্যবহারকারী"
      : "Cumulative Deposit Users",

    bonus: isBangla ? "বোনাস" : "Bonus",

    termsTitle: isBangla ? "শর্তাবলী:" : "Terms & Conditions:",

    terms: isBangla
      ? [
          "মাসিক অর্জন বোনাসের লিডারবোর্ড প্রতি মাসের ১ তারিখে reset হবে।",
          "প্রয়োজনীয় সংখ্যক রেফারেল পূরণ করার সঙ্গে সঙ্গে বোনাস আপনার অ্যাকাউন্টে যোগ হবে।",
          "মাস শেষ হওয়ার আগে সব কাজ সম্পন্ন করলে নতুন কাজের জন্য পরবর্তী মাস পর্যন্ত অপেক্ষা করতে হবে।",
        ]
      : [
          "The Monthly Achievement Bonus leaderboard resets on the 1st of every month.",
          "Bonuses are instantly added when you reach the required number of referrals.",
          "If you complete all tasks before the month ends, you’ll need to wait until the next month for new tasks.",
        ],

    button: isBangla
      ? "এখনই আপনার বন্ধুকে রেফার করুন"
      : "REFER YOUR FRIEND NOW",
  };

  return (
    <section className="w-full bg-[#28559a] px-3 pb-4 pt-2 sm:px-5 sm:pt-3 lg:px-8">
      <div className="mx-auto w-full max-w-[1525px]">
        {/* Main heading */}
        <div className="mx-auto w-full max-w-[620px]">
          <div className="relative h-[53px]">
            <div className="absolute left-[5px] top-[7px] h-[46px] w-[calc(100%-5px)] bg-[#76eb17]" />

            <div className="achievement-main-ribbon absolute left-0 top-0 flex h-[43px] w-full items-center justify-center bg-[#1d7dce] px-5">
              <h1 className="text-center text-[16px] font-bold text-white sm:text-[18px]">
                {texts.mainTitle}
              </h1>
            </div>
          </div>
        </div>

        {/* Green subtitle */}
        <div className="mx-auto mt-[10px] w-full max-w-[470px]">
          <div className="achievement-subtitle-ribbon flex min-h-[44px] items-center justify-center bg-gradient-to-r from-[#8adc35] to-[#79cf2c] px-5 py-2 shadow-[6px_6px_0_#147bd5]">
            <h2 className="text-center text-[16px] font-medium text-[#043669] sm:text-[18px]">
              {texts.subTitle}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="mx-auto mt-[35px] max-w-[1470px] px-2 text-center text-[14px] font-normal leading-[23px] text-white sm:text-[16px] lg:text-[17px]">
          {texts.description}
        </p>

        {/* Content box */}
        <div className="mt-[34px] overflow-hidden rounded-[17px] border-[4px] border-[#3d9cff] bg-[#0b3e71]">
          {/* Table heading */}
          <HeadingRibbon title={texts.tableTitle} />

          {/* Desktop table */}
          <div className="hidden px-4 pb-0 sm:block lg:px-[151px]">
            <div className="overflow-hidden rounded-t-[17px] border border-[#8ac7f3]">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="h-[42px] bg-[#00f52b] text-[#043669]">
                    <th className="w-1/2 border-r border-[#8ac7f3] px-4 text-center text-[13px] font-extrabold">
                      {texts.users}
                    </th>

                    <th className="w-1/2 px-4 text-center text-[13px] font-extrabold">
                      {texts.bonus}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {achievementData.map((item) => (
                    <tr
                      key={item.id}
                      className="h-[40px] bg-[#2764a3] text-white"
                    >
                      <td className="border-b border-r border-[#8ac7f3] px-4 text-center text-[13px] font-extrabold">
                        {formatNumber(item.users, isBangla)}
                      </td>

                      <td className="border-b border-[#8ac7f3] px-4 text-center text-[13px] font-extrabold">
                        ৳{formatNumber(item.bonus, isBangla)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile achievement cards */}
          <div className="grid grid-cols-1 gap-3 px-3 pb-4 sm:hidden">
            {achievementData.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[10px] border border-[#8ac7f3] bg-[#2764a3]"
              >
                <div className="grid grid-cols-2">
                  <div className="border-r border-[#8ac7f3] p-3 text-center">
                    <p className="text-[10px] font-bold leading-[15px] text-white/65">
                      {texts.users}
                    </p>

                    <p className="mt-2 text-[16px] font-extrabold text-white">
                      {formatNumber(item.users, isBangla)}
                    </p>
                  </div>

                  <div className="p-3 text-center">
                    <p className="text-[10px] font-bold leading-[15px] text-white/65">
                      {texts.bonus}
                    </p>

                    <p className="mt-2 text-[16px] font-extrabold text-white">
                      ৳{formatNumber(item.bonus, isBangla)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Terms heading */}
          <HeadingRibbon title={texts.termsTitle} />

          {/* Terms list */}
          <ul className="space-y-[2px] px-7 pb-[16px] pt-[13px] text-[13px] font-normal leading-[20px] text-white sm:px-8 sm:text-[15px] lg:text-[16px]">
            {texts.terms.map((term, index) => (
              <li key={index} className="flex items-start gap-[12px]">
                <span className="mt-[7px] h-[6px] w-[6px] shrink-0 bg-white" />

                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Refer button */}
        <div className="mt-[36px] flex justify-center">
          <Link
            to="/referral"
            className="flex min-h-[42px] items-center justify-center rounded-[19px] bg-gradient-to-r from-[#ffe33a] to-[#e8a91c] px-6 py-2 text-center text-[12px] font-black uppercase text-[#06448d] shadow-[0_3px_7px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 hover:brightness-110 sm:min-w-[217px] sm:text-[13px]"
          >
            {texts.button}
          </Link>
        </div>
      </div>

      <style>
        {`
          .achievement-main-ribbon {
            clip-path: polygon(
              2% 0,
              100% 0,
              calc(100% - 12px) 100%,
              0 100%
            );
          }

          .achievement-subtitle-ribbon {
            clip-path: polygon(
              2% 0,
              100% 0,
              calc(100% - 12px) 100%,
              0 100%
            );
          }

          .achievement-heading-ribbon {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 21px) 100%,
              0 100%
            );
          }

          @media (max-width: 639px) {
            .achievement-heading-ribbon {
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

const HeadingRibbon = ({ title }) => {
  return (
    <div className="relative h-[63px] w-full max-w-[500px]">
      <div className="absolute left-0 top-[16px] h-[47px] w-[calc(100%-18px)] bg-[#70e91c] sm:w-[480px]" />

      <div className="achievement-heading-ribbon absolute left-0 top-0 flex h-[43px] w-[calc(100%-24px)] items-center bg-[#1d7dce] px-4 sm:w-[495px]">
        <h2 className="text-[15px] font-bold text-white sm:text-[17px]">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default MonthlyAchievementBonus;
