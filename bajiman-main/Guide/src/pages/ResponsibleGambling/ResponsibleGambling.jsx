import React from "react";

import StaticPageLayout from "../../components/StaticPageLayout/StaticPageLayout";

const ResponsibleGambling = () => {
  const title = {
    en: "Responsible Gambling",
    bn: "দায়িত্বশীল গেমিং",
  };

  const sections = [
    {
      paragraphs: [
        {
          en: "Bajiman is committed to promoting responsible gambling. While gaming is meant to be fun and entertaining, we want every player to stay in control of their time and spending.",
          bn: "Bajiman দায়িত্বশীল গেমিং প্রচারে প্রতিশ্রুতিবদ্ধ। গেমিং আনন্দ ও বিনোদনের জন্য হলেও, আমরা চাই প্রতিটি খেলোয়াড় তাদের সময় ও খরচের ওপর নিয়ন্ত্রণ বজায় রাখুক।",
        },
      ],
    },
    {
      heading: {
        en: "Set Your Limits",
        bn: "নিজের সীমা নির্ধারণ করুন",
      },
      paragraphs: [
        {
          en: "Decide in advance how much time and money you are comfortable spending, and never chase losses. Treat gaming as entertainment, not as a way to earn income.",
          bn: "আগে থেকেই ঠিক করুন আপনি কতটা সময় এবং টাকা খরচ করতে স্বাচ্ছন্দ্যবোধ করেন, এবং কখনও ক্ষতির পিছনে দৌড়াবেন না। গেমিংকে আয়ের উপায় হিসেবে না দেখে বিনোদন হিসেবে দেখুন।",
        },
      ],
    },
    {
      heading: {
        en: "Underage Gambling",
        bn: "অপ্রাপ্তবয়স্ক গেমিং",
      },
      paragraphs: [
        {
          en: "Bajiman services are strictly intended for adults who meet the legal age requirement in their jurisdiction. Gambling by minors is strictly prohibited.",
          bn: "Bajiman-এর সেবা শুধুমাত্র তাদের জন্য, যারা তাদের অঞ্চলের আইনি বয়সসীমা পূরণ করেন। অপ্রাপ্তবয়স্কদের গেমিং কঠোরভাবে নিষিদ্ধ।",
        },
      ],
    },
    {
      heading: {
        en: "Getting Help",
        bn: "সহায়তা নেওয়া",
      },
      paragraphs: [
        {
          en: "If you feel that gambling is becoming a problem for you or someone you know, please seek help from a professional support organisation in your area, and consider using self-exclusion tools where available.",
          bn: "যদি মনে করেন গেমিং আপনার বা আপনার পরিচিত কারো জন্য সমস্যা হয়ে উঠছে, তাহলে অনুগ্রহ করে আপনার এলাকার কোনো প্রফেশনাল সাপোর্ট সংস্থার সাহায্য নিন এবং সম্ভব হলে সেলফ-এক্সক্লুশন টুল ব্যবহার করুন।",
        },
      ],
    },
  ];

  return <StaticPageLayout title={title} sections={sections} />;
};

export default ResponsibleGambling;
