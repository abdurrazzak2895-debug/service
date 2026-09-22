import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";

const StaticPageLayout = ({ title, sections }) => {
  const { isBangla } = useLanguage();

  return (
    <div className="w-full bg-white">
      {/* Header banner */}
      <div className="w-full bg-[#0b66a8] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h1 className="mx-auto w-full max-w-[900px] text-[26px] font-black text-white sm:text-[32px]">
          {isBangla ? title.bn : title.en}
        </h1>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {sections.map((section, index) => (
          <div key={index} className="mb-7 last:mb-0">
            {section.heading && (
              <h2 className="mb-2 text-[18px] font-bold text-[#0b66a8] sm:text-[20px]">
                {isBangla ? section.heading.bn : section.heading.en}
              </h2>
            )}

            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p
                key={paragraphIndex}
                className="mb-3 text-[14px] leading-[24px] text-[#43505e] sm:text-[15px]"
              >
                {isBangla ? paragraph.bn : paragraph.en}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaticPageLayout;
