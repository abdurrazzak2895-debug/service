import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

const ITEMS_PER_PAGE = 18;

const categories = [
  {
    id: "account",
    title: {
      en: "Account",
      bn: "অ্যাকাউন্ট",
    },
    articles: [
      {
        id: 1,
        en: "Guidelines for Passwords",
        bn: "পাসওয়ার্ড ব্যবহারের নির্দেশিকা",
      },
      {
        id: 2,
        en: "Supported Currencies at Bajiman",
        bn: "Bajiman-এ সমর্থিত মুদ্রাসমূহ",
      },
      {
        id: 3,
        en: "What is Bajiman's most recent domain?",
        bn: "Bajiman-এর সর্বশেষ ডোমেইন কোনটি?",
      },
      {
        id: 4,
        en: "Policy for 18 and Above",
        bn: "১৮ বছর এবং তার বেশি বয়সীদের নীতিমালা",
      },
      {
        id: 5,
        en: "What should I do if my account is hacked or suspected to be hacked?",
        bn: "আমার অ্যাকাউন্ট হ্যাক হলে বা হ্যাক হয়েছে বলে সন্দেহ হলে কী করব?",
      },
      {
        id: 6,
        en: "What is Bajiman's policy on responsible gaming?",
        bn: "দায়িত্বশীল গেমিং সম্পর্কে Bajiman-এর নীতি কী?",
      },
      {
        id: 7,
        en: "Can I access Bajiman from abroad?",
        bn: "আমি কি বিদেশ থেকে Bajiman ব্যবহার করতে পারব?",
      },
      {
        id: 8,
        en: "Are there any restrictions on the referral bonuses I received?",
        bn: "আমার পাওয়া রেফারেল বোনাস ব্যবহারে কোনো বিধিনিষেধ আছে কি?",
      },
      {
        id: 9,
        en: "How to join the Affiliate Program?",
        bn: "অ্যাফিলিয়েট প্রোগ্রামে কীভাবে যোগ দেব?",
      },
      {
        id: 10,
        en: "How many friends can I refer to?",
        bn: "আমি কতজন বন্ধুকে রেফার করতে পারব?",
      },
      {
        id: 11,
        en: "Do you have additional tips on how to ensure security of my personal data and account information?",
        bn: "ব্যক্তিগত তথ্য ও অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করার অতিরিক্ত উপায় কী?",
      },
      {
        id: 12,
        en: "How do I prevent account hacking or fraud?",
        bn: "অ্যাকাউন্ট হ্যাকিং বা প্রতারণা কীভাবে প্রতিরোধ করব?",
      },
      {
        id: 13,
        en: "Customer support is unreachable. What should I do?",
        bn: "কাস্টমার সাপোর্টে যোগাযোগ করা যাচ্ছে না—আমি কী করব?",
      },
      {
        id: 14,
        en: "Is my personal data kept safe and secure on Bajiman?",
        bn: "Bajiman-এ আমার ব্যক্তিগত তথ্য কি নিরাপদে রাখা হয়?",
      },
      {
        id: 15,
        en: "How to contact the customer support team?",
        bn: "কাস্টমার সাপোর্ট টিমের সঙ্গে কীভাবে যোগাযোগ করব?",
      },
      {
        id: 16,
        en: "How to download Bajiman APP? (Android)",
        bn: "Bajiman অ্যাপ কীভাবে ডাউনলোড করব? (Android)",
      },
      {
        id: 17,
        en: "Biometric Login (Fingerprint & Face ID)",
        bn: "বায়োমেট্রিক লগইন (ফিঙ্গারপ্রিন্ট ও ফেস আইডি)",
      },
      {
        id: 18,
        en: "Can I use the Bajiman APP/Mobile Site with my existing username and password?",
        bn: "বর্তমান ইউজারনেম ও পাসওয়ার্ড দিয়ে কি Bajiman অ্যাপ বা মোবাইল সাইট ব্যবহার করতে পারব?",
      },
      {
        id: 19,
        en: "Is it necessary for my registered name on Bajiman to match my identification documents?",
        bn: "Bajiman-এ নিবন্ধিত নাম কি পরিচয়পত্রের নামের সঙ্গে মিলতে হবে?",
      },
      {
        id: 20,
        en: "How to change my email address or phone number?",
        bn: "ইমেইল ঠিকানা বা ফোন নম্বর কীভাবে পরিবর্তন করব?",
      },
      {
        id: 21,
        en: "How to verify my Bajiman account?",
        bn: "Bajiman অ্যাকাউন্ট কীভাবে ভেরিফাই করব?",
      },
    ],
  },

  {
    id: "payment",
    title: {
      en: "Payment",
      bn: "পেমেন্ট",
    },
    articles: [
      {
        id: 1,
        en: "How to make a deposit on Bajiman?",
        bn: "Bajiman-এ কীভাবে ডিপোজিট করব?",
      },
      {
        id: 2,
        en: "Which payment methods are supported?",
        bn: "কোন কোন পেমেন্ট পদ্ধতি সমর্থিত?",
      },
      {
        id: 3,
        en: "What is the minimum deposit amount?",
        bn: "সর্বনিম্ন ডিপোজিটের পরিমাণ কত?",
      },
      {
        id: 4,
        en: "What is the maximum deposit amount?",
        bn: "সর্বোচ্চ ডিপোজিটের পরিমাণ কত?",
      },
      {
        id: 5,
        en: "How long does a deposit take?",
        bn: "ডিপোজিট সম্পন্ন হতে কত সময় লাগে?",
      },
      {
        id: 6,
        en: "Why is my deposit still pending?",
        bn: "আমার ডিপোজিট এখনো pending কেন?",
      },
      {
        id: 7,
        en: "Why did my deposit fail?",
        bn: "আমার ডিপোজিট ব্যর্থ হয়েছে কেন?",
      },
      {
        id: 8,
        en: "How to withdraw money from Bajiman?",
        bn: "Bajiman থেকে কীভাবে টাকা উত্তোলন করব?",
      },
      {
        id: 9,
        en: "What is the minimum withdrawal amount?",
        bn: "সর্বনিম্ন উত্তোলনের পরিমাণ কত?",
      },
      {
        id: 10,
        en: "How long does a withdrawal take?",
        bn: "উত্তোলন সম্পন্ন হতে কত সময় লাগে?",
      },
      {
        id: 11,
        en: "Why was my withdrawal rejected?",
        bn: "আমার উত্তোলনের অনুরোধ বাতিল হয়েছে কেন?",
      },
      {
        id: 12,
        en: "Can I cancel a withdrawal request?",
        bn: "আমি কি উত্তোলনের অনুরোধ বাতিল করতে পারি?",
      },
    ],
  },

  {
    id: "bajiman-tips",
    title: {
      en: "Bajiman Tips",
      bn: "Bajiman টিপস",
    },
    articles: [
      {
        id: 1,
        en: "How to get started with Bajiman?",
        bn: "Bajiman ব্যবহার শুরু করব কীভাবে?",
      },
      {
        id: 2,
        en: "How to keep your account secure?",
        bn: "অ্যাকাউন্ট নিরাপদ রাখবেন কীভাবে?",
      },
      {
        id: 3,
        en: "How to choose a strong password?",
        bn: "শক্তিশালী পাসওয়ার্ড কীভাবে নির্বাচন করবেন?",
      },
      {
        id: 4,
        en: "How to manage your gaming budget?",
        bn: "গেমিং বাজেট কীভাবে নিয়ন্ত্রণ করবেন?",
      },
      {
        id: 5,
        en: "How to claim Bajiman bonuses?",
        bn: "Bajiman বোনাস কীভাবে claim করবেন?",
      },
      {
        id: 6,
        en: "How to check your transaction history?",
        bn: "লেনদেনের ইতিহাস কীভাবে দেখবেন?",
      },
      {
        id: 7,
        en: "Tips for responsible gaming",
        bn: "দায়িত্বশীল গেমিংয়ের গুরুত্বপূর্ণ পরামর্শ",
      },
      {
        id: 8,
        en: "How to contact Bajiman support quickly?",
        bn: "দ্রুত Bajiman সাপোর্টে যোগাযোগ করবেন কীভাবে?",
      },
    ],
  },

  {
    id: "sports",
    title: {
      en: "Sports",
      bn: "স্পোর্টস",
    },
    articles: [
      {
        id: 1,
        en: "How to place a sports bet?",
        bn: "স্পোর্টস বেট কীভাবে করবেন?",
      },
      {
        id: 2,
        en: "How are sports odds calculated?",
        bn: "স্পোর্টস অডস কীভাবে গণনা করা হয়?",
      },
      {
        id: 3,
        en: "What is a single bet?",
        bn: "সিঙ্গেল বেট কী?",
      },
      {
        id: 4,
        en: "What is a multiple bet?",
        bn: "মাল্টিপল বেট কী?",
      },
      {
        id: 5,
        en: "What is a live bet?",
        bn: "লাইভ বেট কী?",
      },
      {
        id: 6,
        en: "Can I cancel a sports bet?",
        bn: "স্পোর্টস বেট কি বাতিল করা যায়?",
      },
      {
        id: 7,
        en: "Why was my sports bet voided?",
        bn: "আমার স্পোর্টস বেট void হয়েছে কেন?",
      },
      {
        id: 8,
        en: "How are winnings calculated?",
        bn: "জয়ের টাকা কীভাবে গণনা করা হয়?",
      },
    ],
  },

  {
    id: "casino",
    title: {
      en: "Casino",
      bn: "ক্যাসিনো",
    },
    articles: [
      {
        id: 1,
        en: "How to play casino games on Bajiman?",
        bn: "Bajiman-এ ক্যাসিনো গেম কীভাবে খেলব?",
      },
      {
        id: 2,
        en: "What are live casino games?",
        bn: "লাইভ ক্যাসিনো গেম কী?",
      },
      {
        id: 3,
        en: "Which casino providers are available?",
        bn: "কোন কোন ক্যাসিনো প্রোভাইডার পাওয়া যায়?",
      },
      {
        id: 4,
        en: "How are casino winnings credited?",
        bn: "ক্যাসিনো জয়ের টাকা কীভাবে যোগ হয়?",
      },
      {
        id: 5,
        en: "Why is a casino game not opening?",
        bn: "ক্যাসিনো গেম চালু হচ্ছে না কেন?",
      },
      {
        id: 6,
        en: "Can I play casino games on mobile?",
        bn: "মোবাইলে ক্যাসিনো গেম খেলতে পারব কি?",
      },
    ],
  },

  {
    id: "slots",
    title: {
      en: "Slots",
      bn: "স্লট",
    },
    articles: [
      {
        id: 1,
        en: "How to play slot games?",
        bn: "স্লট গেম কীভাবে খেলব?",
      },
      {
        id: 2,
        en: "What is RTP in slot games?",
        bn: "স্লট গেমে RTP কী?",
      },
      {
        id: 3,
        en: "What are free spins?",
        bn: "ফ্রি স্পিন কী?",
      },
      {
        id: 4,
        en: "How does the jackpot work?",
        bn: "জ্যাকপট কীভাবে কাজ করে?",
      },
      {
        id: 5,
        en: "Why did my slot game disconnect?",
        bn: "আমার স্লট গেম disconnect হয়েছে কেন?",
      },
      {
        id: 6,
        en: "Are slot game results fair?",
        bn: "স্লট গেমের ফলাফল কি নিরপেক্ষ?",
      },
    ],
  },

  {
    id: "table",
    title: {
      en: "Table",
      bn: "টেবিল",
    },
    articles: [
      {
        id: 1,
        en: "What are table games?",
        bn: "টেবিল গেম কী?",
      },
      {
        id: 2,
        en: "How to play blackjack?",
        bn: "ব্ল্যাকজ্যাক কীভাবে খেলব?",
      },
      {
        id: 3,
        en: "How to play roulette?",
        bn: "রুলেট কীভাবে খেলব?",
      },
      {
        id: 4,
        en: "How to play baccarat?",
        bn: "ব্যাকারাট কীভাবে খেলব?",
      },
      {
        id: 5,
        en: "What are the table limits?",
        bn: "টেবিল গেমের limit কত?",
      },
      {
        id: 6,
        en: "Can I play table games for free?",
        bn: "টেবিল গেম কি বিনা মূল্যে খেলা যায়?",
      },
    ],
  },

  {
    id: "lottery",
    title: {
      en: "Lottery",
      bn: "লটারি",
    },
    articles: [
      {
        id: 1,
        en: "How to play lottery games?",
        bn: "লটারি গেম কীভাবে খেলব?",
      },
      {
        id: 2,
        en: "How are lottery results determined?",
        bn: "লটারির ফলাফল কীভাবে নির্ধারণ করা হয়?",
      },
      {
        id: 3,
        en: "Where can I check lottery results?",
        bn: "লটারির ফলাফল কোথায় দেখব?",
      },
      {
        id: 4,
        en: "How are lottery winnings paid?",
        bn: "লটারির জয়ের টাকা কীভাবে প্রদান করা হয়?",
      },
      {
        id: 5,
        en: "Can a lottery ticket be cancelled?",
        bn: "লটারির টিকিট কি বাতিল করা যায়?",
      },
    ],
  },

  {
    id: "promotions",
    title: {
      en: "Promotions",
      bn: "প্রমোশন",
    },
    articles: [
      {
        id: 1,
        en: "How to claim a Bajiman promotion?",
        bn: "Bajiman প্রমোশন কীভাবে claim করব?",
      },
      {
        id: 2,
        en: "Where can I find active promotions?",
        bn: "চলমান প্রমোশন কোথায় দেখব?",
      },
      {
        id: 3,
        en: "What are the bonus turnover requirements?",
        bn: "বোনাসের turnover requirement কী?",
      },
      {
        id: 4,
        en: "Why is my bonus unavailable?",
        bn: "আমার বোনাস পাওয়া যাচ্ছে না কেন?",
      },
      {
        id: 5,
        en: "Can I claim more than one promotion?",
        bn: "একাধিক প্রমোশন claim করা যাবে কি?",
      },
      {
        id: 6,
        en: "When does a promotion expire?",
        bn: "প্রমোশনের মেয়াদ কখন শেষ হয়?",
      },
    ],
  },

  {
    id: "technical",
    title: {
      en: "Technical",
      bn: "টেকনিক্যাল",
    },
    articles: [
      {
        id: 1,
        en: "Why is the Bajiman website not loading?",
        bn: "Bajiman ওয়েবসাইট load হচ্ছে না কেন?",
      },
      {
        id: 2,
        en: "Why can I not log in to my account?",
        bn: "আমি অ্যাকাউন্টে login করতে পারছি না কেন?",
      },
      {
        id: 3,
        en: "How to clear browser cache and cookies?",
        bn: "Browser cache ও cookies কীভাবে clear করব?",
      },
      {
        id: 4,
        en: "Why is the game loading slowly?",
        bn: "গেম ধীরে load হচ্ছে কেন?",
      },
      {
        id: 5,
        en: "Why was I disconnected from a game?",
        bn: "গেম থেকে disconnect হয়ে গেছি কেন?",
      },
      {
        id: 6,
        en: "Which browsers are supported by Bajiman?",
        bn: "Bajiman কোন browser সমর্থন করে?",
      },
      {
        id: 7,
        en: "How to update the Bajiman mobile app?",
        bn: "Bajiman মোবাইল অ্যাপ কীভাবে update করব?",
      },
      {
        id: 8,
        en: "How to report a technical problem?",
        bn: "টেকনিক্যাল সমস্যা কীভাবে report করব?",
      },
    ],
  },
];

