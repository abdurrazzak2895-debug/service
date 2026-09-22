import React from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import myAccountImage from "../../assets/refer/my-account.webp";
import referBonusImage from "../../assets/refer/refer-bonus.webp";
import shareButtonImage from "../../assets/refer/share-button.webp";
import shareFriendsImage from "../../assets/refer/share-friends.webp";

const referSteps = [
  {
    id: 1,
    step: "01",
    image: myAccountImage,
    title: {
      en: "Click on My Account",
      bn: "My Account-এ ক্লিক করুন",
    },
    description: {
      en: "Open the Bajiman website or app and click on My Account.",
      bn: "Bajiman ওয়েবসাইট বা অ্যাপ খুলে My Account-এ ক্লিক করুন।",
    },
    backColor: "#ff6400",
    secondBackColor: "#ff9a00",
  },
  {
    id: 2,
    step: "02",
    image: referBonusImage,
    title: {
      en: "Click on Refer Bonus",
      bn: "Refer Bonus-এ ক্লিক করুন",
    },
    description: {
      en: "Go to your account menu and select the Refer Bonus option.",
      bn: "অ্যাকাউন্ট মেনু থেকে Refer Bonus অপশন নির্বাচন করুন।",
    },
    backColor: "#e50055",
    secondBackColor: "#ff407b",
  },
  {
    id: 3,
    step: "03",
    image: shareButtonImage,
    title: {
      en: "Click on Share Button",
      bn: "Share বাটনে ক্লিক করুন",
    },
    description: {
      en: "Copy your referral link, invitation code or QR code.",
      bn: "আপনার রেফারেল লিংক, ইনভাইটেশন কোড অথবা QR কোড কপি করুন।",
    },
    backColor: "#41c8f5",
    secondBackColor: "#83e2fa",
  },
  {
    id: 4,
    step: "04",
    image: shareFriendsImage,
    title: {
      en: "Share With Friends",
      bn: "বন্ধুদের সঙ্গে শেয়ার করুন",
    },
    description: {
      en: "Share your referral information with friends and start earning.",
      bn: "বন্ধুদের সঙ্গে রেফারেল তথ্য শেয়ার করুন এবং আয় শুরু করুন।",
    },
    backColor: "#1477ff",
    secondBackColor: "#499cff",
  },
];

const ReferSteps = () => {
  const { isBangla } = useLanguage();

  const texts = {
    heading: isBangla ? "রেফার করার ধাপসমূহ" : "Steps to refer",

    question: isBangla
      ? "Bajiman-এ আপনার বন্ধুদের কীভাবে রেফার করবেন?"
      : "How to refer your friends in Bajiman?",

    footer: isBangla
      ? "একটি লিংক, একটি কোড অথবা একটি QR—আপনার বন্ধুদের যুক্ত করতে এটুকুই যথেষ্ট। এখনই রেফার করুন এবং সীমাহীন আয় শুরু করুন।"
      : "One link, one code or one QR—that’s all it takes to bring your friends on board! Start Referring and Earn Unlimited.",
  };

  return (
    <section className="w-full bg-[#28559a] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-[1525px] overflow-hidden rounded-[19px] border-[5px] border-[#3d9cff] bg-[#0b3d70]">
        {/* Heading ribbon */}
        <div className="relative h-[69px] w-full sm:w-[500px]">
          <div className="absolute left-0 top-[15px] h-[53px] w-[calc(100%-20px)] bg-[#86ee13] sm:w-[480px]" />

          <div className="refer-heading-shape absolute left-0 top-0 flex h-[48px] w-[calc(100%-24px)] items-center bg-[#197bd1] px-4 sm:w-[495px]">
            <h2 className="text-[17px] font-bold text-white sm:text-[20px]">
              {texts.heading}
            </h2>
          </div>
        </div>

        <div className="px-4 pb-7 sm:px-5 lg:px-[20px] lg:pb-[30px]">
          {/* Question */}
          <p className="mb-8 text-[16px] font-normal text-white sm:text-[18px] lg:mb-[35px]">
            {texts.question}
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
            {referSteps.map((item) => (
              <div
                key={item.id}
                className="group mx-auto flex w-full max-w-[310px] flex-col items-center"
              >
                {/* Decorative card */}
                <div className="relative h-[370px] w-full sm:h-[365px]">
                  <div
                    className="absolute left-[12px] top-[20px] h-[310px] w-[200px] rotate-[-13deg] rounded-[44px]"
                    style={{
                      backgroundColor: item.backColor,
                    }}
                  />

                  <div
                    className="absolute right-[12px] top-[9px] h-[310px] w-[200px] rotate-[13deg] rounded-[44px]"
                    style={{
                      backgroundColor: item.secondBackColor,
                    }}
                  />

                  {/* White foreground card */}
                  <div className="absolute left-1/2 top-[30px] h-[325px] w-[200px] -translate-x-1/2 overflow-visible rounded-[38px] bg-white shadow-[0_3px_10px_rgba(0,0,0,0.13)]">
                    {/* Step number */}
                    <div className="flex h-[78px] items-center justify-center gap-[7px] px-3 pt-1 text-[#0759bd]">
                      <span className="text-[24px] font-extrabold sm:text-[25px]">
                        {isBangla ? "ধাপ" : "Step"}
                      </span>

                      <span className="text-[44px] font-black leading-none sm:text-[48px]">
                        {item.step}
                      </span>
                    </div>

                    {/* Screenshot box */}
                    <div className="absolute left-1/2 top-[76px] w-[240px] -translate-x-1/2 overflow-hidden rounded-[7px] border-[6px] border-[#062d59] bg-[#062d59] shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:-translate-y-1 sm:w-[245px]">
                      <div className="flex min-h-[28px] items-center justify-center rounded-t-[3px] bg-[#205ea0] px-2 py-1 text-center text-[14px] font-medium leading-[18px] text-white sm:text-[15px]">
                        {isBangla ? item.title.bn : item.title.en}
                      </div>

                      <div className="h-[230px] w-full overflow-hidden bg-white">
                        <img
                          src={item.image}
                          alt={isBangla ? item.title.bn : item.title.en}
                          className="h-full w-full object-cover object-top"
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile/tablet description */}
                <p className="mt-1 px-2 text-center text-[14px] leading-[22px] text-white/80 xl:hidden">
                  {isBangla ? item.description.bn : item.description.en}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom text */}
          <p className="mt-6 text-center text-[15px] font-normal leading-[24px] text-white sm:text-[17px] xl:mt-[23px] xl:text-left">
            {texts.footer}
          </p>
        </div>
      </div>

      <style>
        {`
          .refer-heading-shape {
            clip-path: polygon(
              0 0,
              100% 0,
              calc(100% - 21px) 100%,
              0 100%
            );
          }

          @media (max-width: 639px) {
            .refer-heading-shape {
              clip-path: polygon(
                0 0,
                100% 0,
                calc(100% - 18px) 100%,
                0 100%
              );
            }
          }
        `}
      </style>
    </section>
  );
};

export default ReferSteps;
