import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";

const Agent = () => {
  const { isBangla } = useLanguage();

  const t = useMemo(() => {
    return {
      title: isBangla ? "BABU88 এজেন্ট হন!" : "Become a BABU88 Agent!",
      p1: isBangla
        ? "BABU88 বাংলাদেশের এজেন্টদের জন্য তাদের আয় বৃদ্ধির এক অনন্যসুযোগ প্রদান করে যাচ্ছে কখনও হয়নি!"
        : "BABU88 offers Bangladeshi agents a unique opportunity to increase their income like never before!",
      p2: isBangla
        ? "BABU88 এজেন্টদের সাথে যোগ দিন — আজই আপনার আয় বৃদ্ধি করুন!"
        : "Join BABU88 agents — increase your income today!",
      list: isBangla
        ? [
            "৬০% পর্যন্ত কমিশন - যা বাজারের সর্বোচ্চ",
            "সাপ্তাহিক বোনাস এবং মাসিক প্রোমো",
            "BABU LEGEND এজেন্ট লয়্যালিটি প্রোগ্রামের মাধ্যমে নতুন পুরস্কার এবং রিচার্জ উপহার",
            "অসংখ্য গেম সহ বিশ্বস্ত বেটিং প্ল্যাটফর্ম",
          ]
        : [
            "Up to 60% commission — the highest in the market",
            "Weekly bonuses and monthly promos",
            "New rewards & recharge gifts via BABU LEGEND agent loyalty program",
            "Trusted betting platform with lots of games",
          ],
      p3: isBangla
        ? "BABU88 দিয়ে আরও বেশি উপার্জন শুরু করুন — দ্রুত, সহজ এবং ফলপ্রসূ!"
        : "Start earning more with BABU88 — fast, easy, and rewarding!",
      strip: isBangla ? "পর্যন্ত কমিশন অর্জন করুন" : "Earn Commission Up To",
      btn: isBangla ? "এখনই যোগদান করুন!" : "Join Now!",
    };
  }, [isBangla]);

  return (
    <section className="w-full bg-[#2b2b2b] text-white py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-8 sm:mb-10">
          {t.title}
        </h2>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* LEFT SIDE */}
          <div className="space-y-5">
            <p className="text-sm sm:text-base leading-relaxed text-white/95">
              {t.p1}
            </p>

            <p className="text-sm sm:text-base leading-relaxed text-white/95">
              {t.p2}
            </p>

            {/* checklist */}
            <ul className="space-y-3 pt-2">
              {t.list.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-sm bg-green-500">
                    <Check size={16} className="text-white" />
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-sm sm:text-base leading-relaxed pt-2 text-white/95">
              {t.p3}
            </p>
          </div>

          {/* RIGHT SIDE (yellow card) */}
          <div className="bg-[#f5b400] rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.45)] border border-black/10 p-6 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-md text-center">
              {/* 60% */}
              <div className="text-[56px] sm:text-[72px] font-extrabold text-black leading-none">
                60%
              </div>

              {/* blue highlight strip */}
              <div className="mt-3 inline-block px-4 sm:px-6 py-2">
                <span className="text-white font-extrabold text-lg sm:text-2xl tracking-wide">
                  {t.strip}
                </span>
              </div>

              {/* Button */}
              <div className="mt-6">
                <Link
                  to="/register"
                  className="inline-block bg-black text-white font-bold px-6 sm:px-8 py-3 rounded-md hover:bg-[#1f1f1f] transition"
                >
                  {t.btn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Agent;
