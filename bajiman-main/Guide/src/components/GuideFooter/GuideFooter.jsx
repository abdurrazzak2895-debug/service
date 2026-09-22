import React from "react";
import { Facebook, Instagram, Send } from "lucide-react";

import footerLogo from "../../assets/footer/footer-logo.png";
import { useLanguage } from "../../Context/LanguageProvider";

const GuideFooter = () => {
  const { isBangla } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerColumns = [
    [
      {
        label: { en: "About Us", bn: "আমাদের সম্পর্কে" },
        href: "/about-us",
      },
      {
        label: { en: "Contact Us", bn: "যোগাযোগ করুন" },
        href: "/contact-us",
      },
    ],
    [
      {
        label: { en: "Responsible Gambling", bn: "দায়িত্বশীল গেমিং" },
        href: "/responsible-gambling",
      },
      {
        label: { en: "Rules and Regulations", bn: "নিয়মাবলী" },
        href: "/rules-and-regulations",
      },
    ],
    [
      {
        label: { en: "Privacy Policy", bn: "প্রাইভেসি পলিসি" },
        href: "/privacy-policy",
      },
      {
        label: { en: "Terms And Conditions", bn: "শর্তাবলী" },
        href: "/terms-and-conditions",
      },
    ],
  ];

  const socialLinks = [
    {
      key: "facebook",
      label: "Facebook",
      href: "https://facebook.com/",
      backgroundColor: "#1688f5",
    },
    {
      key: "telegram",
      label: "Telegram",
      href: "https://telegram.org/",
      backgroundColor: "#16a9e6",
    },
    {
      key: "pinterest",
      label: "Pinterest",
      href: "https://pinterest.com/",
      backgroundColor: "#f20a23",
    },
    {
      key: "instagram",
      label: "Instagram",
      href: "https://instagram.com/",
      backgroundColor: "#ff683b",
    },
    {
      key: "twitter",
      label: "X",
      href: "https://x.com/",
      backgroundColor: "#050505",
    },
  ];

  const renderSocialIcon = (socialKey) => {
    switch (socialKey) {
      case "facebook":
        return <Facebook size={19} fill="currentColor" strokeWidth={0} />;

      case "telegram":
        return <Send size={17} fill="currentColor" strokeWidth={1} />;

      case "pinterest":
        return (
          <span className="font-serif text-[20px] font-black italic leading-none">
            P
          </span>
        );

      case "instagram":
        return <Instagram size={19} strokeWidth={2.4} />;

      case "twitter":
        return <span className="text-[18px] font-medium leading-none">𝕏</span>;

      default:
        return null;
    }
  };

  return (
    <footer className="w-full border-t-[4px] border-[#285b98] bg-[#07385f] text-white">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-[50px] sm:px-8 xl:px-0">
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-[240px_178px_202px_235px_222px] lg:items-start lg:justify-between lg:gap-x-[48px]">
          {/* Logo and copyright */}
          <div className="min-w-0">
            <img
              src={footerLogo}
              alt="Bajiman"
              className="h-[27px] w-auto max-w-[185px] object-contain object-left"
              draggable={false}
            />

            <p className="mt-[14px] whitespace-nowrap text-[13px] font-normal leading-[20px] text-[#2e6d9e]">
              {isBangla
                ? `© ${currentYear} বাজিমান কপিরাইট`
                : `© ${currentYear} Bajiman Copyright`}
            </p>
          </div>

          {/* Footer link columns */}
          {footerColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-[17px]">
              {column.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="w-fit whitespace-nowrap text-[16px] font-normal leading-[23px] text-white transition-opacity duration-200 hover:opacity-70"
                >
                  {isBangla ? item.label.bn : item.label.en}
                </a>
              ))}
            </div>
          ))}

          {/* Community websites */}
          <div>
            <h3 className="whitespace-nowrap text-[16px] font-bold leading-[22px] text-white">
              {isBangla ? "কমিউনিটি ওয়েবসাইট" : "Community Websites"}
            </h3>

            <div className="mt-[13px] inline-flex h-[46px] items-center gap-[11px] rounded-[6px] bg-white px-[12px] shadow-sm">
              {socialLinks.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  aria-label={social.label}
                  className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-110"
                  style={{
                    backgroundColor: social.backgroundColor,
                  }}
                >
                  {renderSocialIcon(social.key)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GuideFooter;
