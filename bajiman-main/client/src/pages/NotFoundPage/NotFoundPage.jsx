import React from "react";
import { Link } from "react-router";
import { Home, SearchX, ArrowLeft } from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const NotFoundPage = () => {
  const { isBangla } = useLanguage();

  const t = {
    badge: isBangla ? "পৃষ্ঠা পাওয়া যায়নি" : "Page Not Found",
    title: isBangla ? "404" : "404",
    heading: isBangla
      ? "দুঃখিত! এই পেজটি খুঁজে পাওয়া যায়নি"
      : "Oops! This page could not be found",
    text: isBangla
      ? "আপনি যে পেজটি খুঁজছেন সেটি মুছে ফেলা হয়েছে, লিংকটি ভুল হতে পারে অথবা পেজটি আর উপলভ্য নেই।"
      : "The page you are looking for may have been removed, the link may be incorrect, or the page is no longer available.",
    backHome: isBangla ? "হোমে ফিরে যান" : "Back to Home",
    goBack: isBangla ? "আগের পেজে যান" : "Go Back",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#064b83] via-[#0865a9] to-[#031d35] px-4 py-20 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[900px] items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[22px] border border-white/15 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md sm:p-10">
          <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#2e9bf3]/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[#5ed51d]/20 blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg">
              <SearchX size={42} />
            </div>

            <div className="mx-auto mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/90">
              {t.badge}
            </div>

            <h1 className="mt-4 text-[72px] font-black leading-none text-white sm:text-[110px]">
              {t.title}
            </h1>

            <h2 className="mt-3 text-[24px] font-bold text-white sm:text-[32px]">
              {t.heading}
            </h2>

            <p className="mx-auto mt-3 max-w-[620px] text-[14px] leading-7 text-white/75 sm:text-[16px]">
              {t.text}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[6px] bg-[#5ed51d] px-6 text-[14px] font-bold text-white shadow-lg transition hover:bg-[#52c719]"
              >
                <Home size={18} />
                {t.backHome}
              </Link>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-white/20 bg-white/10 px-6 text-[14px] font-bold text-white transition hover:bg-white/15"
              >
                <ArrowLeft size={18} />
                {t.goBack}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
