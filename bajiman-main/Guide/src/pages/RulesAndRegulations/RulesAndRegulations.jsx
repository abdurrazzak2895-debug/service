import React from "react";

import StaticPageLayout from "../../components/StaticPageLayout/StaticPageLayout";

const RulesAndRegulations = () => {
  const title = {
    en: "Rules and Regulations",
    bn: "নিয়মাবলী",
  };

  const sections = [
    {
      paragraphs: [
        {
          en: "By creating an account and using Bajiman, you agree to follow the rules and regulations described below, along with our Terms and Conditions and Privacy Policy.",
          bn: "একটি অ্যাকাউন্ট তৈরি করে Bajiman ব্যবহার করার মাধ্যমে, আপনি নিচে উল্লেখিত নিয়মাবলী এবং আমাদের শর্তাবলী ও প্রাইভেসি পলিসি মেনে চলতে সম্মত হচ্ছেন।",
        },
      ],
    },
    {
      heading: {
        en: "Account Rules",
        bn: "অ্যাকাউন্ট সংক্রান্ত নিয়ম",
      },
      paragraphs: [
        {
          en: "Each user is allowed to hold only one account. Account details, including username and password, must be kept confidential and not shared with anyone.",
          bn: "প্রতিটি ইউজার শুধুমাত্র একটি অ্যাকাউন্ট রাখতে পারবেন। ইউজারনেম ও পাসওয়ার্ডসহ অ্যাকাউন্ট তথ্য গোপন রাখতে হবে এবং কারো সঙ্গে শেয়ার করা যাবে না।",
        },
      ],
    },
    {
      heading: {
        en: "Deposits and Withdrawals",
        bn: "ডিপোজিট ও উইথড্র",
      },
      paragraphs: [
        {
          en: "All deposits and withdrawals must be made using the payment methods and account information provided by the user themselves. Bonus and turnover requirements must be completed as specified before a withdrawal can be processed.",
          bn: "সকল ডিপোজিট ও উইথড্র অবশ্যই ইউজারের নিজের পেমেন্ট মাধ্যম ও তথ্য ব্যবহার করে করতে হবে। উইথড্র প্রসেস করার আগে নির্ধারিত বোনাস ও টার্নওভারের শর্ত পূরণ করতে হবে।",
        },
      ],
    },
    {
      heading: {
        en: "Fair Play",
        bn: "ফেয়ার প্লে",
      },
      paragraphs: [
        {
          en: "Any form of fraud, collusion, use of bots, or exploitation of system errors is strictly prohibited and may result in account suspension.",
          bn: "যেকোনো ধরনের প্রতারণা, যোগসাজশ, বট ব্যবহার অথবা সিস্টেম ত্রুটির অপব্যবহার কঠোরভাবে নিষিদ্ধ এবং এর ফলে অ্যাকাউন্ট স্থগিত হতে পারে।",
        },
      ],
    },
  ];

  return <StaticPageLayout title={title} sections={sections} />;
};

export default RulesAndRegulations;
