import React from "react";
import { Link } from "react-router";

import { useLanguage } from "../../Context/LanguageProvider";

const NotFoundPage = () => {
  const { isBangla } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[64px] font-extrabold text-[#0b66a8]">404</h1>
      <p className="mt-2 text-[16px] text-[#43505e]">
        {isBangla
          ? "দুঃখিত, পেজটি খুঁজে পাওয়া যায়নি।"
          : "Sorry, that page could not be found."}
      </p>

      <Link
        to="/"
        className="mt-6 rounded-[6px] bg-[#0b66a8] px-6 py-3 text-[14px] font-bold text-white transition hover:opacity-90"
      >
        {isBangla ? "হোমে ফিরে যান" : "Back to Home"}
      </Link>
    </div>
  );
};

export default NotFoundPage;
