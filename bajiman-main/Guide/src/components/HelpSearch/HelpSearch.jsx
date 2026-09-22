import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Search,
  CircleUserRound,
  BadgeDollarSign,
  Megaphone,
  Lightbulb,
  Goal,
  PanelsTopLeft,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";
import { topics } from "../../data/topicsData";

const HelpSearch = () => {
  const { isBangla } = useLanguage();
  const [query, setQuery] = useState("");

  const placeholder = isBangla
    ? "আমাদের হেল্প আর্টিকেল খুঁজুন..."
    : "Search our help articles...";

  const results = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) return [];

    const matchedArticles = [];

    topics.forEach((topic) => {
      topic.articles?.forEach((article) => {
        const title = isBangla
          ? article.title?.bn || ""
          : article.title?.en || "";

        const summary = isBangla
          ? article.summary?.bn || ""
          : article.summary?.en || "";

        if (
          title.toLowerCase().includes(searchTerm) ||
          summary.toLowerCase().includes(searchTerm)
        ) {
          matchedArticles.push({
            topic,
            article,
          });
        }
      });
    });

    return matchedArticles.slice(0, 6);
  }, [query, isBangla]);

  const topicDesigns = [
    {
      slug: "account",
      fallbackTitle: {
        en: "Account",
        bn: "অ্যাকাউন্ট",
      },
      icon: CircleUserRound,
      iconColor: "#a9cf73",
    },
    {
      slug: "payment",
      fallbackTitle: {
        en: "Payment",
        bn: "পেমেন্ট",
      },
      icon: BadgeDollarSign,
      iconColor: "#aaffb6",
    },
    {
      slug: "promotions",
      fallbackTitle: {
        en: "Promotions",
        bn: "প্রমোশন",
      },
      icon: Megaphone,
      iconColor: "#aaffb6",
    },
    {
      slug: "bajiman-tips",
      fallbackTitle: {
        en: "Bajiman Tips",
        bn: "বাজিমান টিপস",
      },
      icon: Lightbulb,
      iconColor: "#b2ffad",
    },
    {
      slug: "sports",
      fallbackTitle: {
        en: "Sports",
        bn: "স্পোর্টস",
      },
      icon: Goal,
      iconColor: "#aaff8c",
    },
    {
      slug: "casino",
      fallbackTitle: {
        en: "Casino",
        bn: "ক্যাসিনো",
      },
      icon: PanelsTopLeft,
      iconColor: "#aaffb6",
    },
  ];

  const topicCards = topicDesigns.map((design, index) => {
    const matchedTopic = topics.find(
      (topic) =>
        topic.slug === design.slug ||
        topic.slug?.includes(design.slug) ||
        design.slug.includes(topic.slug),
    );

    return {
      ...design,
      topic: matchedTopic || topics[index],
    };
  });

  return (
    <section className="min-h-[718px] w-full bg-[#285b98] px-4 pb-16 pt-[49px] text-white sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-[27px] font-bold leading-tight text-white sm:text-[32px]">
          {isBangla ? "শুভ দিন!" : "Good Day!"}
        </h1>

        <p className="mt-[8px] text-[19px] font-medium leading-tight text-white sm:text-[25px]">
          {isBangla ? "আজ আমরা কীভাবে " : "How can we "}

          <span className="font-bold text-[#5ee20d]">
            {isBangla ? "আপনাকে সাহায্য" : "help you"}
          </span>

          {isBangla ? " করতে পারি?" : " today?"}
        </p>
      </div>

      {/* Search area */}
      <div className="relative mx-auto mt-[21px] w-full max-w-[800px]">
        <div className="flex h-[56px] items-center overflow-hidden rounded-full border border-[#d0d0d0] bg-white shadow-[0_3px_9px_rgba(0,0,0,0.38),inset_0_1px_3px_rgba(0,0,0,0.12)]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 bg-transparent pl-6 pr-2 text-[16px] font-normal text-[#285b98] outline-none placeholder:text-[#4778bd] sm:pl-12 sm:text-[18px]"
          />

          <span className="flex h-full w-[62px] shrink-0 items-center justify-center text-[#0757b2]">
            <Search size={25} strokeWidth={2.2} />
          </span>
        </div>

        {/* Search results */}
        {query.trim() && (
          <div className="absolute left-0 right-0 top-[65px] z-30 max-h-[350px] overflow-y-auto rounded-[10px] bg-white text-left shadow-2xl">
            {results.length > 0 ? (
              results.map(({ topic, article }) => {
                const articleTitle = isBangla
                  ? article.title?.bn
                  : article.title?.en;

                const articleSummary = isBangla
                  ? article.summary?.bn
                  : article.summary?.en;

                return (
                  <Link
                    key={`${topic.slug}-${article.slug}`}
                    to={`/topic/${topic.slug}/${article.slug}`}
                    onClick={() => setQuery("")}
                    className="block border-b border-black/5 px-5 py-3 transition-colors duration-200 last:border-b-0 hover:bg-[#eef6ff]"
                  >
                    <div className="text-[14px] font-semibold text-[#1c2b3a]">
                      {articleTitle}
                    </div>

                    {articleSummary && (
                      <div className="mt-1 line-clamp-1 text-[12px] text-[#8a97a6]">
                        {articleSummary}
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="px-5 py-5 text-center text-[14px] text-[#788797]">
                {isBangla
                  ? "কোনো হেল্প আর্টিকেল পাওয়া যায়নি"
                  : "No help articles found"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topics section */}
      <div className="mx-auto mt-[103px] w-full max-w-[1280px]">
        <div className="flex items-center justify-between px-2 pb-[10px] text-[16px]">
          <span>{isBangla ? "টপিকস" : "Topics"}</span>

          <Link
            to="/topic/account"
            className="font-medium text-white transition-opacity hover:opacity-75"
          >
            {isBangla ? "সব দেখুন" : "View All"}
          </Link>
        </div>

        <div className="h-px w-full bg-white/90" />

        {/* Topic cards */}
        <div className="mt-[31px] grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {topicCards.map(
            ({ slug, fallbackTitle, icon: Icon, iconColor, topic }, index) => {
              if (!topic && index >= topics.length) return null;

              const topicSlug = topic?.slug || slug;

              const title = topic?.title
                ? isBangla
                  ? topic.title.bn
                  : topic.title.en
                : isBangla
                  ? fallbackTitle.bn
                  : fallbackTitle.en;

              return (
                <Link
                  key={topicSlug}
                  to={`/topic/${topicSlug}`}
                  className="group flex min-h-[140px] items-center rounded-[7px] border border-white/90 bg-[#164a7f] px-8 transition-all duration-200 hover:-translate-y-1 hover:border-[#6bea38] hover:bg-[#123f6d] hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)] sm:px-10 lg:px-[58px]"
                >
                  <Icon
                    size={54}
                    strokeWidth={1.8}
                    style={{
                      color: iconColor,
                    }}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                  />

                  <span className="ml-[42px] text-[19px] font-normal text-white sm:text-[20px]">
                    {title}
                  </span>
                </Link>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
};

export default HelpSearch;
