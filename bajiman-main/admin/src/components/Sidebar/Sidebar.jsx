import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaBell,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCircle,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaGamepad,
  FaWallet,
  FaMoneyBillWave,
  FaPlusCircle,
  FaClipboardList,
  FaHistory,
  FaLayerGroup,
  FaServer,
  FaPalette,
  FaSlidersH,
  FaGlobe,
  FaHandshake,
  FaUserFriends,
  FaUserShield,
  FaReceipt,
  FaHotjar,
  FaGift,
  FaLink,
  FaDownload,
  FaKey,
} from "react-icons/fa";
import { FaShareAlt } from "react-icons/fa";
import {
  IoCashOutline,
  IoChatbubbleEllipsesOutline,
  IoClipboardOutline,
  IoCreateOutline,
  IoDiamondOutline,
  IoImagesOutline,
  IoInformationCircleOutline,
  IoLogInOutline,
  IoMenuOutline,
  IoPeopleOutline,
  IoPlayCircleOutline,
  IoRibbonOutline,
} from "react-icons/io5";
import { MdOutlineLogin, MdPassword } from "react-icons/md";
import { IoFootstepsOutline } from "react-icons/io5";
import { IoColorPaletteOutline } from "react-icons/io5";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { BiCategoryAlt } from "react-icons/bi";
import { MdOutlineAppRegistration } from "react-icons/md";
import {
  MdCategory,
  MdFavorite,
  MdGames,
  MdOutlineAccountBalanceWallet,
} from "react-icons/md";
import { FaNotesMedical } from "react-icons/fa6";
import { GrUserAdmin } from "react-icons/gr";
import { GrAnnounce } from "react-icons/gr";
import { RxHamburgerMenu } from "react-icons/rx";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { selectAdmin } from "../../features/auth/authSelectors";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const admin = useSelector(selectAdmin);

  const [open, setOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const adminRole = admin?.role === "mother" ? "mother" : "sub";
  const permissions = Array.isArray(admin?.permissions)
    ? admin.permissions
    : [];
  const isMother = adminRole === "mother";

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const canAccess = (key) => {
    if (isMother) return true;
    return permissions.includes(key);
  };

  const menuItems = useMemo(
    () => [
      {
        key: "dashboard",
        to: "/",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        key: "__mother__",
        to: "/create-admin",
        icon: <GrUserAdmin />,
        text: "Create Admin",
      },
      {
        key: "add-promotion",
        to: "/add-promotion",
        icon: <GrAnnounce />,
        text: "Add Promotion",
      },
    ],
    [],
  );

  const userItems = useMemo(
    () => [
      {
        key: "all-users",
        to: "/all-users",
        icon: <FaUsers />,
        text: "Users",
      },
      {
        key: "affiliates",
        to: "/all-affiliate-users",
        icon: <FaUserFriends />,
        text: "Affiliates",
      },
      {
        key: "bulk-adjustment",
        to: "/bulk-adjustment",
        icon: <FaUserFriends />,
        text: "Bulk Adjustment",
      },
      {
        key: "user-refer-redeem",
        to: "/user-refer-redeem",
        icon: <FaGift />,
        text: "Refer & Redeem",
      },
    ],
    [],
  );

  const depositItems = useMemo(
    () => [
      {
        key: "add-deposit-method",
        to: "/add-deposit-method",
        icon: <FaPlusCircle />,
        text: "Add Deposit Method",
      },
      {
        key: "add-deposit-field",
        to: "/add-deposit-field",
        icon: <FaClipboardList />,
        text: "Deposit Field",
      },
      {
        key: "add-deposit-bonus-turnover",
        to: "/add-deposit-bonus-turnover",
        icon: <FaLayerGroup />,
        text: "Bonus & Turnover",
      },
      {
        key: "otp-setting",
        to: "/otp-setting",
        icon: <FaKey />,
        text: "OTP Setting",
      },
      {
        key: "register-bonus-campaign",
        to: "/register-bonus-campaign",
        icon: <FaGift />,
        text: "Register Bonus",
      },
      {
        key: "manual-deposit",
        to: "/manual-deposit",
        icon: <FaMoneyBillWave />,
        text: "Manual Deposit",
      },
      {
        key: "deposit-requests",
        to: "/deposit-requests",
        icon: <FaClipboardList />,
        text: "Deposit Requests",
      },
      {
        key: "auto-deposit-settings",
        to: "/auto-deposit-settings",
        icon: <FaMoneyBillWave />,
        text: "Auto Deposit",
      },
      {
        key: "auto-deposit-history",
        to: "/auto-deposit-history",
        icon: <FaReceipt />,
        text: "Auto Deposit History",
      },
      {
        key: "all-turnover-history",
        to: "/all-turnover-history",
        icon: <FaHistory />,
        text: "All Turnover History",
      },
    ],
    [],
  );

  const withdrawItems = useMemo(
    () => [
      {
        key: "add-withdraw",
        to: "/add-withdraw",
        icon: <FaMoneyBillWave />,
        text: "Add Withdraw",
      },
      {
        key: "withdraw-requests",
        to: "/withdraw-requests",
        icon: <FaWallet />,
        text: "Withdraw Requests",
      },
      {
        key: "add-aff-withdraw-method",
        to: "/add-aff-withdraw-method",
        icon: <MdOutlineAccountBalanceWallet />,
        text: "Add Aff Withdraw",
      },
      {
        key: "aff-withdraw-requests",
        to: "/aff-withdraw-requests",
        icon: <FaClipboardList />,
        text: "Aff Withdraw Request",
      },
      // {
      //   key: "withdraw-history",
      //   to: "/withdraw-history",
      //   icon: <FaHistory />,
      //   text: "Withdraw History",
      // },
    ],
    [],
  );

  const gameItems = useMemo(
    () => [
      // {
      //   key: "add-category",
      //   to: "/add-category",
      //   icon: <MdCategory />,
      //   text: "Add Category",
      // },
      // {
      //   key: "add-provider",
      //   to: "/add-provider",
      //   icon: <FaServer />,
      //   text: "Add Provider",
      // },
      // {
      //   key: "add-game",
      //   to: "/add-game",
      //   icon: <MdGames />,
      //   text: "Add Game",
      // },
      // {
      //   key: "add-sport-game",
      //   to: "/add-sport-game",
      //   icon: <MdGames />,
      //   text: "Add Sport Game",
      // },
      // {
      //   key: "add-popular-game",
      //   to: "/add-popular-game",
      //   icon: <MdGames />,
      //   text: "Add Popular Game",
      // },
      // {
      //   key: "add-hot-game",
      //   to: "/add-hot-game",
      //   icon: <FaHotjar />,
      //   text: "Add Hot Game",
      // },
     {
        key: "add-game-api-key",
        to: "/add-game-api-key",
        icon: <MdGames />,
        text: "Add Game API Key",
      },
      {
        key: "all-game-history",
        to: "/all-game-history",
        icon: <FaHistory />,
        text: "All Game History",
      },
    ],
    [],
  );

  const clientSiteItems = useMemo(
    () => [
      {
        key: "client-site-identify",
        to: "/client-site-identify",
        icon: <FaGlobe />,
        text: "Site Identify",
      },
      {
        key: "client-slider-control",
        to: "/client-slider-control",
        icon: <FaSlidersH />,
        text: "Slider Control",
      },
      {
        key: "add-favorite-banner",
        to: "/add-favorite-banner",
        icon: <MdFavorite />,
        text: "Add Favourite Control",
      },
      {
        key: "add-notice-control",
        to: "/add-notice-control",
        icon: <FaNotesMedical />,
        text: "Add Notice Control",
      },
      {
        key: "footer-setting",
        to: "/footer-setting",
        icon: <IoFootstepsOutline />,
        text: "Footer Setting",
      },
      {
        key: "navbar-color-setting",
        to: "/navbar-color-setting",
        icon: <IoColorPaletteOutline />,
        text: "Navbar Color Setting",
      },
      {
        key: "sidebar-color-setting",
        to: "/sidebar-color-setting",
        icon: <TbLayoutSidebarLeftCollapse />,
        text: "Sidebar Color Setting",
      },
      {
        key: "category-section-setting",
        to: "/category-section-setting",
        icon: <BiCategoryAlt />,
        text: "Category Section Setting",
      },
      {
        key: "register-modal-setting",
        to: "/register-modal-setting",
        icon: <MdOutlineAppRegistration />,
        text: "Register Modal Setting",
      },
      {
        key: "login-modal-setting",
        to: "/login-modal-setting",
        icon: <MdOutlineLogin />,
        text: "Login Modal Setting",
      },
      {
        key: "modal-color-setting",
        to: "/modal-color-setting",
        icon: <IoColorPaletteOutline />,
        text: "Modal Color Setting",
      },
      {
        key: "transaction-history-color-setting",
        to: "/transaction-history-color-setting",
        icon: <IoColorPaletteOutline />,
        text: "Transaction History Color Setting",
      },
      {
        key: "bottom-navigation-color-setting",
        to: "/bottom-navigation-color-setting",
        icon: <IoColorPaletteOutline />,
        text: "Bottom Navigation Color Setting",
      },
      {
        key: "home-page-content-color-setting",
        to: "/home-page-content-color-setting",
        icon: <IoColorPaletteOutline />,
        text: "Home Page Content Color Setting",
      },
      {
        key: "forget-password-modal-setting",
        to: "/forget-password-modal-setting",
        icon: <MdPassword />,
        text: "Forget Password Modal Setting",
      },
      {
        key: "social-link",
        to: "/social-link",
        icon: <FaShareAlt />,
        text: "Social Link",
      },
      {
        key: "download-header",
        to: "/download-header",
        icon: <FaDownload />,
        text: "Download App",
      },
    ],
    [],
  );

  const rewardItems = useMemo(
    () => [
      {
        key: "check-in-reward",
        to: "/check-in-reward",
        icon: <FaGift />,
        text: "Check-In",
      },
      {
        key: "wheel-of-fortune-reward",
        to: "/wheel-of-fortune-reward",
        icon: <FaGift />,
        text: "Wheel Of Fortune",
      },
      {
        key: "wheel-terms-condition",
        to: "/wheel-terms-condition",
        icon: <FaGift />,
        text: "Wheel Terms & Conditions",
      },
      {
        key: "reward-history",
        to: "/reward-history",
        icon: <FaHistory />,
        text: "Reward History",
      },
    ],
    [],
  );

  const affiliateSiteItems = useMemo(
    () => [
      {
        key: "client-aff-site-identify",
        to: "/client-aff-site-identify",
        icon: <FaHandshake />,
        text: "Aff Site Identify",
      },
      {
        key: "client-aff-social-link",
        to: "/client-aff-social-link",
        icon: <FaLink />,
        text: "Aff Social Link",
      },
      {
        key: "affiliate-register-setting",
        to: "/affiliate-register-setting",
        icon: <IoCreateOutline />,
        text: "Affiliate Register Setting",
      },
      {
        key: "affiliate-login-setting",
        to: "/affiliate-login-setting",
        icon: <IoLogInOutline />,
        text: "Affiliate Login Setting",
      },
      {
        key: "affiliate-slider-setting",
        to: "/affiliate-slider-setting",
        icon: <IoImagesOutline />,
        text: "Affiliate Slider Setting",
      },
      {
        key: "affiliate-agent-setting",
        to: "/affiliate-agent-setting",
        icon: <IoPeopleOutline />,
        text: "Affiliate Agent Setting",
      },
      {
        key: "affiliate-about-setting",
        to: "/affiliate-about-setting",
        icon: <IoInformationCircleOutline />,
        text: "Affiliate About Setting",
      },
      {
        key: "affiliate-sponsorship-setting",
        to: "/affiliate-sponsorship-setting",
        icon: <IoRibbonOutline />,
        text: "Affiliate Sponsorship Setting",
      },
      {
        key: "affiliate-commission-setting",
        to: "/affiliate-commission-setting",
        icon: <IoCashOutline />,
        text: "Affiliate Commission Setting",
      },
      {
        key: "affiliate-advantage-setting",
        to: "/affiliate-advantage-setting",
        icon: <IoDiamondOutline />,
        text: "Affiliate Advantage Setting",
      },
      {
        key: "affiliate-registration-guide-setting",
        to: "/affiliate-registration-guide-setting",
        icon: <IoClipboardOutline />,
        text: "Registration Guide Setting",
      },
      {
        key: "affiliate-watch-setting",
        to: "/affiliate-watch-setting",
        icon: <IoPlayCircleOutline />,
        text: "Affiliate Watch Setting",
      },
      {
        key: "affiliate-review-setting",
        to: "/affiliate-review-setting",
        icon: <IoChatbubbleEllipsesOutline />,
        text: "Affiliate Review Setting",
      },
      {
        key: "affiliate-footer-setting",
        to: "/affiliate-footer-setting",
        icon: <IoFootstepsOutline />,
        text: "Affiliate Footer Setting",
      },
      {
        key: "affiliate-navbar-setting",
        to: "/affiliate-navbar-setting",
        icon: <IoMenuOutline />,
        text: "Affiliate Navbar Setting",
      },
    ],
    [],
  );

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (item.key === "__mother__") return isMother;
      return canAccess(item.key);
    });
  }, [menuItems, isMother, permissions]);

  const visibleUserItems = useMemo(
    () => userItems.filter((item) => canAccess(item.key)),
    [userItems, permissions, isMother],
  );

  const visibleDepositItems = useMemo(
    () => depositItems.filter((item) => canAccess(item.key)),
    [depositItems, permissions, isMother],
  );

  const visibleWithdrawItems = useMemo(
    () => withdrawItems.filter((item) => canAccess(item.key)),
    [withdrawItems, permissions, isMother],
  );

  const visibleGameItems = useMemo(
    () => gameItems.filter((item) => canAccess(item.key)),
    [gameItems, permissions, isMother],
  );

  const visibleRewardItems = useMemo(
    () => rewardItems.filter((item) => canAccess(item.key)),
    [rewardItems, permissions, isMother],
  );

  const visibleClientSiteItems = useMemo(
    () => clientSiteItems.filter((item) => canAccess(item.key)),
    [clientSiteItems, permissions, isMother],
  );

  const visibleAffiliateSiteItems = useMemo(
    () => affiliateSiteItems.filter((item) => canAccess(item.key)),
    [affiliateSiteItems, permissions, isMother],
  );

  useEffect(() => {
    if (!visibleUserItems.length) setUsersOpen(false);
    if (!visibleDepositItems.length) setDepositOpen(false);
    if (!visibleWithdrawItems.length) setWithdrawOpen(false);
    if (!visibleGameItems.length) setGameOpen(false);
    if (!visibleRewardItems.length) setRewardOpen(false);
    if (!visibleClientSiteItems.length) setClientOpen(false);
    if (!visibleAffiliateSiteItems.length) setAffiliateOpen(false);
  }, [
    visibleUserItems.length,
    visibleDepositItems.length,
    visibleWithdrawItems.length,
    visibleGameItems.length,
    visibleRewardItems.length,
    visibleClientSiteItems.length,
    visibleAffiliateSiteItems.length,
  ]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#050607] text-white">
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#03111f] via-[#1A79D3] to-[#0d5fa8] px-4 py-3 flex items-center justify-between shadow-lg shadow-[#1A79D3]/30 border-b border-[#1A79D3]/20">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <h2 className="text-lg font-black">Admin</h2>

        <NavLink to="/profile">
          <FaUserCircle className="text-2xl text-white hover:text-blue-100 transition-colors cursor-pointer" />
        </NavLink>
      </div>

      {open && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden cursor-pointer"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 24, stiffness: 190 }}
          className="fixed md:static top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-[#050607] via-[#06182a] to-[#050607] border-r border-[#1A79D3]/20 shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#1A79D3]/20 to-black/80 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] flex items-center justify-center shadow-lg shadow-[#1A79D3]/40">
                  <span className="text-white font-black text-3xl">C</span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    ADMIN
                  </h2>
                  <p className="text-sm text-blue-100/80 font-medium">
                    {isMother ? "Mother Panel" : "Sub Admin Panel"}
                  </p>
                </div>
              </div>
            </div>

            {!isDesktop && (
              <button
                onClick={() => setOpen(false)}
                className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <FaTimes size={22} />
              </button>
            )}

            <nav className="flex-1 px-3 py-6 overflow-y-auto [scrollbar-width:none]">
              {visibleMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-3.5 rounded-xl mb-1.5 text-base font-semibold transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white shadow-lg shadow-[#1A79D3]/30"
                        : "text-slate-200 hover:bg-[#1A79D3]/15 hover:text-white"
                    }`
                  }
                >
                  <span className="text-2xl opacity-90 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </NavLink>
              ))}

              {visibleUserItems.length > 0 && (
                <DropdownSection
                  title="Users"
                  icon={<FaUserShield />}
                  open={usersOpen}
                  setOpen={setUsersOpen}
                  items={visibleUserItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleDepositItems.length > 0 && (
                <DropdownSection
                  title="Deposit"
                  icon={<FaWallet />}
                  open={depositOpen}
                  setOpen={setDepositOpen}
                  items={visibleDepositItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleWithdrawItems.length > 0 && (
                <DropdownSection
                  title="Withdraw"
                  icon={<FaMoneyBillWave />}
                  open={withdrawOpen}
                  setOpen={setWithdrawOpen}
                  items={visibleWithdrawItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleGameItems.length > 0 && (
                <DropdownSection
                  title="Game"
                  icon={<FaGamepad />}
                  open={gameOpen}
                  setOpen={setGameOpen}
                  items={visibleGameItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleRewardItems.length > 0 && (
                <DropdownSection
                  title="Reward"
                  icon={<FaGift />}
                  open={rewardOpen}
                  setOpen={setRewardOpen}
                  items={visibleRewardItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleClientSiteItems.length > 0 && (
                <DropdownSection
                  title="Client Site Controller"
                  icon={<FaLayerGroup />}
                  open={clientOpen}
                  setOpen={setClientOpen}
                  items={visibleClientSiteItems}
                  onClose={() => setOpen(false)}
                />
              )}

              {visibleAffiliateSiteItems.length > 0 && (
                <DropdownSection
                  title="Affiliate Controller"
                  icon={<FaHandshake />}
                  open={affiliateOpen}
                  setOpen={setAffiliateOpen}
                  items={visibleAffiliateSiteItems}
                  onClose={() => setOpen(false)}
                />
              )}
            </nav>

            <div className="p-5 border-t border-[#1A79D3]/20 mt-auto shrink-0">
              <button
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-center gap-3 py-3.5 px-5 bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] rounded-xl text-white font-black transition-all duration-300 shadow-lg shadow-[#1A79D3]/30 border border-[#1A79D3]/30 hover:scale-[1.01]"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </div>
        </motion.aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="hidden md:flex items-center justify-between px-6 lg:px-10 py-5 border-b border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#1A79D3]/15 to-black/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3ea0ff] text-lg" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-12 pr-5 py-3 bg-black/40 border border-[#1A79D3]/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#1A79D3]/70 focus:ring-2 focus:ring-[#1A79D3]/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2.5 hover:bg-[#1A79D3]/15 rounded-xl transition-colors cursor-pointer">
                <FaBell className="text-xl text-[#3ea0ff]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-red-300/60"></span>
              </button>

              <NavLink
                to="/profile"
                className="p-1 hover:bg-[#1A79D3]/15 rounded-full transition-colors cursor-pointer"
              >
                <FaUserCircle className="text-3xl text-[#3ea0ff]" />
              </NavLink>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto [scrollbar-width:none] bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.12),transparent_40%),linear-gradient(135deg,#050607,#07131f,#050607)]">
            <div className="mt-16 md:mt-0 p-4 lg:p-6 text-white">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const DropdownSection = ({ title, icon, open, setOpen, items, onClose }) => {
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-slate-200 hover:bg-[#1A79D3]/15 hover:text-white transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold">{title}</span>
        </div>

        {open ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-2 pl-10 space-y-1">
          {items.map((sub) => (
            <NavLink
              key={sub.to}
              to={sub.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white font-bold shadow-md shadow-[#1A79D3]/30"
                    : "text-slate-300 hover:text-white hover:bg-[#1A79D3]/15"
                }`
              }
            >
              <span className="text-xl opacity-90">{sub.icon}</span>
              <span>{sub.text}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
