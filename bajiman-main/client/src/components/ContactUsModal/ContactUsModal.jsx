import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectSocialLinks } from "../../features/global/globalSelectors";
import headerImage from "../../assets/contact/community_header.webp";
import agentImage from "../../assets/contact/community_agent.webp";

const ContactUsModal = ({ open, onClose }) => {
  const { isBangla } = useLanguage();
  const socialLinks = useSelector(selectSocialLinks);

  const items = Array.isArray(socialLinks)
    ? socialLinks.filter((item) => item?.url && item?.iconUrl)
    : [];

  const t = {
    title: isBangla ? "যোগাযোগ করুন" : "Contact Us",
    subtitle: isBangla ? "মেম্বার সাপোর্ট মেথড" : "Member Support Method",
  };

  const itemLabel = (item) =>
    isBangla
      ? item?.name?.bn || item?.name?.en
      : item?.name?.en || item?.name?.bn;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[3px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[14px] shadow-2xl"
            style={{ backgroundColor: "#1a0e0e" }}
          >
            <div
              className="relative h-[150px] overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: `url(${headerImage})` }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, #1a0e0e 0%, rgba(26,14,14,0.15) 55%, rgba(255,255,255,0.12) 100%)",
                }}
              />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:scale-105 hover:bg-red-700"
              >
                <X size={18} />
              </button>

              <div className="absolute left-4 top-4 max-w-[62%]">
                <h2 className="text-[20px] font-extrabold text-white">
                  {t.title}
                </h2>
                <p className="mt-1 text-[13px] font-medium text-white/80">
                  {t.subtitle}
                </p>
              </div>

              <img
                src={agentImage}
                alt=""
                className="absolute -right-1 bottom-0 h-[150px] w-auto object-contain"
              />
            </div>

            <div className="flex items-center px-4 pt-3">
              <span className="border-b-2 border-red-500 pb-2 text-[14px] font-bold text-white">
                {t.title}
              </span>
            </div>

            {items.length > 0 && (
              <div className="grid grid-cols-3 gap-3 p-4">
                {items.map((item) => (
                  <a
                    key={item._id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex cursor-pointer flex-col items-center justify-start gap-2 rounded-[10px] bg-red-500/10 p-3 text-center transition hover:bg-red-500/20"
                  >
                    <img
                      src={item.iconUrl}
                      alt={itemLabel(item)}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                    <span className="text-[12px] font-bold leading-tight text-white">
                      {itemLabel(item)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ContactUsModal;
