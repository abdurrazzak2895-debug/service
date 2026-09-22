import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";

const statsData = [
  { value: "10+", label: { bn: "পার্টনারশিপ", en: "Partnerships" } },
  { value: "3+", label: { bn: "বছরের যাত্রা", en: "Years Active" } },
  { value: "50K+", label: { bn: "কমিউনিটি সদস্য", en: "Community Members" } },
];

const Achievements = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="bg-[#0b66a8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-6 text-center sm:grid-cols-3">
        {statsData.map((item, index) => (
          <div key={index}>
            <div className="text-[32px] font-extrabold text-white sm:text-[38px]">
              {item.value}
            </div>
            <div className="mt-1 text-[13px] font-medium text-white/75 sm:text-[14px]">
              {isBangla ? item.label.bn : item.label.en}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Achievements;
