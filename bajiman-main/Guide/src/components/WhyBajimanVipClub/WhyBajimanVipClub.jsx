import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";
import RIGHT_BACKGROUND from "../../assets/vip/club-bg.png";
import MEGAPHONE_IMAGE from "../../assets/vip/megaphone.png";
import VIP_LOGO from "../../assets/vip/vip-club-logo.png";

const WhyBajimanVipClub = () => {
  const { isBangla } = useLanguage();

  const texts = {
    titleStart: isBangla ? "কেন" : "WHY",
    brand: isBangla ? "BAJIMAN" : "BAJIMAN",
    vipClub: isBangla ? "ভিআইপি ক্লাব?" : "VIP CLUB?",

    firstParagraph: isBangla
      ? "Bajiman VIP Club আপনার গেমিং যাত্রাকে আরও উন্নত পর্যায়ে নিয়ে যায়। এখানে VIP সদস্যদের জন্য রয়েছে অগ্রাধিকারভিত্তিক লেনদেন, দ্রুত উইথড্র এবং শুধুমাত্র Bajiman VIP সদস্যদের জন্য নিবেদিত ২৪/৭ ব্যক্তিগত VIP ম্যানেজার।"
      : "The Bajiman VIP Club takes your gaming journey to the next level with priority transactions, faster withdrawals, and a 24/7 personal VIP manager dedicated only to Bajiman VIP members.",

    secondParagraph: isBangla
      ? "আজই Bajiman VIP Club-এ যোগ দিন এবং শুধুমাত্র আপনার জন্য তৈরি বিশেষ পুরস্কার, আকর্ষণীয় অফার ও নগদ পুরস্কার উপভোগ করুন!"
      : "Join the Bajiman VIP Club today and enjoy exclusive rewards, exciting offers, and cash prizes designed just for you!",

    logoAlt: isBangla ? "Bajiman ভিআইপি ক্লাব" : "Bajiman VIP Club",

    megaphoneAlt: isBangla ? "ঘোষণার মেগাফোন" : "Announcement megaphone",
  };

  return (
    <section className="w-full bg-[#102f70] px-4 py-6 sm:px-6 sm:py-8 lg:px-16">
      <div className="relative mx-auto w-full max-w-[1100px]">
        {/* Main bordered box */}
        <div className="relative overflow-visible rounded-[7px] border-[4px] border-[#f6cd5c] bg-[#0d2360]">
          {/* Desktop right-side background */}
          <div
            className="pointer-events-none absolute bottom-0 right-20 top-0 hidden w-[40%] overflow-hidden rounded-r-[3px] bg-cover bg-center bg-no-repeat lg:block"
            style={{
              backgroundImage: `url(${RIGHT_BACKGROUND})`,
            }}
          />

          {/* Soft blend between left and right */}
          <div className="pointer-events-none absolute bottom-0 right-[34%] top-0 z-[1] hidden w-[15%] bg-gradient-to-r from-[#0d2360] via-[#0d2360]/85 to-transparent lg:block" />

          {/* Megaphone */}
          <img
            src={MEGAPHONE_IMAGE}
            alt={texts.megaphoneAlt}
            className="absolute left-[-31px] top-[82px] z-20 h-auto w-[67px] object-contain drop-shadow-[0_5px_8px_rgba(0,0,0,0.25)] sm:left-[-45px] sm:top-[85px] sm:w-[85px] lg:left-[-58px] lg:top-[86px] lg:w-[94px]"
            loading="lazy"
            draggable={false}
          />

          <div className="relative z-10 grid min-h-[252px] grid-cols-1 lg:grid-cols-[62%_38%]">
            {/* Text content */}
            <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6 lg:px-[17px] lg:pb-[27px] lg:pt-[18px]">
              {/* Heading */}
              <h2 className="pl-1 text-[24px] font-black uppercase leading-[1.15] tracking-[-0.6px] text-white sm:text-[31px] lg:text-[36px]">
                <span>{texts.titleStart} </span>

                <span>{texts.brand} </span>

                <span className="text-[#ffbd00]">{texts.vipClub}</span>
              </h2>

              {/* Description */}
              <div className="mt-[17px] max-w-[650px] pl-1 text-[14px] font-semibold leading-[21px] text-white sm:text-[15px] sm:leading-[25px] lg:text-[16px]">
                <p>{texts.firstParagraph}</p>

                <p className="mt-[17px]">{texts.secondParagraph}</p>
              </div>
            </div>

            {/* VIP logo section */}
            <div
              className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-b-[3px] bg-cover bg-center bg-no-repeat sm:min-h-[310px] lg:min-h-0 lg:rounded-b-none lg:rounded-r-[3px] lg:bg-none"
              style={{
                backgroundImage: `url(${RIGHT_BACKGROUND})`,
              }}
            >
              {/* Mobile/tablet overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[#071e54]/15 lg:hidden" />

              {/* VIP logo */}
              <img
                src={VIP_LOGO}
                alt={texts.logoAlt}
                className="relative z-10 h-auto w-[160px] object-contain drop-shadow-[0_9px_18px_rgba(0,0,0,0.32)] transition-transform duration-300 hover:scale-105 sm:w-[220px] lg:w-[220px] xl:w-[240px]"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBajimanVipClub;
