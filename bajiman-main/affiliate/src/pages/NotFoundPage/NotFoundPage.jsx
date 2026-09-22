import React from "react";
import { useNavigate } from "react-router";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 text-white bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.12),transparent_40%),linear-gradient(135deg,#050607,#07131f,#050607)]">
      <div className="w-full max-w-2xl text-center rounded-3xl border border-[#1A79D3]/25 bg-black/35 backdrop-blur-md shadow-2xl shadow-black/60 overflow-hidden">
        <div className="p-8 sm:p-12 bg-gradient-to-r from-black/80 via-[#1A79D3]/15 to-black/80">
          <div className="mx-auto mb-6 w-24 h-24 rounded-3xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] flex items-center justify-center shadow-lg shadow-[#1A79D3]/40">
            <FaExclamationTriangle className="text-5xl text-white" />
          </div>

          <h1 className="text-7xl sm:text-8xl font-black tracking-tight bg-gradient-to-r from-[#3ea0ff] via-white to-[#1A79D3] bg-clip-text text-transparent">
            404
          </h1>

          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">
            Page Not Found
          </h2>

          <p className="mt-4 text-sm sm:text-base text-blue-100/80 leading-relaxed max-w-md mx-auto">
            Sorry, the page you are looking for does not exist or has been
            moved. Please go back to the dashboard.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-8 inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] text-white font-black shadow-lg shadow-[#1A79D3]/30 border border-[#1A79D3]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <FaHome />
            Go To Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
