import React from "react";
import { useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectAffiliateSocialLinks } from "../../features/global/globalSelectors";

const SocialLink = () => {
  const location = useLocation();
  const affiliateSocialLinks = useSelector(selectAffiliateSocialLinks);

  const isHome = location.pathname === "/";

  if (!isHome) return null;

  const items = Array.isArray(affiliateSocialLinks)
    ? affiliateSocialLinks.filter((item) => item?.url && item?.iconUrl)
    : [];

  if (!items.length) return null;

  return (
    <div className="fixed bottom-32 right-4 z-[999] flex flex-col gap-3 md:right-12">
      {items.map((item) => (
        <a
          key={item._id}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full"
        >
          <img
            src={item.iconUrl}
            alt="affiliate-social-icon"
            className="h-12 w-12 object-contain transition duration-300 group-hover:scale-110"
          />
        </a>
      ))}
    </div>
  );
};

export default SocialLink;
