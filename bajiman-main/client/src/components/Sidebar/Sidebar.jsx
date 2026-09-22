import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  Home,
  Flame,
  Trophy,
  Gift,
  Users,
  Handshake,
  Award,
  Building2,
  Ticket,
  Dice5,
  Rocket,
  CircleDot,
  Gamepad2,
  Fish,
  Crown,
  Percent,
  ShieldCheck,
  MessageCircle,
  Download,
} from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import PromotionModal from "./../PromotionModal/PromotionModal";
import ReferAndRedeemModal from "../ReferAndRedeemModal/ReferAndRedeemModal";
import LoginModal from "../LoginModal/LoginModal";
import ContactUsModal from "../ContactUsModal/ContactUsModal";
import { selectIsAuth } from "../../features/auth/authSelectors";

import {
  selectGameCategories,
  selectProvidersByCategory,
  selectSports,
  selectHotGames,
} from "../../features/globalGame/globalGameSelectors";

import {
  selectSidebarColorSetting,
  selectSocialLinks,
} from "../../features/global/globalSelectors";

const AFFILIATE_URL = import.meta.env.VITE_AFFILIATE_URL || "/";
const BRAND_URL = import.meta.env.VITE_BRAND_URL || "/";
const GUIDE_URL = import.meta.env.VITE_GUIDE_URL || "/";

const defaultColors = {
  desktopBg: "#0b66a8",
  desktopToggleBg: "#075893",
  desktopToggleText: "#ffffff",
  desktopToggleHoverBg: "#1979c9",

  desktopItemHoverBg: "#1979c9",
  desktopItemActiveBg: "#37a2ff",
  desktopItemActiveBorder: "#ffffff",

  desktopIconBg: "#075893",
  desktopIconText: "#ffffff",
  desktopActiveIconBg: "#005fff",
  desktopActiveIconText: "#ffffff",

  desktopExpandedText: "#ffffff",
  desktopExpandedIconBg: "#075893",
  desktopExpandedActiveBg: "#37a2ff",

  desktopChildBg: "#f4f4f4",
  desktopChildText: "#111111",
  desktopChildHoverBg: "#ffffff",
  desktopChildBorder: "#d8d8d8",

  mobileBg: "#ffffff",
  mobileText: "#111111",
  mobileItemHoverBg: "#f7f7f7",
  mobileItemActiveBg: "#e8f4ff",
  mobileItemActiveText: "#0b66a8",
  mobileIconText: "#0b66a8",

  mobileSectionText: "#111111",
  mobileSectionBorder: "#d9e6f2",

  mobilePanelBg: "#f5f5f5",
  mobilePanelBorder: "#d9d9d9",
  mobilePanelText: "#222222",
  mobilePanelHoverBg: "#ffffff",

  overlayBg: "rgba(0,0,0,0.60)",
};

