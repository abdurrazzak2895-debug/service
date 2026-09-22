import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Gift,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowLeft,
  Search,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import { selectModalColorSetting } from "../../features/global/globalSelectors";

const PER_PAGE = 7;

const defaultModalColors = {
  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",

  headerBg: "#0865a9",
  headerText: "#ffffff",
  closeIconColor: "#ffffff",

  primaryBg: "#0865a9",
  primaryText: "#ffffff",

  secondaryBg: "#2e9bf3",
  secondaryText: "#ffffff",

  inactiveTabBg: "#00518c",
  inactiveTabText: "#ffffff",

  sectionBg: "#f3f7fb",
  sectionBorder: "#d9e7f5",
  sectionText: "#2451cc",

  cardBg: "#ffffff",
  cardBorder: "#d9e7f5",

  inputBg: "#f3f7fb",
  inputText: "#0865a9",
  inputBorder: "#d9e7f5",
  inputFocusBorder: "#0865a9",

  labelText: "#333333",
  normalText: "#333333",
  mutedText: "#777777",

  summaryBg: "#eaf4ff",
  summaryText: "#0865a9",

  disabledBg: "#a6a6a6",
  disabledText: "#ffffff",
};

const CATEGORIES = [
  "All",
  "Welcome Offer",
  "Slots",
  "Live Casino",
  "Sports",
  "Fishing",
  "Lottery",
  "Table",
  "Arcade",
  "Crash",
];

