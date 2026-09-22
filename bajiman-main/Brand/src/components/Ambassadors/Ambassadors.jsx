import React from "react";
import { UserCircle } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

const ambassadorsData = [
  { name: { bn: "অ্যাম্বাসেডর ১", en: "Ambassador One" }, role: { bn: "ব্র্যান্ড অ্যাম্বাসেডর", en: "Brand Ambassador" } },
  { name: { bn: "অ্যাম্বাসেডর ২", en: "Ambassador Two" }, role: { bn: "ব্র্যান্ড অ্যাম্বাসেডর", en: "Brand Ambassador" } },
  { name: { bn: "অ্যাম্বাসেডর ৩", en: "Ambassador Three" }, role: { bn: "ব্র্যান্ড অ্যাম্বাসেডর", en: "Brand Ambassador" } },
];

const Ambassadors = () => {
  const { isBangla } = useLanguage();

  return (
    <section className="bg-[#f5f6f8] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1000px]">
        <h2 className="text-center text-[22px] font-bold text-[#111111] sm:text-[28px]">
          {isBangla ? "ব্র্যান্ড অ্যাম্বাসেডর" : "Brand Ambassadors"}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {ambassadorsData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 rounded-[10px] bg-white px-4 py-8 text-center shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
            >
              <UserCircle size={64} className="text-[#0b66a8]" />
              <span className="mt-2 text-[15px] font-bold text-[#111111]">
                {isBangla ? item.name.bn : item.name.en}
              </span>
              <span className="text-[13px] text-[#666666]">
                {isBangla ? item.role.bn : item.role.en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ambassadors;
