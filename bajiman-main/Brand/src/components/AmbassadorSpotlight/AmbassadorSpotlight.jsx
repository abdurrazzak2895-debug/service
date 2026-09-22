import React from "react";
import { UserCircle, Quote, Calendar, Ruler, Briefcase } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

const spotlight = {
  eyebrow: { bn: "আমাদের ব্র্যান্ড অ্যাম্বাসেডর", en: "Our Brand Ambassador" },
  name: { bn: "অ্যাম্বাসেডর নাম", en: "Ambassador Name" },
  tagline: {
    bn: "বাজিমান পরিবারের একজন গর্বিত সদস্য।",
    en: "A proud member of the Bajiman family.",
  },
  quote: {
    bn: "এই পার্টনারশিপে যুক্ত হতে পেরে আমি সত্যিই আনন্দিত। এটা শুধু শুরু, সামনে আরও অনেক স্মরণীয় মুহূর্ত অপেক্ষা করছে।",
    en: "I'm truly excited to be part of this partnership. This is just the beginning of many memorable moments ahead.",
  },
  facts: [
    { icon: Calendar, label: { bn: "জন্মতারিখ", en: "Date of Birth" }, value: "01 Jan 1995" },
    { icon: Ruler, label: { bn: "উচ্চতা", en: "Height" }, value: "1.65 m" },
    { icon: Briefcase, label: { bn: "পেশা", en: "Profession" }, value: { bn: "মডেল", en: "Model" } },
  ],
  achievementGroups: [
    {
      heading: { bn: "খেতাব ও স্বীকৃতি", en: "Titles & Recognitions" },
      items: [
        { bn: "খেতাব ১", en: "Title One" },
        { bn: "খেতাব ২", en: "Title Two" },
      ],
    },
    {
      heading: { bn: "পুরস্কার ও অর্জন", en: "Awards & Achievements" },
      items: [
        { bn: "পুরস্কার ১", en: "Award One" },
        { bn: "পুরস্কার ২", en: "Award Two" },
      ],
    },
  ],
};

const AmbassadorSpotlight = () => {
  const { isBangla } = useLanguage();
  const t = (field) => (isBangla ? field.bn : field.en);

  return (
    <section className="bg-[#0b66a8] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="flex justify-center">
          <div className="flex h-[220px] w-[220px] items-center justify-center rounded-full bg-white/10 sm:h-[280px] sm:w-[280px]">
            <UserCircle size={140} className="text-white/70" />
          </div>
        </div>

        <div className="text-center lg:text-left">
          <p className="text-[13px] font-bold uppercase tracking-wide text-[#8be04a]">
            {t(spotlight.eyebrow)}
          </p>
          <h2 className="mt-2 text-[28px] font-extrabold text-white sm:text-[36px]">
            {t(spotlight.name)}
          </h2>
          <p className="mt-3 text-[14px] text-white/80 sm:text-[15px]">
            {t(spotlight.tagline)}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[820px] rounded-[10px] bg-white/10 px-6 py-6 text-center">
        <Quote size={22} className="mx-auto text-[#8be04a]" />
        <p className="mt-3 text-[14px] italic leading-7 text-white/90 sm:text-[15px]">
          {t(spotlight.quote)}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-[820px] grid-cols-1 gap-4 sm:grid-cols-3">
        {spotlight.facts.map((fact, index) => {
          const Icon = fact.icon;
          const value = typeof fact.value === "string" ? fact.value : t(fact.value);

          return (
            <div
              key={index}
              className="flex items-center gap-3 rounded-[8px] bg-white/10 px-4 py-4"
            >
              <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                <Icon size={17} />
              </span>
              <div className="text-left">
                <p className="text-[11px] uppercase text-white/60">{t(fact.label)}</p>
                <p className="text-[13px] font-bold text-white">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-10 grid max-w-[1000px] grid-cols-1 gap-6 sm:grid-cols-2">
        {spotlight.achievementGroups.map((group, index) => (
          <div key={index} className="rounded-[10px] bg-white/10 px-5 py-5">
            <h3 className="text-[15px] font-bold text-white">{t(group.heading)}</h3>
            <ul className="mt-3 space-y-2">
              {group.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="rounded-[6px] bg-white/10 px-3 py-2 text-[13px] text-white/85"
                >
                  {t(item)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AmbassadorSpotlight;
