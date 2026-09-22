import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";
import COMMISSION_IMAGE from "../../assets/rebate/commission-level.webp";
import PERSON_IMAGE from "../../assets/rebate/person-img.webp";

const UnlimitedRebate = () => {
  const { isBangla } = useLanguage();

  const texts = {
    title: isBangla
      ? "কীভাবে প্রতিদিন সীমাহীন রিবেট পাবেন?"
      : "How To Get Daily Unlimited Rebate?",

    description: isBangla
      ? "আমাদের ৩-স্তরের রেফারেল প্রোগ্রামের মাধ্যমে আপনি শুধু আপনার বন্ধুদের থেকেই নয়, তাদের বন্ধু এবং তাদের বন্ধুদের বন্ধুদের থেকেও রিবেট উপার্জন করতে পারবেন। যত বেশি সংযোগ, তত বেশি পুরস্কার!"
      : "Our 3-tier referral program lets you earn beyond just your friends. Get rebates from your friend, their friends, and even their friends’ friends. More connections, More rewards!",

    commissionTitle: isBangla ? "কমিশন কাঠামো" : "Commission Structure",

    earningTree: isBangla ? "আপনার আয়ের নেটওয়ার্ক:" : "Your Earning Tree:",

    commissionAlt: isBangla
      ? "তিন স্তরের রেফারেল কমিশন কাঠামো"
      : "Three-tier referral commission structure",

    personAlt: isBangla
      ? "মোবাইল ব্যবহার করে রিবেট উপার্জন করছেন"
      : "Person earning rebate using mobile",
  };

  return (
    <section className="w-full bg-[#28559a] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-[1525px] overflow-hidden rounded-[18px] border-[4px] border-[#3d9cff] bg-[#0b3e71]">
        {/* First heading ribbon */}
        <div className="relative h-[65px] w-full max-w-[650px] sm:h-[64px]">
          <div className="absolute left-0 top-[16px] h-[48px] w-[calc(100%-20px)] bg-[#7de817] sm:w-[630px]" />

          <div className="rebate-heading-shape absolute left-0 top-0 flex h-[42px] w-[calc(100%-25px)] items-center bg-[#1e7dce] px-4 sm:w-[645px]">
            <h2 className="text-[15px] font-bold leading-[20px] text-white sm:text-[17px] lg:text-[18px]">
              {texts.title}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="px-4 pb-[14px] text-[14px] font-normal leading-[22px] text-white sm:px-[17px] sm:text-[16px] lg:text-[17px]">
          {texts.description}
        </p>

        {/* Commission heading ribbon */}
        <div className="relative h-[61px] w-full max-w-[500px]">
          <div className="absolute left-0 top-[14px] h-[47px] w-[calc(100%-20px)] bg-[#7de817] sm:w-[480px]" />

          <div className="rebate-heading-shape absolute left-0 top-0 flex h-[42px] w-[calc(100%-25px)] items-center bg-[#1e7dce] px-4 sm:w-[495px]">
            <h3 className="text-[16px] font-bold text-white sm:text-[18px]">
              {texts.commissionTitle}
            </h3>
          </div>
        </div>

        {/* Images section */}
        <div className="relative min-h-[580px] px-4 pb-0 sm:px-5 lg:min-h-[640px]">
          {/* Earning tree title */}
          <h4 className="pt-[1px] text-[17px] font-extrabold text-[#51f00a] sm:text-[19px]">
            {texts.earningTree}
          </h4>

          <div className="grid grid-cols-1 items-end gap-7 lg:grid-cols-[52%_48%]">
            {/* Commission structure image */}
            <div className="flex min-h-[430px] items-start justify-center pt-3 lg:justify-start lg:pt-2">
              <img
                src={COMMISSION_IMAGE}
                alt={texts.commissionAlt}
                className="h-auto w-full max-w-[520px] object-contain object-left-top sm:max-w-[590px] lg:max-h-[430px] lg:max-w-[620px]"
                loading="lazy"
                draggable={false}
              />
            </div>

            {/* Person image */}
            <div className="relative flex min-h-[470px] items-end justify-center lg:min-h-[570px] lg:justify-end lg:pr-[90px]">
              <img
                src={PERSON_IMAGE}
                alt={texts.personAlt}
                className="h-auto max-h-[520px] w-auto max-w-full object-contain object-bottom lg:absolute lg:bottom-0 lg:right-[85px] lg:max-h-[625px]"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .rebate-heading-shape {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 21px) 100%,
              0 100%
            );
          }

          @media (max-width: 639px) {
            .rebate-heading-shape {
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

export default UnlimitedRebate;
