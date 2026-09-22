import React from "react";
import { Link } from "react-router";
import {
  UserRoundPlus,
  Wallet,
  Gift,
  Lightbulb,
  Trophy,
  Dice5,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { siteConfig } from "../../data/siteConfig";
import { topics } from "../../data/topicsData";

const iconMap = {
  UserRoundPlus,
  Wallet,
  Gift,
  Lightbulb,
  Trophy,
  Dice5,
};

const TopicsGrid = () => {
  const { isBangla } = useLanguage();

  const siteName = isBangla ? siteConfig.siteName.bn : siteConfig.siteName.en;

  return (
    <section className="mx-auto w-full max-w-[1140px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-3">
        <h2 className="text-[18px] font-bold text-[#1c2b3a]">
          {isBangla ? "টপিকস" : "Topics"}
        </h2>

        <Link
          to="/"
          className="text-[13px] font-semibold text-[#0b66a8] hover:underline"
        >
          {isBangla ? "সব দেখুন" : "View All"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => {
          const Icon = iconMap[topic.icon] || Lightbulb;
          const label = isBangla ? topic.title.bn : topic.title.en;
          const displayLabel =
            topic.slug === "tips" && siteName
              ? isBangla
                ? `${siteName} টিপস`
                : `${siteName} Tips`
              : label;

          return (
            <Link
              key={topic.slug}
              to={`/topic/${topic.slug}`}
              className="group flex items-center gap-4 rounded-[8px] bg-[#0d3a66] px-5 py-6 shadow-md transition hover:-translate-y-[2px] hover:shadow-xl"
            >
              <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#12294a] text-[#7ee787] transition group-hover:bg-[#7ee787] group-hover:text-[#0d3a66]">
                <Icon size={22} />
              </span>

              <span className="text-[16px] font-semibold text-white">
                {displayLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default TopicsGrid;
