import React from "react";
import { Trophy } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

const sponsorsData = [
  { name: { bn: "পার্টনার ১", en: "Partner One" } },
  { name: { bn: "পার্টনার ২", en: "Partner Two" } },
  { name: { bn: "পার্টনার ৩", en: "Partner Three" } },
  { name: { bn: "পার্টনার ৪", en: "Partner Four" } },
];

const Sponsorships = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-center text-[22px] font-bold text-[#111111] sm:text-[28px]">
          {isBangla ? "স্পনসরশিপ ও পার্টনারশিপ" : "Sponsorships & Partnerships"}
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {sponsorsData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-3 rounded-[10px] border border-[#e5e5e5] bg-[#f9f9f9] px-4 py-8 text-center"
            >
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#0b66a8] text-white">
                <Trophy size={22} />
              </span>
              <span className="text-[13px] font-semibold text-[#333333]">
                {isBangla ? item.name.bn : item.name.en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsorships;