const PromotionModal = ({ open, onClose }) => {
  const { isBangla } = useLanguage();

  const modalColorSetting = useSelector(selectModalColorSetting);
  const colors = {
    ...defaultModalColors,
    ...(modalColorSetting || {}),
  };

  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const t = {
    title: isBangla ? "প্রোমোশন" : "Promotions",
    loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
    empty: isBangla ? "কোন প্রোমোশন পাওয়া যায়নি" : "No promotion found",
    noCategory: isBangla
      ? "এই ক্যাটাগরিতে কোনো প্রোমোশন নেই"
      : "No promotion found in this category",
    noSearch: isBangla
      ? "এই নামে কোনো প্রোমোশন পাওয়া যায়নি"
      : "No promotion found by this title",
    view: isBangla ? "বিস্তারিত দেখুন" : "View Details",
    back: isBangla ? "ফিরে যান" : "Back",
    category: isBangla ? "ক্যাটাগরি" : "Category",
    all: isBangla ? "সব" : "All",
    searchPlaceholder: isBangla ? "টাইটেল দিয়ে সার্চ করুন" : "Search by title",
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/promotions/active/list");
      setPromotions(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to load promotions:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPromotions();
      setPage(1);
      setSelected(null);
      setCategory("All");
      setSearch("");
    }
  }, [open]);

  const getTitle = (item) =>
    isBangla
      ? item?.title?.bn || item?.title?.en || ""
      : item?.title?.en || item?.title?.bn || "";

  const getDescription = (item) =>
    isBangla
      ? item?.description?.bn || item?.description?.en || ""
      : item?.description?.en || item?.description?.bn || "";

  const filteredPromotions = useMemo(() => {
    const s = String(search || "")
      .trim()
      .toLowerCase();

    return promotions.filter((item) => {
      const categoryOk = category === "All" || item?.category === category;

      const titleBn = String(item?.title?.bn || "").toLowerCase();
      const titleEn = String(item?.title?.en || "").toLowerCase();
      const titleOk = !s || titleBn.includes(s) || titleEn.includes(s);

      return categoryOk && titleOk;
    });
  }, [promotions, category, search]);

  useEffect(() => {
    setPage(1);
    setSelected(null);
  }, [category, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPromotions.length / PER_PAGE),
  );

  const pageItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredPromotions.slice(start, start + PER_PAGE);
  }, [filteredPromotions, page]);

  const emptyText = useMemo(() => {
    if (search.trim()) return t.noSearch;
    if (category !== "All") return t.noCategory;
    return t.empty;
  }, [search, category, t.noSearch, t.noCategory, t.empty]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center px-0 backdrop-blur-[3px] sm:px-4"
          style={{ background: colors.pageOverlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-screen w-full flex-col overflow-hidden shadow-2xl sm:h-[700px] sm:max-w-[430px] sm:rounded-[8px]"
            style={{ backgroundColor: colors.sectionBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              {selected ? (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute left-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                  style={{ color: colors.closeIconColor }}
                >
                  <ArrowLeft size={24} />
                </button>
              ) : null}

              <h2 className="text-[18px] font-semibold">{t.title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                style={{ color: colors.closeIconColor }}
              >
                <X size={24} />
              </button>
            </div>

            {selected ? (
              <div
                className="flex-1 overflow-y-auto p-3"
                style={{ backgroundColor: colors.sectionBg }}
              >
                <div
                  className="overflow-hidden rounded-[8px] shadow"
                  style={{ backgroundColor: colors.cardBg }}
                >
                  {selected?.imageUrl ? (
                    <img
                      src={selected.imageUrl}
                      alt={getTitle(selected)}
                      className="h-[180px] w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-[180px] w-full items-center justify-center"
                      style={{
                        backgroundColor: colors.summaryBg,
                        color: colors.summaryText,
                      }}
                    >
                      <Gift size={54} />
                    </div>
                  )}

                  <div className="p-4">
                    <div
                      className="mb-2 inline-flex rounded-full px-3 py-1 text-[12px] font-semibold"
                      style={{
                        backgroundColor: colors.summaryBg,
                        color: colors.summaryText,
                      }}
                    >
                      {t.category}: {selected?.category || "-"}
                    </div>

                    <h3
                      className="text-[20px] font-bold leading-7"
                      style={{ color: colors.primaryBg }}
                    >
                      {getTitle(selected)}
                    </h3>

                    <p
                      className="mt-3 whitespace-pre-line text-[14px] leading-6"
                      style={{ color: colors.mutedText }}
                    >
                      {getDescription(selected)}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] px-4 py-3 text-[14px] font-semibold"
                      style={{
                        backgroundColor: colors.primaryBg,
                        color: colors.primaryText,
                      }}
                    >
                      <ArrowLeft size={18} />
                      {t.back}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="shrink-0 border-b p-3"
                  style={{
                    backgroundColor: colors.modalBg,
                    borderColor: colors.sectionBorder,
                  }}
                >
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-[38px] w-full cursor-pointer rounded-[6px] border px-3 text-[13px] font-semibold outline-none"
                      style={{
                        backgroundColor: colors.inputBg,
                        color: colors.inputText,
                        borderColor: colors.inputBorder,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          colors.inputFocusBorder;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = colors.inputBorder;
                      }}
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item === "All" ? t.all : item}
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: colors.primaryBg }}
                      />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="h-[38px] w-full rounded-[6px] border pl-9 pr-3 text-[13px] font-semibold outline-none"
                        style={{
                          backgroundColor: colors.inputBg,
                          color: colors.inputText,
                          borderColor: colors.inputBorder,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            colors.inputFocusBorder;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor =
                            colors.inputBorder;
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 overflow-y-auto p-3"
                  style={{ backgroundColor: colors.sectionBg }}
                >
                  {loading ? (
                    <div
                      className="flex h-full items-center justify-center"
                      style={{ color: colors.primaryBg }}
                    >
                      {t.loading}
                    </div>
                  ) : pageItems.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-5 text-center">
                      <div>
                        <div
                          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: colors.summaryBg,
                            color: colors.summaryText,
                          }}
                        >
                          <Gift size={42} />
                        </div>
                        <h3
                          className="mt-5 text-[22px] font-bold"
                          style={{ color: colors.primaryBg }}
                        >
                          {emptyText}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pageItems.map((item) => (
                        <div
                          key={item._id}
                          className="overflow-hidden rounded-[8px] shadow"
                          style={{ backgroundColor: colors.cardBg }}
                        >
                          {item?.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={getTitle(item)}
                              className="h-[125px] w-full object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-[125px] w-full items-center justify-center"
                              style={{
                                backgroundColor: colors.summaryBg,
                                color: colors.summaryText,
                              }}
                            >
                              <Gift size={42} />
                            </div>
                          )}

                          <div className="p-3">
                            <div
                              className="mb-1 inline-flex rounded-full px-2 py-[2px] text-[11px] font-semibold"
                              style={{
                                backgroundColor: colors.summaryBg,
                                color: colors.summaryText,
                              }}
                            >
                              {item?.category || "-"}
                            </div>

                            <h3
                              className="line-clamp-2 text-[16px] font-bold leading-6"
                              style={{ color: colors.primaryBg }}
                            >
                              {getTitle(item)}
                            </h3>

                            <button
                              type="button"
                              onClick={() => setSelected(item)}
                              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold"
                              style={{
                                backgroundColor: colors.primaryBg,
                                color: colors.primaryText,
                              }}
                            >
                              <Eye size={16} />
                              {t.view}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className="flex h-[54px] shrink-0 items-center justify-between border-t px-3"
                  style={{
                    backgroundColor: colors.modalBg,
                    borderColor: colors.sectionBorder,
                  }}
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex cursor-pointer items-center gap-1 rounded-[6px] px-3 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      backgroundColor:
                        page <= 1 ? colors.disabledBg : colors.primaryBg,
                      color:
                        page <= 1 ? colors.disabledText : colors.primaryText,
                    }}
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>

                  <div
                    className="text-[13px] font-semibold"
                    style={{ color: colors.primaryBg }}
                  >
                    {page} / {totalPages}
                  </div>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex cursor-pointer items-center gap-1 rounded-[6px] px-3 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                    style={{
                      backgroundColor:
                        page >= totalPages
                          ? colors.disabledBg
                          : colors.primaryBg,
                      color:
                        page >= totalPages
                          ? colors.disabledText
                          : colors.primaryText,
                    }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromotionModal;
