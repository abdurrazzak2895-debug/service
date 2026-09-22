import React from "react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

const FloatingSocial = () => {
  // ✅ Replace with your real links
  const whatsappNumber = "8801XXXXXXXXX"; // without + (example: 8801712345678)
  const whatsappText = "Hello BABU88 Support"; // optional
  const telegramUsername = "your_telegram_username"; // example: babu88support

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappText,
  )}`;
  const telegramLink = `https://t.me/${telegramUsername}`;

  return (
    <div className="fixed right-4 md:right-18 bottom-8 md:bottom-22 z-[999] flex flex-col gap-3">
      {/* WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] shadow-lg hover:scale-105 active:scale-95 transition"
      >
        <FaWhatsapp className="text-white text-2xl sm:text-3xl" />
        <span className="sr-only">WhatsApp</span>
      </a>

      {/* Telegram */}
      <a
        href={telegramLink}
        target="_blank"
        rel="noreferrer"
        aria-label="Telegram"
        className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#229ED9] shadow-lg hover:scale-105 active:scale-95 transition"
      >
        <FaTelegramPlane className="text-white text-2xl sm:text-3xl" />
        <span className="sr-only">Telegram</span>
      </a>
    </div>
  );
};

export default FloatingSocial;