const BajimanHelpCenter = () => {
  const { isBangla } = useLanguage();

  const [activeCategoryId, setActiveCategoryId] = useState("account");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ||
    categories[0];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, searchText]);

  const filteredArticles = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    if (!term) {
      return activeCategory.articles;
    }

    return activeCategory.articles.filter((article) => {
      const englishText = article.en.toLowerCase();
      const banglaText = article.bn.toLowerCase();

      return englishText.includes(term) || banglaText.includes(term);
    });
  }, [activeCategory, searchText]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / ITEMS_PER_PAGE),
  );

  const visibleArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, currentPage]);

  const leftArticles = visibleArticles.slice(
    0,
    Math.ceil(visibleArticles.length / 2),
  );

  const rightArticles = visibleArticles.slice(
    Math.ceil(visibleArticles.length / 2),
  );

  const handleCategoryChange = (categoryId) => {
    setActiveCategoryId(categoryId);
    setSearchText("");
    setCurrentPage(1);
  };

  const handleArticleClick = (article) => {
    /*
      এখানে চাইলে article details page-এ navigate করতে পারবেন।

      Example:
      navigate(`/help/${activeCategory.id}/${article.id}`);
    */

    console.log("Selected article:", article);
  };

  return (
    <section className="w-full bg-[#285b98] px-4 pb-28 pt-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-[28px] font-bold leading-tight sm:text-[32px]">
            {isBangla ? "শুভ দিন!" : "Good Day!"}
          </h1>

          <p className="mt-[8px] text-[19px] font-medium leading-tight sm:text-[24px]">
            {isBangla ? "আজ আমরা কীভাবে " : "How can we "}

            <span className="font-bold text-[#59e20a]">
              {isBangla ? "আপনাকে সাহায্য" : "help you"}
            </span>

            {isBangla ? " করতে পারি?" : " today?"}
          </p>
        </div>

        {/* Search */}
        <div className="relative mx-auto mt-[21px] w-full max-w-[800px]">
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={
              isBangla
                ? "আমাদের হেল্প আর্টিকেল খুঁজুন..."
                : "Search our help articles..."
            }
            className="h-[56px] w-full rounded-full border border-[#d5d5d5] bg-white py-0 pl-6 pr-[62px] text-[15px] text-[#285b98] shadow-[0_3px_9px_rgba(0,0,0,0.38),inset_0_1px_3px_rgba(0,0,0,0.12)] outline-none placeholder:text-[#4778bd] sm:pl-12 sm:text-[18px]"
          />

          <Search
            size={25}
            strokeWidth={2.2}
            className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-[#0757b2]"
          />
        </div>

        {/* Category tabs */}
        <div className="mt-[95px] overflow-hidden rounded-[7px] border border-[#58ed13]">
          <div className="scrollbar-none flex w-full items-center overflow-x-auto px-4 sm:justify-start lg:justify-center">
            {categories.map((category) => {
              const active = activeCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`shrink-0 cursor-pointer whitespace-nowrap px-[24px] py-[13px] text-[15px] font-normal transition-colors duration-200 sm:text-[16px] ${
                    active
                      ? "text-[#59ed12]"
                      : "text-white hover:text-[#90f56b]"
                  }`}
                >
                  {isBangla ? category.title.bn : category.title.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active category title */}
        <h2 className="mt-[25px] text-[18px] font-bold text-white">
          {isBangla ? activeCategory.title.bn : activeCategory.title.en}
        </h2>

        {/* Article list */}
        {visibleArticles.length > 0 ? (
          <div className="mt-[16px] grid grid-cols-1 gap-x-[70px] lg:grid-cols-2">
            <div className="flex flex-col gap-[12px]">
              {leftArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => handleArticleClick(article)}
                  className="group flex w-full cursor-pointer items-start gap-[8px] text-left text-[15px] font-normal leading-[22px] text-white transition-colors hover:text-[#63ed26] sm:text-[16px]"
                >
                  <ChevronRight
                    size={17}
                    strokeWidth={3}
                    className="mt-[2px] shrink-0 transition-transform group-hover:translate-x-1"
                  />

                  <span>{isBangla ? article.bn : article.en}</span>
                </button>
              ))}
            </div>

            <div className="mt-[12px] flex flex-col gap-[12px] lg:mt-0">
              {rightArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => handleArticleClick(article)}
                  className="group flex w-full cursor-pointer items-start gap-[8px] text-left text-[15px] font-normal leading-[22px] text-white transition-colors hover:text-[#63ed26] sm:text-[16px]"
                >
                  <ChevronRight
                    size={17}
                    strokeWidth={3}
                    className="mt-[2px] shrink-0 transition-transform group-hover:translate-x-1"
                  />

                  <span>{isBangla ? article.bn : article.en}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-16 text-center text-[16px] text-white/75">
            {isBangla
              ? "কোনো হেল্প আর্টিকেল পাওয়া যায়নি।"
              : "No help articles found."}
          </div>
        )}

        {/* Pagination */}
        {filteredArticles.length > ITEMS_PER_PAGE && (
          <div className="mt-[48px] flex items-center justify-center gap-[7px]">
            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index + 1,
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setCurrentPage(pageNumber)}
                className={`h-[26px] min-w-[29px] cursor-pointer rounded-[5px] px-[8px] text-[12px] font-medium transition ${
                  currentPage === pageNumber
                    ? "bg-[#1594ed] text-white"
                    : "bg-[#063e6c] text-white hover:bg-[#0a538b]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(previous + 1, totalPages),
                  )
                }
                className="h-[26px] cursor-pointer rounded-[5px] bg-[#063e6c] px-[12px] text-[12px] font-medium text-white transition hover:bg-[#0a538b]"
              >
                {isBangla ? "পরবর্তী »" : "Next »"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hide horizontal scrollbar */}
      <style>
        {`
          .scrollbar-none {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .scrollbar-none::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </section>
  );
};

export default BajimanHelpCenter;
