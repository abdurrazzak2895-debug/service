import React, { useMemo } from "react";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaTelegramPlane,
} from "react-icons/fa";

const Footer = () => {
  const { isBangla } = useLanguage();

  // ✅ TEXT
  const t = useMemo(() => {
    return {
      leftTitle: isBangla
        ? "BABU88 এশিয়ার বিশ্বস্ত অনলাইন ক্যাসিনো। বাংলাদেশ, ভারত, নেপাল পাওয়া যাচ্ছে।"
        : "BABU88 is Asia’s trusted online casino. Available in Bangladesh, India, and Nepal.",
      leftBody: isBangla
        ? "BABU88 হল একটি অনলাইন জুয়া কোম্পানি, যা বিশ্বস্তভাবে বাজি এবং ক্যাসিনো অফার করে। ২০২১ সাল থেকে BABU88 দক্ষিণ এশিয়ার সবচেয়ে জনপ্রিয় একটি প্ল্যাটফর্ম হিসেবে পরিচিত। আমাদের লক্ষ্য হল নিরাপদ এবং দ্রুত সার্ভিস প্রদান করা।"
        : "BABU88 is an online betting and casino platform known for reliable service. Since 2021, BABU88 has become one of the most popular platforms in South Asia. Our goal is to provide safe and fast service.",
      siteName: isBangla ? "সাইটনেম" : "Site Name",
      official: "BABU88 OFFICIAL",

      rightTitle: isBangla
        ? "অফিসিয়াল পার্টনার এবং স্পনসর"
        : "Official Partners & Sponsors",
      responsibleTitle: isBangla ? "দায়িত্বশীল গেমিং" : "Responsible Gaming",

      paymentTitle: isBangla ? "পেমেন্ট পদ্ধতি" : "Payment Methods",
      followTitle: isBangla ? "আমাদের অনুসরণ করুন" : "Follow Us",

      copyright: isBangla
        ? "Copyright © 2025 BABU88. All rights reserved"
        : "Copyright © 2025 BABU88. All rights reserved",
    };
  }, [isBangla]);

  // ✅ IMAGES (Replace these with your real assets / urls)
  const paymentMethods = [
    { name: "bKash", src: "https://i.ibb.co.com/m53MnsJ1/bkash.png" },
    {
      name: "Nagad",
      src: "https://i.ibb.co.com/qYG7H89W/nagan-logo-horizontal-bangla-mobile-banking-app-icon-transparent-background-free-png.webp",
    },
    {
      name: "Rocket",
      src: "https://i.ibb.co.com/dwf24nF8/Pixahunt-4218df4e68e104c26a82ebca34e79fe0-removebg-preview.png",
    },
    {
      name: "Upay",
      src: "https://i.ibb.co.com/WC62rnf/upay-logo-color-mobile-banking-app-icon-free-png.webp",
    },
  ];

  const partners = [
    {
      name: "Montreal Tigers",
      src: "https://i.ibb.co.com/bg3F0Y2N/vintage-badge-hand-holding-joystick-vector-illustration-round-label-with-gamepad-74855-11224.avif",
    },
    {
      name: "Dambulla Aura",
      src: "https://i.ibb.co.com/hxL0ntLZ/pngtree-awesome-gamer-illustration-for-t-shirt-design-png-image-4219646.png",
    },
    {
      name: "Northern Warriors",
      src: "https://i.ibb.co.com/Z62Q4Qtv/pngtree-a-lively-and-entertaining-cartoon-character-holding-cold-drink-video-game-png-image-14875526.png",
    },
  ];

  const responsible = [
    {
      name: "18+",
      src: "https://i.ibb.co.com/R4Nm1GTT/aa630c8cf6d3a6f304d85b39c46af784.png",
    },
    { name: "G", src: "https://i.ibb.co.com/tMGkZrV1/Add-a-heading-1.png" },
  ];

  return (
    <footer className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* top dotted line */}
        <div className="border-t border-dashed border-white/30 mb-10" />

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT SIDE */}
          <div>
            <h3 className="text-base sm:text-lg font-bold leading-snug">
              {t.leftTitle}
            </h3>

            <p className="mt-4 text-sm sm:text-[15px] text-white/80 leading-relaxed max-w-2xl">
              {t.leftBody}
            </p>

            <div className="mt-10">
              <p className="text-sm font-semibold text-white/90">
                {t.siteName}
              </p>

              {/* BABU88 OFFICIAL logo text (replace with image if you have) */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold italic">
                  BABU
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold italic text-yellow-500">
                  88
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-wide text-white/80">
                  OFFICIAL
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <h3 className="text-base sm:text-lg font-bold">{t.rightTitle}</h3>

            {/* partner logos */}
            <div className="mt-5 flex flex-wrap items-center gap-6">
              {partners.map((p) => (
                <div key={p.name} className="text-center">
                  <img
                    src={p.src}
                    alt={p.name}
                    className="h-10 sm:h-12 w-auto mx-auto
                               opacity-80 grayscale
                               hover:grayscale-0 hover:opacity-100
                               transition duration-300"
                    loading="lazy"
                  />
                  <p className="mt-2 text-[10px] sm:text-xs text-white/70">
                    {p.name}
                  </p>
                </div>
              ))}
            </div>

            {/* responsible gaming */}
            <h3 className="mt-10 text-base sm:text-lg font-bold">
              {t.responsibleTitle}
            </h3>

            <div className="mt-4 flex items-center gap-6">
              {responsible.map((r) => (
                <img
                  key={r.name}
                  src={r.src}
                  alt={r.name}
                  className="h-8 sm:h-10 w-auto opacity-70 hover:opacity-100 transition"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>

        {/* bottom dotted line */}
        <div className="border-t border-dashed border-white/30 my-10" />

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* payment */}
          <div>
            <h4 className="text-base sm:text-lg font-bold">{t.paymentTitle}</h4>

            <div className="mt-5 flex flex-wrap items-center gap-6">
              {paymentMethods.map((m) => (
                <img
                  key={m.name}
                  src={m.src}
                  alt={m.name}
                  className="h-6 sm:h-7 w-auto opacity-60 grayscale
                             hover:grayscale-0 hover:opacity-100
                             transition duration-300"
                  loading="lazy"
                />
              ))}
            </div>

            <p className="mt-10 text-sm text-white/80">{t.copyright}</p>
          </div>

          {/* social */}
          <div className="lg:text-center">
            <h4 className="text-base sm:text-lg font-bold">{t.followTitle}</h4>

            <div className="mt-5 flex lg:justify-center items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                           hover:bg-white hover:text-black transition"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                           hover:bg-white hover:text-black transition"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                           hover:bg-white hover:text-black transition"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                           hover:bg-white hover:text-black transition"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                           hover:bg-white hover:text-black transition"
                aria-label="Telegram"
              >
                <FaTelegramPlane />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
