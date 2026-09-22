import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  BadgeDollarSign,
  Calculator,
  DollarSign,
  BarChart3,
  Wallet,
} from "lucide-react";
import { useLanguage } from "../../Context/LanguageProvider";

const Commission = () => {
  const { isBangla } = useLanguage();
  const [open, setOpen] = useState(false);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ================== TEXT (BN/EN) ==================
  const t = useMemo(() => {
    return {
      // section
      sectionTitle: isBangla ? "কমিশন স্ট্রাকচার" : "Commission Structure",
      btnMore: isBangla ? "আরও দেখুন" : "View More",

      // table header (main)
      th: isBangla
        ? [
            "স্তর",
            "সক্রিয় খেলোয়াড়",
            "বেস কমিশন স্তর",
            "অতিরিক্ত কমিশন",
            "অতিরিক্ত কমিশনের প্রয়োজনীয়তা",
            "মোট কমিশন",
          ]
        : [
            "Level",
            "Active Players",
            "Base Commission",
            "Extra Commission",
            "Extra Commission Requirement",
            "Total Commission",
          ],

      // rows (main)
      rows: isBangla
        ? [
            {
              level: "1",
              newReg: "1 - 9",
              base: "20%",
              extra: "5%",
              need: "ন্যূনতম ৩টি নতুন রেজিস্টার",
              total: "25%",
            },
            {
              level: "2",
              newReg: "10 - 19",
              base: "40%",
              extra: "5%",
              need: "ন্যূনতম ৬টি নতুন রেজিস্টার",
              total: "45%",
            },
            {
              level: "3",
              newReg: "20 and more",
              base: "50%",
              extra: "10%",
              need: "ন্যূনতম ১৫টি নতুন রেজিস্টার",
              total: "60%",
            },
          ]
        : [
            {
              level: "1",
              newReg: "1 - 9",
              base: "20%",
              extra: "5%",
              need: "Minimum 3 new registrations",
              total: "25%",
            },
            {
              level: "2",
              newReg: "10 - 19",
              base: "40%",
              extra: "5%",
              need: "Minimum 6 new registrations",
              total: "45%",
            },
            {
              level: "3",
              newReg: "20 and more",
              base: "50%",
              extra: "10%",
              need: "Minimum 15 new registrations",
              total: "60%",
            },
          ],

      // modal title + bullets
      modalTitle: isBangla ? "কমিশনের তথ্য" : "Commission Info",
      bullets: isBangla
        ? [
            "অনন্য সক্রিয় খেলোয়াড়: একজন খেলোয়াড় যিনি একই ক্যালেন্ডার মাসে কমপক্ষে ৮০০ টাকার জমা করেছেন এবং কমপক্ষে ৫টি বাজি ধরেন।",
            "নতুন নিবন্ধিত খেলোয়াড়ের মানদণ্ড: মোট ১,০০০ ডিপোজিট এবং কমপক্ষে ৫,০০০ বৈধ বাজি থাকতে হবে।",
          ]
        : [
            "Unique active player: A player who deposits at least BDT 800 in the same calendar month and places at least 5 bets.",
            "New registered player criteria: Total deposit 1,000 and at least 5,000 valid bets.",
          ],

      // modal sub title
      formulaTitle: isBangla ? "কমিশন গণনা" : "Commission Calculation",
      formulaLabels: isBangla
        ? [
            "Players\nWin/Loss",
            "Operation\nCost 20%",
            "Bonus/\nAdjustment",
            "Net Profit",
            "Commission\nTier",
            "Total Agent\nCommission",
          ]
        : [
            "Players\nWin/Loss",
            "Operation\nCost 20%",
            "Bonus/\nAdjustment",
            "Net Profit",
            "Commission\nTier",
            "Total Agent\nCommission",
          ],

      exampleTitle: isBangla
        ? "উদাহরণ: ২০ জন সক্রিয় খেলোয়াড় সহ এজেন্ট"
        : "Example: Agent with 20 active players",

      // example table headers
      exTh: isBangla
        ? [
            "প্লেয়ার সংখ্যা",
            "জয়-পরাজয়",
            "পরিচালনা খরচ 20%",
            "বোনাস",
            "কমিশন সূত্র",
            "এজেন্ট কমিশন",
          ]
        : [
            "Player No.",
            "Win/Loss",
            "Operation Cost 20%",
            "Bonus",
            "Commission Formula",
            "Agent Commission",
          ],

      // example rows (match screenshot style)
      // commission formula column in screenshot is kind of blank; we keep a text like "Net Profit × Tier"
      exRows: isBangla
        ? [
            {
              no: "1",
              wl: "1,000,000",
              op: "200,000",
              bonus: "23,000",
              formula: "নেট প্রফিট × স্তর",
              agent: "466,200",
            },
            {
              no: "2",
              wl: "880,000",
              op: "176,000",
              bonus: "8,000",
              formula: "নেট প্রফিট × স্তর",
              agent: "417,600",
            },
            {
              no: "3",
              wl: "1,250,000",
              op: "250,000",
              bonus: "12,000",
              formula: "নেট প্রফিট × স্তর",
              agent: "592,800",
            },
            {
              no: "4",
              wl: "443,000",
              op: "88,600",
              bonus: "600",
              formula: "নেট প্রফিট × স্তর",
              agent: "212,280",
            },
          ]
        : [
            {
              no: "1",
              wl: "1,000,000",
              op: "200,000",
              bonus: "23,000",
              formula: "Net Profit × Tier",
              agent: "466,200",
            },
            {
              no: "2",
              wl: "880,000",
              op: "176,000",
              bonus: "8,000",
              formula: "Net Profit × Tier",
              agent: "417,600",
            },
            {
              no: "3",
              wl: "1,250,000",
              op: "250,000",
              bonus: "12,000",
              formula: "Net Profit × Tier",
              agent: "592,800",
            },
            {
              no: "4",
              wl: "443,000",
              op: "88,600",
              bonus: "600",
              formula: "Net Profit × Tier",
              agent: "212,280",
            },
          ],

      exTotalLabel: isBangla ? "মোট" : "Total",
      exTotal: {
        wl: "3,573,000",
        op: "714,600",
        bonus: "43,600",
        agent: "1,688,880",
      },

      close: isBangla ? "বন্ধ করুন" : "Close",
    };
  }, [isBangla]);

  // ================== main table rows ==================
  const rows = t.rows;

  return (
    <section className="w-full bg-[#2b2b2b] py-10 sm:py-14 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-8">
          {t.sectionTitle}
        </h2>

        {/* Table wrapper (responsive) */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[980px] border border-white/90">
            {/* Header */}
            <div className="grid grid-cols-6 bg-[#f5b400] text-black font-extrabold text-base">
              {t.th.map((h, i) => (
                <div
                  key={i}
                  className={`py-2 px-4 text-center text-lg ${
                    i !== t.th.length - 1 ? "border-r border-white/90" : ""
                  }`}
                >
                  {h}
                </div>
              ))}
            </div>

            {/* Body */}
            {rows.map((r, idx) => (
              <div
                key={idx}
                className="grid grid-cols-6 bg-[#2b2b2b] text-white font-semibold"
              >
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.level}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.newReg}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.base}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.extra}
                </div>
                <div className="py-4 px-2 border-t border-r border-white/90 text-center font-semibold">
                  {r.need}
                </div>
                <div className="py-4  border-t border-white/90 text-center font-semibold">
                  {r.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setOpen(true)}
            className="bg-[#f5b400] cursor-pointer text-black font-extrabold px-10 py-3 rounded-md hover:bg-[#e2a800] transition"
          >
            {t.btnMore}
          </button>
        </div>
      </div>

      {/* ================= MODAL (same as screenshot) ================= */}
      <AnimatePresence>
        {open && (
          <>
            {/* overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* modal wrapper */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6"
            >
              {/* modal box */}
              <div
                className="w-full max-w-5xl bg-white text-black rounded-sm shadow-[0_18px_50px_rgba(0,0,0,0.65)] overflow-hidden "
                onClick={(e) => e.stopPropagation()}
              >
                {/* header */}
                <div className="relative px-4 sm:px-8 pt-6 sm:pt-8">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute cursor-pointer right-3 top-3 sm:right-5 sm:top-5 p-2 rounded hover:bg-black/5 transition"
                    aria-label="Close modal"
                  >
                    <X className="text-black" />
                  </button>

                  <h3 className="text-3xl sm:text-4xl font-extrabold mb-4">
                    {t.modalTitle}
                  </h3>
                </div>

                {/* content scroll area (responsive) */}
                <div className="px-4 sm:px-8 pb-8 max-h-[78vh] overflow-y-auto [scrollbar-width:none]">
                  {/* bullets */}
                  <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-black/85">
                    {t.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  {/* formula title */}
                  <h4 className="text-2xl sm:text-3xl font-extrabold mt-6">
                    {t.formulaTitle}
                  </h4>

                  {/* formula icons row */}
                  <div className="mt-6 flex flex-wrap items-start justify-center gap-5 sm:gap-7">
                    <FormulaItem Icon={User} label={t.formulaLabels[0]} />
                    <Sign />
                    <FormulaItem
                      Icon={BadgeDollarSign}
                      label={t.formulaLabels[1]}
                    />
                    <Sign />
                    <FormulaItem Icon={Calculator} label={t.formulaLabels[2]} />
                    <Sign equal />
                    <FormulaItem Icon={DollarSign} label={t.formulaLabels[3]} />
                    <Sign multiply />
                    <FormulaItem Icon={BarChart3} label={t.formulaLabels[4]} />
                    <Sign equal />
                    <FormulaItem Icon={Wallet} label={t.formulaLabels[5]} />
                  </div>

                  {/* example title */}
                  <p className="mt-8 text-lg sm:text-xl font-extrabold">
                    {t.exampleTitle}
                  </p>

                  {/* example table */}
                  <div className="mt-4 w-full overflow-x-auto">
                    <div className="min-w-[920px] border border-black/15">
                      {/* header row */}
                      <div className="grid grid-cols-6 bg-[#f5b400] text-black font-extrabold text-sm sm:text-base">
                        {t.exTh.map((h, i) => (
                          <div
                            key={i}
                            className={`py-3 px-3 text-center ${
                              i !== t.exTh.length - 1
                                ? "border-r border-black/10"
                                : ""
                            }`}
                          >
                            {h}
                          </div>
                        ))}
                      </div>

                      {/* data rows */}
                      {t.exRows.map((r, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-6 bg-white text-black text-sm sm:text-base"
                        >
                          <div className="py-3 px-3 text-center border-t border-r border-black/10">
                            {r.no}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10 font-semibold">
                            {r.wl}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10 font-semibold">
                            {r.op}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10 font-semibold">
                            {r.bonus}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-r border-black/10">
                            {r.formula}
                          </div>
                          <div className="py-3 px-3 text-center border-t border-black/10 font-semibold">
                            {r.agent}
                          </div>
                        </div>
                      ))}

                      {/* total row (yellow like screenshot) */}
                      <div className="grid grid-cols-6 bg-[#f5b400] text-black font-extrabold">
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotalLabel}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotal.wl}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotal.op}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {t.exTotal.bonus}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-r border-black/10">
                          {/* empty like screenshot */}
                        </div>
                        <div className="py-4 px-3 text-center border-t border-black/10">
                          {t.exTotal.agent}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* close button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setOpen(false)}
                      className="bg-[#f5b400] cursor-pointer text-black font-extrabold px-6 py-2 rounded-md hover:bg-[#e2a800] transition"
                    >
                      {t.close}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Commission;

/* ===================== helpers ===================== */

const FormulaItem = ({ Icon, label }) => {
  // label supports \n
  const parts = String(label).split("\n");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#f5b400] flex items-center justify-center">
        <Icon className="text-white" size={30} strokeWidth={2.5} />
      </div>
      <div className="text-center text-xs sm:text-sm font-bold leading-snug">
        {parts.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </div>
    </div>
  );
};

const Sign = ({ equal, multiply }) => {
  const text = equal ? "=" : multiply ? "×" : "−";
  return (
    <div className="text-3xl sm:text-4xl font-extrabold text-[#f5b400] mt-4 sm:mt-5">
      {text}
    </div>
  );
};
