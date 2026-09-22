// Guide help-center content. Static for now — safe to move to a CMS-backed
// API later without touching any component that reads `topics`.

export const topics = [
  {
    slug: "account",
    icon: "UserRoundPlus",
    title: { en: "Account", bn: "অ্যাকাউন্ট" },
    articles: [
      {
        slug: "how-to-register",
        title: {
          en: "How to register an account",
          bn: "কিভাবে অ্যাকাউন্ট রেজিস্ট্রেশন করবেন",
        },
        summary: {
          en: "Step-by-step guide to creating your account in under a minute.",
          bn: "এক মিনিটের মধ্যে অ্যাকাউন্ট তৈরি করার ধাপে ধাপে নির্দেশনা।",
        },
        content: {
          en: "Tap Register on the top right, enter your mobile number and set a password, then confirm the OTP sent to your phone. Your account is ready instantly and you can log in right away.",
          bn: "উপরের ডানদিকে Register বাটনে ট্যাপ করুন, আপনার মোবাইল নম্বর দিয়ে একটি পাসওয়ার্ড সেট করুন, তারপর ফোনে পাঠানো OTP নিশ্চিত করুন। আপনার অ্যাকাউন্ট সাথে সাথেই তৈরি হয়ে যাবে এবং আপনি লগইন করতে পারবেন।",
        },
      },
      {
        slug: "forgot-password",
        title: { en: "I forgot my password", bn: "পাসওয়ার্ড ভুলে গেছি" },
        summary: {
          en: "Reset your password safely using your registered mobile number.",
          bn: "রেজিস্টার করা মোবাইল নম্বর দিয়ে নিরাপদে পাসওয়ার্ড রিসেট করুন।",
        },
        content: {
          en: "On the login page tap Forgot Password, enter your registered mobile number, verify the OTP, then set a new password. For security, never share this OTP with anyone.",
          bn: "লগইন পেজে Forgot Password ট্যাপ করুন, রেজিস্টার করা মোবাইল নম্বরটি দিন, OTP ভেরিফাই করুন, তারপর নতুন পাসওয়ার্ড সেট করুন। নিরাপত্তার জন্য এই OTP কারো সাথে শেয়ার করবেন না।",
        },
      },
      {
        slug: "verify-account",
        title: { en: "Account verification", bn: "অ্যাকাউন্ট ভেরিফিকেশন" },
        summary: {
          en: "Why verification matters and how to complete it.",
          bn: "ভেরিফিকেশন কেন গুরুত্বপূর্ণ এবং কিভাবে সম্পন্ন করবেন।",
        },
        content: {
          en: "Verifying your mobile number and personal info speeds up withdrawals and keeps your account secure. Go to Personal Info from your profile menu to check your verification status.",
          bn: "মোবাইল নম্বর ও পার্সোনাল ইনফো ভেরিফাই করলে উইথড্রয়াল দ্রুত হয় এবং অ্যাকাউন্ট নিরাপদ থাকে। প্রোফাইল মেনু থেকে Personal Info-তে গিয়ে আপনার ভেরিফিকেশন স্ট্যাটাস দেখতে পারবেন।",
        },
      },
    ],
  },
  {
    slug: "payment",
    icon: "Wallet",
    title: { en: "Payment", bn: "পেমেন্ট" },
    articles: [
      {
        slug: "how-to-deposit",
        title: { en: "How to deposit funds", bn: "কিভাবে ডিপোজিট করবেন" },
        summary: {
          en: "Add funds instantly using any supported payment method.",
          bn: "যেকোনো সাপোর্টেড পেমেন্ট মেথড দিয়ে সাথে সাথে ফান্ড যোগ করুন।",
        },
        content: {
          en: "Tap Deposit in the top menu, choose a payment method, enter the amount, and confirm. Most methods credit your wallet within moments of a successful payment.",
          bn: "উপরের মেনুতে Deposit ট্যাপ করুন, একটি পেমেন্ট মেথড বেছে নিন, পরিমাণ লিখুন, এবং কনফার্ম করুন। সফল পেমেন্টের কয়েক মুহূর্তের মধ্যেই বেশিরভাগ মেথডে ওয়ালেটে টাকা যোগ হয়ে যায়।",
        },
      },
      {
        slug: "how-to-withdraw",
        title: { en: "How to withdraw funds", bn: "কিভাবে উইথড্র করবেন" },
        summary: {
          en: "Request a withdrawal and track its status.",
          bn: "উইথড্রয়াল রিকোয়েস্ট করুন এবং স্ট্যাটাস ট্র্যাক করুন।",
        },
        content: {
          en: "Open your profile menu and select Withdrawal, choose your method, enter the amount, and submit. You can track progress anytime from Transaction Records.",
          bn: "প্রোফাইল মেনু খুলে Withdrawal সিলেক্ট করুন, আপনার মেথড বেছে নিন, পরিমাণ লিখুন, এবং সাবমিট করুন। যেকোনো সময় Transaction Records থেকে অগ্রগতি ট্র্যাক করতে পারবেন।",
        },
      },
      {
        slug: "payment-failed",
        title: {
          en: "My deposit didn't reflect",
          bn: "আমার ডিপোজিট যোগ হয়নি",
        },
        summary: {
          en: "What to check before contacting support.",
          bn: "সাপোর্টে যোগাযোগ করার আগে যা যাচাই করবেন।",
        },
        content: {
          en: "First check Transaction Records for the payment status. If the amount was debited from your bank or wallet but not credited within 30 minutes, contact live support with your transaction reference.",
          bn: "প্রথমে Transaction Records-এ পেমেন্টের স্ট্যাটাস দেখুন। যদি ব্যাংক বা ওয়ালেট থেকে টাকা কেটে নেওয়া হয়ে থাকে কিন্তু ৩০ মিনিটের মধ্যে যোগ না হয়, তাহলে ট্রানজেকশন রেফারেন্স নিয়ে লাইভ সাপোর্টে যোগাযোগ করুন।",
        },
      },
    ],
  },
  {
    slug: "promotions",
    icon: "Gift",
    title: { en: "Promotions", bn: "প্রোমোশন" },
    articles: [
      {
        slug: "welcome-bonus",
        title: { en: "Welcome bonus explained", bn: "ওয়েলকাম বোনাস বিস্তারিত" },
        summary: {
          en: "How the first-deposit bonus works and how to claim it.",
          bn: "প্রথম ডিপোজিট বোনাস কিভাবে কাজ করে এবং কিভাবে দাবি করবেন।",
        },
        content: {
          en: "New members get a bonus on their first deposit, credited automatically to the bonus wallet. Check the Promotions page for the current rate and turnover requirement.",
          bn: "নতুন সদস্যরা প্রথম ডিপোজিটে বোনাস পান, যা স্বয়ংক্রিয়ভাবে বোনাস ওয়ালেটে যোগ হয়। বর্তমান হার এবং টার্নওভার শর্তের জন্য Promotions পেজ দেখুন।",
        },
      },
      {
        slug: "referral-program",
        title: { en: "Referral bonus program", bn: "রেফারেল বোনাস প্রোগ্রাম" },
        summary: {
          en: "Earn commission by inviting friends.",
          bn: "বন্ধুদের আমন্ত্রণ জানিয়ে কমিশন আয় করুন।",
        },
        content: {
          en: "Share your referral code from the Refer Bonus menu. When a friend signs up and plays using your code, you earn commission credited to your refer wallet.",
          bn: "Refer Bonus মেনু থেকে আপনার রেফারেল কোড শেয়ার করুন। কোনো বন্ধু আপনার কোড দিয়ে সাইন আপ করে খেললে, আপনি কমিশন পাবেন যা রেফার ওয়ালেটে যোগ হবে।",
        },
      },
      {
        slug: "turnover-requirement",
        title: {
          en: "What is a turnover requirement",
          bn: "টার্নওভার শর্ত কী",
        },
        summary: {
          en: "Understand wagering requirements before withdrawing bonus funds.",
          bn: "বোনাস ফান্ড উইথড্র করার আগে ওয়েজারিং শর্ত বুঝে নিন।",
        },
        content: {
          en: "A turnover requirement is the amount you must wager before a bonus becomes withdrawable. Track your progress anytime under Turnover History in your profile menu.",
          bn: "টার্নওভার শর্ত হলো বোনাস উইথড্র করার আগে আপনাকে যে পরিমাণ বাজি খেলতে হবে। প্রোফাইল মেনুর Turnover History থেকে যেকোনো সময় অগ্রগতি দেখতে পারবেন।",
        },
      },
    ],
  },
  {
    slug: "tips",
    icon: "Lightbulb",
    title: { en: "Bajiman Tips", bn: "Bajiman টিপস" },
    articles: [
      {
        slug: "responsible-play",
        title: { en: "Play responsibly", bn: "দায়িত্বশীলভাবে খেলুন" },
        summary: {
          en: "Simple habits to keep play fun and under control.",
          bn: "খেলা মজার ও নিয়ন্ত্রণে রাখার সহজ অভ্যাস।",
        },
        content: {
          en: "Set a deposit limit before you start, never chase losses, and take regular breaks. Visit Responsible Gambling in the footer for tools like self-exclusion and deposit limits.",
          bn: "খেলা শুরুর আগে একটি ডিপোজিট লিমিট ঠিক করুন, লস তাড়া করবেন না, এবং নিয়মিত বিরতি নিন। সেলফ-এক্সক্লুশন ও ডিপোজিট লিমিটের মতো টুলসের জন্য ফুটারে থাকা Responsible Gambling দেখুন।",
        },
      },
      {
        slug: "keep-account-secure",
        title: { en: "Keep your account secure", bn: "অ্যাকাউন্ট নিরাপদ রাখুন" },
        summary: {
          en: "Basic security habits every member should follow.",
          bn: "প্রতিটি সদস্যের অনুসরণ করা উচিত এমন মৌলিক নিরাপত্তা অভ্যাস।",
        },
        content: {
          en: "Use a strong, unique password, never share your OTP or login details with anyone claiming to be support, and log out on shared devices.",
          bn: "শক্তিশালী ও ইউনিক পাসওয়ার্ড ব্যবহার করুন, সাপোর্ট দাবিকারী কারো সাথে OTP বা লগইন তথ্য শেয়ার করবেন না, এবং শেয়ার করা ডিভাইসে লগআউট করুন।",
        },
      },
      {
        slug: "notice-updates",
        title: { en: "Stay updated with notices", bn: "নোটিশে চোখ রাখুন" },
        summary: {
          en: "Where to find important announcements.",
          bn: "গুরুত্বপূর্ণ ঘোষণা কোথায় পাবেন।",
        },
        content: {
          en: "Check the notice bar on the homepage for maintenance windows, new promotions, and policy updates before you start playing.",
          bn: "খেলা শুরুর আগে হোমপেজের নোটিশ বারে মেইনটেন্যান্স সময়, নতুন প্রোমোশন এবং পলিসি আপডেট দেখে নিন।",
        },
      },
    ],
  },
  {
    slug: "sports",
    icon: "Trophy",
    title: { en: "Sports", bn: "স্পোর্টস" },
    articles: [
      {
        slug: "how-to-bet",
        title: { en: "How to place a sports bet", bn: "কিভাবে স্পোর্টস বাজি ধরবেন" },
        summary: {
          en: "From picking a match to confirming your slip.",
          bn: "ম্যাচ বাছাই থেকে স্লিপ কনফার্ম করা পর্যন্ত।",
        },
        content: {
          en: "Open Sports from the menu, pick a match and market, tap the odds to add it to your bet slip, enter your stake, and confirm.",
          bn: "মেনু থেকে Sports খুলুন, একটি ম্যাচ ও মার্কেট বাছাই করুন, অডস ট্যাপ করে বেট স্লিপে যোগ করুন, স্টেক লিখুন, এবং কনফার্ম করুন।",
        },
      },
      {
        slug: "bet-history",
        title: { en: "Where to check bet history", bn: "বাজির ইতিহাস কোথায় দেখবেন" },
        summary: {
          en: "Review your past sports bets and results.",
          bn: "আপনার আগের স্পোর্টস বাজি ও ফলাফল দেখুন।",
        },
        content: {
          en: "Your full bet history, including pending and settled bets, is available from the Bet History section in your profile menu.",
          bn: "পেন্ডিং ও সেটল্‌ড সহ আপনার সম্পূর্ণ বাজির ইতিহাস প্রোফাইল মেনুর Bet History সেকশনে পাওয়া যাবে।",
        },
      },
      {
        slug: "live-betting",
        title: { en: "What is live betting", bn: "লাইভ বেটিং কী" },
        summary: {
          en: "Betting on matches as they happen.",
          bn: "ম্যাচ চলাকালীন বাজি ধরা।",
        },
        content: {
          en: "Live betting lets you place wagers while a match is in progress, with odds updating in real time based on what's happening on the field.",
          bn: "লাইভ বেটিং-এ ম্যাচ চলাকালীন বাজি ধরা যায়, এবং মাঠে যা ঘটছে তার উপর ভিত্তি করে অডস রিয়েল টাইমে আপডেট হয়।",
        },
      },
    ],
  },
  {
    slug: "casino",
    icon: "Dice5",
    title: { en: "Casino", bn: "ক্যাসিনো" },
    articles: [
      {
        slug: "popular-games",
        title: { en: "Finding popular games", bn: "জনপ্রিয় গেম খুঁজে বের করা" },
        summary: {
          en: "Browse trending and top-rated casino games.",
          bn: "ট্রেন্ডিং ও টপ-রেটেড ক্যাসিনো গেম ব্রাউজ করুন।",
        },
        content: {
          en: "The Popular Games and Hot Games sections on the homepage highlight what other members are playing most right now.",
          bn: "হোমপেজের Popular Games ও Hot Games সেকশনে দেখা যায় এখন সবচেয়ে বেশি সদস্যরা কী খেলছেন।",
        },
      },
      {
        slug: "game-providers",
        title: { en: "About game providers", bn: "গেম প্রোভাইডার সম্পর্কে" },
        summary: {
          en: "Games are sourced from licensed, audited providers.",
          bn: "গেমগুলো লাইসেন্সপ্রাপ্ত ও অডিটেড প্রোভাইডার থেকে আসে।",
        },
        content: {
          en: "Filter games by provider from the Games page to find your favorite studios. Each provider is independently licensed and their games are fairness-audited.",
          bn: "আপনার পছন্দের স্টুডিও খুঁজে পেতে Games পেজ থেকে প্রোভাইডার দিয়ে ফিল্টার করুন। প্রতিটি প্রোভাইডার স্বতন্ত্রভাবে লাইসেন্সপ্রাপ্ত এবং তাদের গেম ফেয়ারনেস-অডিটেড।",
        },
      },
      {
        slug: "game-loading-issue",
        title: {
          en: "A game won't load",
          bn: "একটি গেম লোড হচ্ছে না",
        },
        summary: {
          en: "Quick fixes before contacting support.",
          bn: "সাপোর্টে যোগাযোগ করার আগে দ্রুত সমাধান।",
        },
        content: {
          en: "Refresh the page, clear your browser cache, or try a different network connection. If the issue continues, report the exact game name to live support.",
          bn: "পেজ রিফ্রেশ করুন, ব্রাউজার ক্যাশ ক্লিয়ার করুন, অথবা অন্য একটি নেটওয়ার্ক কানেকশন ব্যবহার করে দেখুন। সমস্যা চলতে থাকলে সঠিক গেমের নাম উল্লেখ করে লাইভ সাপোর্টে জানান।",
        },
      },
    ],
  },
];

export const findTopic = (slug) => topics.find((t) => t.slug === slug);

export const findArticle = (topicSlug, articleSlug) => {
  const topic = findTopic(topicSlug);
  if (!topic) return { topic: null, article: null };
  const article = topic.articles.find((a) => a.slug === articleSlug);
  return { topic, article: article || null };
};
