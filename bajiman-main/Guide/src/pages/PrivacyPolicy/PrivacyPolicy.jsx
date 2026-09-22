import React from "react";

import StaticPageLayout from "../../components/StaticPageLayout/StaticPageLayout";

const PrivacyPolicy = () => {
  const title = {
    en: "Privacy Policy",
    bn: "প্রাইভেসি পলিসি",
  };

  const sections = [
    {
      paragraphs: [
        {
          en: "Bajiman respects your privacy and is committed to protecting your personal information. This policy explains what information we collect, how we use it, and how we keep it safe.",
          bn: "Bajiman আপনার প্রাইভেসিকে গুরুত্ব দেয় এবং আপনার ব্যক্তিগত তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। এই পলিসিতে আমরা কী তথ্য সংগ্রহ করি, কীভাবে তা ব্যবহার করি এবং কীভাবে নিরাপদ রাখি তা ব্যাখ্যা করা হয়েছে।",
        },
      ],
    },
    {
      heading: {
        en: "Information We Collect",
        bn: "আমরা যে তথ্য সংগ্রহ করি",
      },
      paragraphs: [
        {
          en: "We collect information you provide during registration, such as your name and contact details, along with transaction and activity data needed to operate your account securely.",
          bn: "রেজিস্ট্রেশনের সময় আপনার দেওয়া নাম ও যোগাযোগের তথ্যসহ, আপনার অ্যাকাউন্ট নিরাপদভাবে পরিচালনার জন্য প্রয়োজনীয় লেনদেন ও কার্যক্রমের তথ্য আমরা সংগ্রহ করি।",
        },
      ],
    },
    {
      heading: {
        en: "How We Use Your Information",
        bn: "আমরা কীভাবে আপনার তথ্য ব্যবহার করি",
      },
      paragraphs: [
        {
          en: "Your information is used to verify your identity, process deposits and withdrawals, provide customer support, and improve our services.",
          bn: "আপনার তথ্য আপনার পরিচয় যাচাই, ডিপোজিট ও উইথড্র প্রসেস করা, কাস্টমার সাপোর্ট প্রদান এবং আমাদের সেবা উন্নত করার জন্য ব্যবহার করা হয়।",
        },
      ],
    },
    {
      heading: {
        en: "Data Security",
        bn: "ডেটা সুরক্ষা",
      },
      paragraphs: [
        {
          en: "We use industry-standard security measures to protect your data from unauthorized access, and we never sell your personal information to third parties.",
          bn: "আপনার ডেটা অননুমোদিত অ্যাক্সেস থেকে রক্ষা করতে আমরা ইন্ডাস্ট্রি-স্ট্যান্ডার্ড নিরাপত্তা ব্যবস্থা ব্যবহার করি, এবং আমরা কখনও আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।",
        },
      ],
    },
  ];

  return <StaticPageLayout title={title} sections={sections} />;
};

export default PrivacyPolicy;
