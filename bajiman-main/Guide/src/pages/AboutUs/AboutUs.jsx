import React from "react";

import StaticPageLayout from "../../components/StaticPageLayout/StaticPageLayout";

const AboutUs = () => {
  const title = {
    en: "About Us",
    bn: "আমাদের সম্পর্কে",
  };

  const sections = [
    {
      paragraphs: [
        {
          en: "Bajiman is a modern online gaming and entertainment platform built to give players a fast, secure and rewarding experience. From slots and live casino to sports and esports, Bajiman brings together a wide range of games under one trusted brand.",
          bn: "Bajiman একটি আধুনিক অনলাইন গেমিং ও এন্টারটেইনমেন্ট প্ল্যাটফর্ম, যা খেলোয়াড়দের দ্রুত, নিরাপদ এবং লাভজনক অভিজ্ঞতা দেওয়ার জন্য তৈরি করা হয়েছে। স্লট ও লাইভ ক্যাসিনো থেকে শুরু করে স্পোর্টস ও ই-স্পোর্টস পর্যন্ত বিস্তৃত পরিসরের গেম Bajiman একই বিশ্বস্ত ব্র্যান্ডের অধীনে নিয়ে এসেছে।",
        },
      ],
    },
    {
      heading: {
        en: "Our Mission",
        bn: "আমাদের লক্ষ্য",
      },
      paragraphs: [
        {
          en: "Our mission is to deliver a seamless, transparent and fair gaming environment, backed by fast deposits and withdrawals, a dedicated VIP program and round-the-clock customer support.",
          bn: "আমাদের লক্ষ্য হলো দ্রুত ডিপোজিট ও উইথড্র, ডেডিকেটেড VIP প্রোগ্রাম এবং ২৪ ঘণ্টা কাস্টমার সাপোর্টের মাধ্যমে একটি নির্বিঘ্ন, স্বচ্ছ এবং ন্যায্য গেমিং পরিবেশ প্রদান করা।",
        },
      ],
    },
    {
      heading: {
        en: "Why Choose Bajiman",
        bn: "কেন Bajiman বেছে নেবেন",
      },
      paragraphs: [
        {
          en: "With a wide selection of games, multiple secure payment options, an active affiliate and referral program, and a VIP club offering exclusive rewards, Bajiman is designed for players who want more from their gaming journey.",
          bn: "বিস্তৃত গেম সংগ্রহ, একাধিক নিরাপদ পেমেন্ট অপশন, সক্রিয় অ্যাফিলিয়েট ও রেফারেল প্রোগ্রাম এবং বিশেষ পুরস্কার সম্বলিত VIP ক্লাবের মাধ্যমে Bajiman তৈরি করা হয়েছে তাদের জন্য, যারা তাদের গেমিং যাত্রা থেকে আরও বেশি কিছু চান।",
        },
      ],
    },
  ];

  return <StaticPageLayout title={title} sections={sections} />;
};

export default AboutUs;
