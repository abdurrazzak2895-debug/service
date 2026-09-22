import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  FaHome,
  FaUsers,
  FaBullhorn,
  FaChartBar,
  FaTimes,
} from "react-icons/fa";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { RxHamburgerMenu } from "react-icons/rx";
import { LogOut, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { logout } from "../../features/auth/authSlice";
import { selectAffiliateUser } from "../../features/auth/authSelectors";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectAffiliateUser);

  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

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

  const menuItems = useMemo(
    () => [
      {
        to: "/dashboard",
        icon: <FaHome />,
        text: "Dashboard",
        end: true,
      },
      {
        to: "/dashboard/my-users",
        icon: <FaUsers />,
        text: "My Users",
      },
      {
        to: "/dashboard/withdraw",
        icon: <RiMoneyDollarCircleFill />,
        text: "Withdraw",
      },
      {
        to: "/dashboard/withdraw-history",
        icon: <FaBullhorn />,
        text: "Withdraw History",
      },
      {
        to: "/dashboard/commission-status",
        icon: <FaChartBar />,
        text: "Commission Status",
      },
    ],
    [],
  );

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    toast.success("Logout successful");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#050607] text-white">
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1A79D3]/20 bg-gradient-to-r from-[#03111f] via-[#1A79D3] to-[#0d5fa8] px-4 py-3 shadow-lg shadow-[#1A79D3]/30 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/15"
        >
          <RxHamburgerMenu className="text-2xl text-white" />
        </button>

        <h2 className="text-lg font-black">Affiliate Panel</h2>

        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer rounded-lg p-2 text-white transition hover:bg-white/15"
        >
          <LogOut size={21} />
        </button>
      </div>

      {open && !isDesktop && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 cursor-pointer bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <motion.aside
          initial={false}
          animate={{ x: open || isDesktop ? 0 : "-100%" }}
          transition={{ type: "spring", damping: 24, stiffness: 190 }}
          className="fixed left-0 top-0 z-50 flex h-full min-h-screen w-72 flex-col overflow-hidden border-r border-[#1A79D3]/20 bg-gradient-to-b from-[#050607] via-[#06182a] to-[#050607] shadow-2xl shadow-black/60 md:static"
        >
          <div className="shrink-0 border-b border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#1A79D3]/20 to-black/80 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
                <span className="text-3xl font-black text-white">A</span>
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  AFFILIATE
                </h2>
                <p className="text-sm font-medium text-blue-100/80">
                  Partner Panel
                </p>
              </div>
            </div>
          </div>

          {!isDesktop && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 cursor-pointer rounded-xl p-2.5 text-white transition-colors hover:bg-white/10"
            >
              <FaTimes size={22} />
            </button>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-6 [scrollbar-width:none]">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `group mb-1.5 flex cursor-pointer items-center gap-4 rounded-xl px-5 py-3.5 text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white shadow-lg shadow-[#1A79D3]/30"
                      : "text-slate-200 hover:bg-[#1A79D3]/15 hover:text-white"
                  }`
                }
              >
                <span className="text-2xl opacity-90 transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </NavLink>
            ))}
          </nav>

          <div className="shrink-0 border-t border-[#1A79D3]/20 p-4">
            <div className="mb-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 p-3">
              <Link
                to="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#1A79D3]/15 p-2 transition-all duration-200 hover:bg-[#1A79D3]/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A79D3]/20 text-[#6fb5f4]">
                  <UserCircle size={24} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-white">
                    {user?.userId || user?.username || "Affiliate User"}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {user?.email || "affiliate account"}
                  </p>
                </div>
              </Link>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </motion.aside>

        <main className="min-h-screen flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.12),transparent_40%),linear-gradient(135deg,#050607,#07131f,#050607)] [scrollbar-width:none]">
          <div className="mt-16 p-4 text-white md:mt-0 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
