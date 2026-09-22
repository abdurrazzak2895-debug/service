import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";

const AboutBrand = () => {
  const { isBangla } = useLanguage();

  const paragraphs = isBangla
    ? [
        "বাজিমান একটি বিনোদনভিত্তিক প্ল্যাটফর্ম যা তার ব্যবহারকারীদের জন্য একটি নিরাপদ, দ্রুত এবং উপভোগ্য অভিজ্ঞতা তৈরি করতে প্রতিশ্রুতিবদ্ধ।",
        "আমরা বিশ্বাস করি ভালো অংশীদারিত্ব এবং কমিউনিটির সাথে সম্পৃক্ততা একটি ব্র্যান্ডকে দীর্ঘমেয়াদে শক্তিশালী করে।",
        "এই পেজে আমাদের স্পনসরশিপ, ব্র্যান্ড অ্যাম্বাসেডর এবং অর্জনগুলোর একটি সংক্ষিপ্ত পরিচিতি দেওয়া আছে।",
      ]
    : [
        "Bajiman is an entertainment-focused platform committed to building a safe, fast, and enjoyable experience for its users.",
        "We believe strong partnerships and genuine community engagement are what make a brand stand the test of time.",
        "This page gives a short introduction to our sponsorships, brand ambassadors, and milestones.",
      ];

  return (
    <section className="mx-auto max-w-[900px] px-4 py-14 text-center sm:px-6 lg:px-8">
      <h2 className="text-[22px] font-bold text-[#111111] sm:text-[28px]">
        {isBangla ? "আমাদের সম্পর্কে" : "About the Brand"}
      </h2>

      <div className="mt-6 space-y-4">
        {paragraphs.map((text, index) => (
          <p key={index} className="text-[14px] leading-7 text-[#444444] sm:text-[15px]">
            {text}
          </p>
        ))}
      </div>
    </section>
  );
};

export default AboutBrand;