const Sidebar = ({ open, setOpen, desktopOpen, setDesktopOpen }) => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const dbCategories = useSelector(selectGameCategories);
  const providersByCategory = useSelector(selectProvidersByCategory);
  const sports = useSelector(selectSports);
  const hotGames = useSelector(selectHotGames);
  const sidebarColorSetting = useSelector(selectSidebarColorSetting);
  const isAuth = useSelector(selectIsAuth);
  const socialLinks = useSelector(selectSocialLinks);

  const colors = {
    ...defaultColors,
    ...(sidebarColorSetting || {}),
  };

  const [activeKey, setActiveKey] = useState("home");
  const [desktopExpandedKey, setDesktopExpandedKey] = useState("");
  const [mobilePanel, setMobilePanel] = useState(null);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [referRedeemOpen, setReferRedeemOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);

  const [desktopHoverKey, setDesktopHoverKey] = useState("");
  const [desktopChildHover, setDesktopChildHover] = useState("");
  const [mobileHoverKey, setMobileHoverKey] = useState("");
  const [mobileChildHover, setMobileChildHover] = useState("");

  const topMenus = useMemo(
    () => [
      { key: "home", bn: "হোম", en: "Home", icon: Home, path: "/" },
      {
        key: "promotion",
        bn: "প্রমোশন",
        en: "Promotion",
        icon: Gift,
        path: "__promotion__",
      },
      {
        key: "referral",
        bn: "রেফারেল",
        en: "Referral",
        icon: Users,
        path: "__referral__",
      },
      {
        key: "sponsor",
        bn: "স্পনসরশিপ",
        en: "Sponsorship",
        icon: Handshake,
        path: "__brand__",
      },
      {
        key: "affiliate",
        bn: "অ্যাফিলিয়েট",
        en: "Affiliate",
        icon: Percent,
        path: "__affiliate__",
      },
      {
        key: "leaderboard",
        bn: "লিডারবোর্ড",
        en: "Leaderboard",
        icon: Building2,
        path: "/",
      },
      {
        key: "guide",
        bn: "বাজিম্যান গাইড",
        en: "Bajiman Guide",
        icon: ShieldCheck,
        path: "__guide__",
      },
      {
        key: "winner",
        bn: "বিজয়ীদের তালিকা",
        en: "Winner List",
        icon: Award,
        path: "/",
      },
      {
        key: "app-download",
        bn: "অ্যাপ ডাউনলোড",
        en: "App Download",
        icon: Download,
        path: "https://apps.bajiman.com/",
      },
    ],
    [],
  );

  const categoryIcon = (name = "") => {
    const n = String(name).toLowerCase();

    if (n.includes("casino")) return Ticket;
    if (n.includes("slot")) return Dice5;
    if (n.includes("crash")) return Rocket;
    if (n.includes("table")) return CircleDot;
    if (n.includes("fish")) return Fish;
    if (n.includes("arcade")) return Gamepad2;
    if (n.includes("lottery")) return CircleDot;

    return Gamepad2;
  };

  const gameMenus = useMemo(() => {
    const hotChildren = Array.isArray(hotGames)
      ? hotGames.map((item) => {
          const game = item?.game || null;

          const gameId =
            game?.gameId || item?.gameId || item?._id || item?.id || "";
          const gameUId =
            game?.gameUId || item?.gameUId || item?.gameId || gameId || "";

          const title = item?.gameTitle || game?.gameTitle;
          const localizedTitle =
            typeof title === "string"
              ? title
              : isBangla
                ? title?.bn || title?.en
                : title?.en || title?.bn;

          const gameName =
            localizedTitle ||
            game?.oracleGame?.name ||
            game?.name ||
            game?.gameName ||
            game?.gameUId ||
            item?.name ||
            item?.gameUId ||
            item?.gameId ||
            "Game";

          const image =
            item?.imageUrl ||
            game?.imageUrl ||
            game?.customImageUrl ||
            game?.oracleImageUrl ||
            game?.oracleGame?.thumbnail ||
            game?.oracleGame?.original ||
            "";

          return {
            id: item?._id || item?.id || gameId,
            name: gameName,
            image,
            path: `/play-game/${gameId}?uid=${gameUId}`,
          };
        })
      : [];

    const sportsChildren = Array.isArray(sports)
      ? sports.map((item) => ({
          id: item?._id || item?.id,
          name: item?.name || { bn: "", en: "" },
          image: item?.iconImageUrl || "",
          path: `/play-game/${item?.gameId}?uid=${item?.gameId}`,
        }))
      : [];

    const dynamicCategories = Array.isArray(dbCategories)
      ? dbCategories.map((category) => {
          const categoryId = category?._id || category?.id;
          const categoryNameEn =
            category?.categoryName?.en || category?.categoryTitle?.en || "";
          const categoryNameBn =
            category?.categoryName?.bn || category?.categoryTitle?.bn || "";

          const providers = providersByCategory?.[categoryId] || [];

          return {
            key: categoryId,
            bn: categoryNameBn,
            en: categoryNameEn,
            icon: categoryIcon(categoryNameEn),
            children: providers.map((provider) => ({
              id: provider?._id || provider?.id,
              name: provider?.providerName || provider?.providerCode || "",
              image: provider?.providerIconUrl || "",
              path: `/games?categoryId=${categoryId}&providerDbId=${
                provider?._id || provider?.id
              }`,
            })),
          };
        })
      : [];

    return [
      {
        key: "hot",
        bn: "হট গেম",
        en: "Hot Game",
        icon: Flame,
        children: hotChildren,
      },
      {
        key: "sports",
        bn: "স্পোর্ট",
        en: "Sports",
        icon: Trophy,
        children: sportsChildren,
      },
      ...dynamicCategories,
    ];
  }, [dbCategories, providersByCategory, sports, hotGames, isBangla]);

  const otherMenus = useMemo(
    () => [{ key: "vip", bn: "ভিআইপি", en: "VIP", icon: Crown, path: "/" }],
    [],
  );

  const contactMenu = useMemo(() => {
    const items = Array.isArray(socialLinks)
      ? socialLinks.filter((item) => item?.url && item?.iconUrl)
      : [];

    if (!items.length) return null;

    return {
      key: "contact",
      bn: "যোগাযোগ করুন",
      en: "Contact Us",
      icon: MessageCircle,
      path: "__contactUs__",
    };
  }, [socialLinks]);

  const label = (item) => (isBangla ? item.bn : item.en);

  const childLabel = (child) => {
    if (typeof child.name === "string") return child.name;
    return isBangla
      ? child?.name?.bn || child?.name?.en
      : child?.name?.en || child?.name?.bn;
  };

  const closeMobile = () => {
    setOpen(false);
    setMobilePanel(null);
  };

  const goPath = (path = "/") => {
    if (path === "__promotion__") {
      closeMobile();
      setPromotionOpen(true);
      return;
    }

    if (path === "__referral__") {
      closeMobile();
      if (!isAuth) {
        setLoginOpen(true);
        return;
      }
      setReferRedeemOpen(true);
      return;
    }

    if (path === "__affiliate__") {
      window.open(AFFILIATE_URL, "_blank", "noopener,noreferrer");
      return;
    }

    if (path === "__brand__") {
      window.open(BRAND_URL, "_blank", "noopener,noreferrer");
      return;
    }

    if (path === "__guide__") {
      window.open(GUIDE_URL, "_blank", "noopener,noreferrer");
      return;
    }

    if (path === "__contactUs__") {
      closeMobile();
      setContactUsOpen(true);
      return;
    }

    if (/^https?:\/\//i.test(path)) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(path || "/");
  };

  const handleItem = (item, mode) => {
    setActiveKey(item.key);

    if (item.children?.length) {
      if (mode === "desktop") {
        if (!desktopOpen) {
          setDesktopOpen(true);
          setDesktopExpandedKey(item.key);
          return;
        }

        setDesktopExpandedKey((prev) => (prev === item.key ? "" : item.key));
      } else {
        setMobilePanel(item);
      }
      return;
    }

    closeMobile();
    goPath(item.path || "/");
  };

  const allDesktopMenus = [
    topMenus.find((item) => item.key === "home"),
    gameMenus.find((item) => item.key === "hot"),
    ...gameMenus.filter((item) => item.key !== "hot"),
    ...topMenus.filter(
      (item) => item.key !== "home" && item.key !== "promotion",
    ),
    contactMenu,
    topMenus.find((item) => item.key === "promotion"),
    ...otherMenus,
  ].filter(Boolean);

  const mobileTopMenus = topMenus.filter((item) =>
    ["home", "promotion", "referral", "affiliate"].includes(item.key),
  );

  const mobileOtherMenus = [
    topMenus.find((item) => item.key === "sponsor"),
    topMenus.find((item) => item.key === "leaderboard"),
    topMenus.find((item) => item.key === "guide"),
    contactMenu,
    topMenus.find((item) => item.key === "winner"),
    topMenus.find((item) => item.key === "app-download"),
    ...otherMenus,
  ].filter(Boolean);

  return (
    <>
      <PromotionModal
        open={promotionOpen}
        onClose={() => setPromotionOpen(false)}
      />

      <ReferAndRedeemModal
        open={referRedeemOpen}
        onClose={() => setReferRedeemOpen(false)}
      />

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <ContactUsModal
        open={contactUsOpen}
        onClose={() => setContactUsOpen(false)}
      />

      <div
        onClick={closeMobile}
        className={`fixed inset-0 z-40 transition-all duration-300 ease-in-out lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ background: colors.overlayBg }}
      />

      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen shadow-xl transition-all duration-300 ease-in-out lg:block ${
          desktopOpen ? "w-[250px]" : "w-[57px]"
        }`}
        style={{ backgroundColor: colors.desktopBg }}
      >
        {desktopOpen && (
          <button
            type="button"
            onClick={() => setDesktopOpen(false)}
            className="absolute -right-[18px] top-3 z-50 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-lg transition hover:scale-105"
            style={{
              backgroundColor: colors.desktopToggleBg,
              color: colors.desktopToggleText,
            }}
          >
            <ChevronLeft size={23} />
          </button>
        )}

        {!desktopOpen && (
          <button
            type="button"
            onClick={() => setDesktopOpen(true)}
            onMouseEnter={() => setDesktopHoverKey("__toggle__")}
            onMouseLeave={() => setDesktopHoverKey("")}
            className="flex h-[52px] w-full cursor-pointer items-center justify-center transition"
            style={{
              backgroundColor:
                desktopHoverKey === "__toggle__"
                  ? colors.desktopToggleHoverBg
                  : "transparent",
            }}
          >
            <span
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full shadow"
              style={{
                backgroundColor: colors.desktopToggleBg,
                color: colors.desktopToggleText,
              }}
            >
              <ChevronRight size={22} />
            </span>
          </button>
        )}

        <div className="h-full overflow-y-auto overflow-x-hidden sidebar-scroll">
          {allDesktopMenus.map((item) => {
            const Icon = item.icon;
            const expanded = desktopExpandedKey === item.key;
            const active = activeKey === item.key;
            const hovered = desktopHoverKey === item.key;

            if (!desktopOpen) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleItem(item, "desktop")}
                  onMouseEnter={() => setDesktopHoverKey(item.key)}
                  onMouseLeave={() => setDesktopHoverKey("")}
                  className="flex h-[52px] w-full cursor-pointer items-center justify-center transition-all duration-200 ease-in-out"
                  style={{
                    backgroundColor: active
                      ? colors.desktopItemActiveBg
                      : hovered
                        ? colors.desktopItemHoverBg
                        : "transparent",
                    boxShadow: active
                      ? `inset 4px 0 0 0 ${colors.desktopItemActiveBorder}`
                      : "none",
                  }}
                >
                  <span
                    className="flex h-[32px] w-[32px] items-center justify-center rounded-full transition"
                    style={{
                      backgroundColor: active
                        ? colors.desktopActiveIconBg
                        : colors.desktopIconBg,
                      color: active
                        ? colors.desktopActiveIconText
                        : colors.desktopIconText,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                </button>
              );
            }

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => handleItem(item, "desktop")}
                  onMouseEnter={() => setDesktopHoverKey(item.key)}
                  onMouseLeave={() => setDesktopHoverKey("")}
                  className="flex h-[52px] w-full cursor-pointer items-center gap-3 px-4 text-left transition-all duration-200"
                  style={{
                    backgroundColor: active
                      ? colors.desktopExpandedActiveBg
                      : hovered
                        ? colors.desktopItemHoverBg
                        : "transparent",
                    color: colors.desktopExpandedText,
                    boxShadow: active
                      ? `inset 4px 0 0 0 ${colors.desktopItemActiveBorder}`
                      : "none",
                  }}
                >
                  <span
                    className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: active
                        ? colors.desktopActiveIconBg
                        : colors.desktopExpandedIconBg,
                      color: active
                        ? colors.desktopActiveIconText
                        : colors.desktopIconText,
                    }}
                  >
                    <Icon size={19} />
                  </span>

                  <span className="flex-1 text-[15px] font-semibold">
                    {label(item)}
                  </span>

                  {item.children?.length > 0 && (
                    <ChevronRight
                      size={17}
                      className={`transition ${expanded ? "rotate-90" : ""}`}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {item.children && expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                      style={{ backgroundColor: colors.desktopChildBg }}
                    >
                      {item.children.map((child, index) => {
                        const childKey = child.id || index;
                        const childHovered = desktopChildHover === childKey;

                        return (
                          <button
                            key={childKey}
                            type="button"
                            onClick={() => {
                              setActiveKey(item.key);
                              goPath(child.path);
                            }}
                            onMouseEnter={() => setDesktopChildHover(childKey)}
                            onMouseLeave={() => setDesktopChildHover("")}
                            className="flex h-[46px] w-full cursor-pointer items-center gap-3 border-b px-9 text-left transition"
                            style={{
                              backgroundColor: childHovered
                                ? colors.desktopChildHoverBg
                                : "transparent",
                              borderColor: colors.desktopChildBorder,
                              color: colors.desktopChildText,
                            }}
                          >
                            {child.image ? (
                              <img
                                src={child.image}
                                alt={childLabel(child)}
                                className="h-6 w-6 shrink-0 object-contain"
                              />
                            ) : (
                              <span className="text-xl">{child.icon}</span>
                            )}

                            <span className="text-[14px] font-medium">
                              {childLabel(child)}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </aside>

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[194px] transform shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: colors.mobileBg,
          color: colors.mobileText,
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden pb-5 pt-3 sidebar-scroll">
          <MenuGroup
            items={mobileTopMenus}
            label={label}
            activeKey={activeKey}
            onItem={(item) => handleItem(item, "mobile")}
            colors={colors}
            hoverKey={mobileHoverKey}
            setHoverKey={setMobileHoverKey}
          />

          <SectionTitle title="Games" colors={colors} />

          <MenuGroup
            items={gameMenus}
            label={label}
            activeKey={activeKey}
            onItem={(item) => handleItem(item, "mobile")}
            colors={colors}
            hoverKey={mobileHoverKey}
            setHoverKey={setMobileHoverKey}
          />

          <SectionTitle title="Others" colors={colors} />

          <MenuGroup
            items={mobileOtherMenus}
            label={label}
            activeKey={activeKey}
            onItem={(item) => handleItem(item, "mobile")}
            colors={colors}
            hoverKey={mobileHoverKey}
            setHoverKey={setMobileHoverKey}
          />
        </div>
      </aside>

      <AnimatePresence>
        {open && mobilePanel?.children?.length > 0 && (
          <motion.aside
            initial={{ x: 194, opacity: 0 }}
            animate={{ x: 194, opacity: 1 }}
            exit={{ x: 194, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-[51] h-screen w-[108px] border-l shadow-xl lg:hidden"
            style={{
              backgroundColor: colors.mobilePanelBg,
              borderColor: colors.mobilePanelBorder,
            }}
          >
            <div className="h-full overflow-y-auto sidebar-scroll">
              {mobilePanel.children.map((child, index) => {
                const childKey = child.id || index;
                const hovered = mobileChildHover === childKey;

                return (
                  <button
                    key={childKey}
                    type="button"
                    onClick={() => {
                      closeMobile();
                      goPath(child.path);
                    }}
                    onMouseEnter={() => setMobileChildHover(childKey)}
                    onMouseLeave={() => setMobileChildHover("")}
                    className="flex h-[100px] w-full cursor-pointer flex-col items-center justify-center border-b text-center transition"
                    style={{
                      backgroundColor: hovered
                        ? colors.mobilePanelHoverBg
                        : "transparent",
                      borderColor: colors.mobilePanelBorder,
                      color: colors.mobilePanelText,
                    }}
                  >
                    {child.image ? (
                      <img
                        src={child.image}
                        alt={childLabel(child)}
                        className="h-[44px] w-[44px] object-contain"
                      />
                    ) : (
                      <span className="text-[32px] leading-none">
                        {child.icon}
                      </span>
                    )}

                    <span className="mt-2 text-[14px] font-medium uppercase">
                      {childLabel(child)}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuGroup = ({
  items,
  label,
  activeKey,
  onItem,
  colors,
  hoverKey,
  setHoverKey,
}) => (
  <>
    {items.map((item) => (
      <ColoredMobileItem
        key={item.key}
        item={item}
        label={label(item)}
        active={activeKey === item.key}
        onClick={() => onItem(item)}
        colors={colors}
        hovered={hoverKey === item.key}
        onMouseEnter={() => setHoverKey(item.key)}
        onMouseLeave={() => setHoverKey("")}
      />
    ))}
  </>
);

const ColoredMobileItem = ({
  item,
  label,
  active,
  onClick,
  colors,
  hovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flex min-h-[42px] w-full cursor-pointer items-center gap-3 px-4 text-left text-[15px] font-semibold transition"
      style={{
        backgroundColor: active
          ? colors.mobileItemActiveBg
          : hovered
            ? colors.mobileItemHoverBg
            : "transparent",
        color: active ? colors.mobileItemActiveText : colors.mobileText,
      }}
    >
      <span
        className="flex h-[24px] w-[24px] shrink-0 items-center justify-center"
        style={{
          color: active ? colors.mobileItemActiveText : colors.mobileIconText,
        }}
      >
        <Icon size={19} />
      </span>

      <span className="flex-1">{label}</span>

      {item.children?.length > 0 && <ChevronRight size={16} />}
    </button>
  );
};

const SectionTitle = ({ title, colors }) => (
  <div
    className="mx-3 my-3 border-t pt-4 text-[15px] font-bold"
    style={{
      color: colors.mobileSectionText,
      borderColor: colors.mobileSectionBorder,
    }}
  >
    {title}
  </div>
);

export default Sidebar;
