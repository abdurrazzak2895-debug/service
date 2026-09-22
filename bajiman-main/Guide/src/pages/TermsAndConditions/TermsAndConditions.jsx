import React from "react";

import StaticPageLayout from "../../components/StaticPageLayout/StaticPageLayout";

const TermsAndConditions = () => {
  const title = {
    en: "Terms And Conditions",
    bn: "শর্তাবলী",
  };

  const sections = [
    {
      paragraphs: [
        {
          en: "These Terms and Conditions govern your use of Bajiman. By accessing or using our platform, you confirm that you accept and agree to be bound by these terms.",
          bn: "এই শর্তাবলী Bajiman ব্যবহারের নিয়ম নির্ধারণ করে। আমাদের প্ল্যাটফর্ম অ্যাক্সেস বা ব্যবহার করার মাধ্যমে, আপনি নিশ্চিত করছেন যে আপনি এই শর্তাবলী মেনে নিচ্ছেন এবং তা মানতে সম্মত।",
        },
      ],
    },
    {
      heading: {
        en: "Eligibility",
        bn: "যোগ্যতা",
      },
      paragraphs: [
        {
          en: "You must be of legal age in your country of residence to register and use Bajiman services. It is your responsibility to ensure that using our platform is legal in your jurisdiction.",
          bn: "Bajiman-এর সেবা ব্যবহার ও রেজিস্ট্রেশনের জন্য আপনার নিজ দেশে আইনগতভাবে প্রাপ্তবয়স্ক হতে হবে। আপনার অঞ্চলে আমাদের প্ল্যাটফর্ম ব্যবহার আইনসম্মত কিনা তা নিশ্চিত করার দায়িত্ব আপনার।",
        },
      ],
    },
    {
      heading: {
        en: "Account Responsibility",
        bn: "অ্যাকাউন্টের দায়িত্ব",
      },
      paragraphs: [
        {
          en: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
          bn: "আপনার অ্যাকাউন্ট তথ্যের গোপনীয়তা বজায় রাখা এবং আপনার অ্যাকাউন্টের অধীনে সংঘটিত সকল কার্যক্রমের জন্য আপনি দায়ী।",
        },
      ],
    },
    {
      heading: {
        en: "Changes to Terms",
        bn: "শর্তাবলীর পরিবর্তন",
      },
      paragraphs: [
        {
          en: "Bajiman reserves the right to update these Terms and Conditions at any time. Continued use of the platform after changes are made constitutes acceptance of the updated terms.",
          bn: "Bajiman যেকোনো সময় এই শর্তাবলী পরিবর্তনের অধিকার সংরক্ষণ করে। পরিবর্তনের পর প্ল্যাটফর্মের ব্যবহার অব্যাহত রাখলে তা আপডেটেড শর্তাবলী মেনে নেওয়া হিসেবে বিবেচিত হবে।",
        },
      ],
    },
  ];

  return <StaticPageLayout title={title} sections={sections} />;
};

export default TermsAndConditions;
