import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectFooterSetting } from "../../features/global/globalSelectors";
import ContactUsModal from "../ContactUsModal/ContactUsModal";

const API_URL = import.meta.env.VITE_API_URL;

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (
    String(path).startsWith("http://") ||
    String(path).startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}/${String(path).replace(/^\/+/, "")}`;
};

const getText = (obj, isBangla, fallback = "") => {
  if (!obj) return fallback;
  return isBangla ? obj.bn || obj.en || fallback : obj.en || obj.bn || fallback;
};

const openLink = (link = "") => {
  if (!link) return;

  if (link.startsWith("http://") || link.startsWith("https://")) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.href = link;
};

const getColor = (setting, key, fallback) => {
  return setting?.[key] || fallback;
};

const isContactLink = (item) => {
  const en = String(item?.title?.en || "").toLowerCase();
  const bn = String(item?.title?.bn || "");
  return en.includes("contact") || bn.includes("যোগাযোগ");
};

const Footer = ({ desktopOpen }) => {
  const { isBangla } = useLanguage();
  const footerSetting = useSelector(selectFooterSetting);
  const [open, setOpen] = useState(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);

  if (!footerSetting) return null;

  const paymentMethods = Array.isArray(footerSetting.paymentMethods)
    ? footerSetting.paymentMethods
    : [];

  const socials = Array.isArray(footerSetting.socials)
    ? footerSetting.socials
    : [];

  const sponsors = Array.isArray(footerSetting.sponsors)
    ? footerSetting.sponsors
    : [];

  const ambassadors = Array.isArray(footerSetting.ambassadors)
    ? footerSetting.ambassadors
    : [];

  const links = Array.isArray(footerSetting.links) ? footerSetting.links : [];

  const colors = {
    footerBg: getColor(footerSetting, "footerBg", "#ffffff"),
    footerText: getColor(footerSetting, "footerText", "#111111"),
    sectionTitleText: getColor(footerSetting, "sectionTitleText", "#111111"),
    dividerBg: getColor(footerSetting, "dividerBg", "#d6d6d6"),

    socialIconBg: getColor(footerSetting, "socialIconBg", "#0b66a8"),
    socialIconText: getColor(footerSetting, "socialIconText", "#ffffff"),

    linkBorder: getColor(footerSetting, "linkBorder", "#0b66a8"),
    linkText: getColor(footerSetting, "linkText", "#005daa"),

    descriptionTitleText: getColor(
      footerSetting,
      "descriptionTitleText",
      "#444444",
    ),
    descriptionText: getColor(footerSetting, "descriptionText", "#999999"),

    readMoreButtonBg: getColor(footerSetting, "readMoreButtonBg", "#006bb6"),
    readMoreButtonText: getColor(
      footerSetting,
      "readMoreButtonText",
      "#ffffff",
    ),

    qualityTitleText: getColor(footerSetting, "qualityTitleText", "#005daa"),
    copyrightTextColor: getColor(
      footerSetting,
      "copyrightTextColor",
      "#888888",
    ),

    itemTitleText: getColor(footerSetting, "itemTitleText", "#111111"),
    itemSubText: getColor(footerSetting, "itemSubText", "#111111"),
  };

  return (
    <footer
      className={`mb-14 w-full transition-all duration-300 ease-in-out md:mb-0 ${
        desktopOpen ? "lg:pl-[250px]" : ""
      }`}
      style={{
        backgroundColor: colors.footerBg,
        color: colors.footerText,
      }}
    >
      <div className="mx-auto w-full max-w-[480px] px-3 py-4 md:max-w-[1140px]">
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.length > 0 && (
            <div>
              <h3
                className="mb-2 text-[14px] font-medium"
                style={{ color: colors.sectionTitleText }}
              >
                {getText(
                  footerSetting.paymentTitle,
                  isBangla,
                  isBangla ? "পেমেন্ট মেথডস" : "Payment Methods",
                )}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {paymentMethods.map((item, index) => {
                  const img = item.imageUrl || makeImageUrl(item.image);
                  if (!img) return null;

                  return (
                    <img
                      key={item._id || index}
                      src={img}
                      alt={`payment-${index + 1}`}
                      className="h-[22px] object-contain"
                      draggable="false"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {socials.length > 0 && (
            <div>
              <h3
                className="mb-2 text-[14px] font-medium"
                style={{ color: colors.sectionTitleText }}
              >
                {getText(
                  footerSetting.socialTitle,
                  isBangla,
                  isBangla ? "সোশ্যাল নেটওয়ার্কস" : "Social Networks",
                )}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {socials.map((item, index) => (
                  <button
                    key={item._id || index}
                    type="button"
                    onClick={() => openLink(item.link)}
                    title={item.label || ""}
                    className="flex h-[23px] w-[23px] cursor-pointer items-center justify-center rounded-full text-[13px] font-bold"
                    style={{
                      backgroundColor: colors.socialIconBg,
                      color: colors.socialIconText,
                    }}
                  >
                    {item.iconText || "•"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {sponsors.length > 0 && (
            <div>
              <h3
                className="mb-2 text-[14px] font-medium"
                style={{ color: colors.sectionTitleText }}
              >
                {getText(
                  footerSetting.sponsorTitle,
                  isBangla,
                  isBangla ? "স্পন্সর" : "Sponsor",
                )}
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {sponsors.map((item, index) => {
                  const img = item.imageUrl || makeImageUrl(item.image);

                  return (
                    <div key={item._id || index} className="min-w-0">
                      {img && (
                        <img
                          src={img}
                          alt={getText(item.name, isBangla, "sponsor")}
                          className="mb-1 h-[34px] object-contain"
                          draggable="false"
                        />
                      )}

                      <h4
                        className="truncate text-[12px] font-bold leading-none"
                        style={{ color: colors.itemTitleText }}
                      >
                        {getText(item.name, isBangla)}
                      </h4>

                      <p
                        className="text-[11px] italic leading-none"
                        style={{ color: colors.itemSubText }}
                      >
                        {getText(item.sub, isBangla)}
                      </p>

                      <p
                        className="text-[11px] italic leading-none"
                        style={{ color: colors.itemSubText }}
                      >
                        {item.year}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(footerSetting.officialPartnerImage ||
            footerSetting.officialPartnerImageUrl) && (
            <div>
              <h3
                className="mb-2 text-[14px] font-medium"
                style={{ color: colors.sectionTitleText }}
              >
                {getText(
                  footerSetting.officialPartnerTitle,
                  isBangla,
                  isBangla ? "অফিশিয়াল পার্টনার" : "Official Partner",
                )}
              </h3>

              <button
                type="button"
                onClick={() => openLink(footerSetting.officialPartnerLink)}
                className="flex cursor-pointer items-center gap-2"
              >
                <img
                  src={
                    footerSetting.officialPartnerImageUrl ||
                    makeImageUrl(footerSetting.officialPartnerImage)
                  }
                  alt="partner"
                  className="h-[40px] object-contain"
                  draggable="false"
                />
              </button>
            </div>
          )}
        </div>

        {ambassadors.length > 0 && (
          <div className="mt-5">
            <h3
              className="mb-2 text-[14px] font-medium"
              style={{ color: colors.sectionTitleText }}
            >
              {getText(
                footerSetting.ambassadorTitle,
                isBangla,
                isBangla ? "ব্র্যান্ড অ্যাম্বাসেডর" : "Brand Ambassador",
              )}
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {ambassadors.map((item, index) => {
                const img = item.imageUrl || makeImageUrl(item.image);

                return (
                  <div key={item._id || index} className="min-w-0">
                    {img && (
                      <img
                        src={img}
                        alt={getText(item.name, isBangla, "ambassador")}
                        className="mb-1 h-[34px] object-contain"
                        draggable="false"
                      />
                    )}

                    <h4
                      className="truncate text-[12px] font-bold leading-none"
                      style={{ color: colors.itemTitleText }}
                    >
                      {getText(item.name, isBangla)}
                    </h4>

                    <p
                      className="text-[11px] italic leading-none"
                      style={{ color: colors.itemSubText }}
                    >
                      {getText(item.sub, isBangla)}
                    </p>

                    <p
                      className="text-[11px] italic leading-none"
                      style={{ color: colors.itemSubText }}
                    >
                      {item.year}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {links.length > 0 && (
          <>
            <div
              className="my-5 h-px w-full"
              style={{ backgroundColor: colors.dividerBg }}
            />

            <div className="flex flex-wrap gap-y-2">
              {links.map((item, index) => (
                <button
                  key={item._id || index}
                  type="button"
                  onClick={() =>
                    isContactLink(item)
                      ? setContactUsOpen(true)
                      : openLink(item.link)
                  }
                  className="cursor-pointer border-l-2 px-3 text-[13px]"
                  style={{
                    borderColor: colors.linkBorder,
                    color: colors.linkText,
                  }}
                >
                  {getText(item.title, isBangla)}
                </button>
              ))}
            </div>
          </>
        )}

        {(footerSetting.descriptionTitle || footerSetting.description) && (
          <>
            <div
              className="my-5 h-px w-full"
              style={{ backgroundColor: colors.dividerBg }}
            />

            <div>
              <h2
                className="mb-3 text-[18px] font-bold"
                style={{ color: colors.descriptionTitleText }}
              >
                {getText(footerSetting.descriptionTitle, isBangla)}
              </h2>

              <p
                className={`text-[14px] leading-[20px] ${
                  open ? "" : "line-clamp-2"
                }`}
                style={{ color: colors.descriptionText }}
              >
                {getText(footerSetting.description, isBangla)}
              </p>

              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="mt-5 cursor-pointer rounded-[3px] px-4 py-2 text-[13px] font-medium"
                style={{
                  backgroundColor: colors.readMoreButtonBg,
                  color: colors.readMoreButtonText,
                }}
              >
                {open
                  ? getText(
                      footerSetting.showLessText,
                      isBangla,
                      isBangla ? "কম দেখুন" : "Show Less",
                    )
                  : getText(
                      footerSetting.readMoreText,
                      isBangla,
                      isBangla ? "আরও পড়ুন" : "Read More",
                    )}{" "}
                ⌄
              </button>
            </div>
          </>
        )}

        <div
          className="my-5 h-px w-full"
          style={{ backgroundColor: colors.dividerBg }}
        />

        <div className="flex items-center gap-4 pb-1">
          {(footerSetting.footerLogo || footerSetting.footerLogoUrl) && (
            <img
              src={
                footerSetting.footerLogoUrl ||
                makeImageUrl(footerSetting.footerLogo)
              }
              alt="logo"
              className="h-[26px] object-contain"
              draggable="false"
            />
          )}

          <div>
            <h4
              className="text-[13px] font-bold"
              style={{ color: colors.qualityTitleText }}
            >
              {getText(
                footerSetting.footerQualityTitle,
                isBangla,
                isBangla ? "সেরা মানের প্ল্যাটফর্ম" : "Best Quality Platform",
              )}
            </h4>

            <p
              className="text-[12px]"
              style={{ color: colors.copyrightTextColor }}
            >
              {footerSetting.copyrightText}
            </p>
          </div>
        </div>
      </div>

      <ContactUsModal
        open={contactUsOpen}
        onClose={() => setContactUsOpen(false)}
      />
    </footer>
  );
};

export default Footer;
