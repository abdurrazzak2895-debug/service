import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectModalColorSetting } from "../../features/global/globalSelectors";

const defaultModalColors = {
  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",

  headerBg: "#0865a9",
  headerText: "#ffffff",
  primaryBg: "#0865a9",
  normalText: "#333333",
  mutedText: "#777777",
  cardBorder: "#dce8f5",
};

// Light markup convention so admin can reproduce a "Weekly Lucky Draw"
// style layout (paragraph, bold sub-headers, bullet lists) from one plain
// text field: a line ending with ":" is a bold sub-header, a line
// starting with "- " is a bullet point, a blank line adds spacing,
// anything else is a plain paragraph.
const renderBody = (text, colors) => {
  if (!text) return null;

  const lines = String(text).split(/\r?\n/);
  const blocks = [];
  let currentList = null;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      currentList = null;
      blocks.push({ type: "spacer" });
      return;
    }

    if (line.startsWith("- ")) {
      if (!currentList) {
        currentList = { type: "list", items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(line.slice(2).trim());
      return;
    }

    currentList = null;

    if (line.endsWith(":")) {
      blocks.push({ type: "header", text: line });
      return;
    }

    blocks.push({ type: "paragraph", text: line });
  });

  return blocks.map((block, index) => {
    if (block.type === "spacer") {
      return <div key={index} className="h-2" />;
    }

    if (block.type === "header") {
      return (
        <p
          key={index}
          className="mt-3 text-[13px] font-bold first:mt-0"
          style={{ color: colors.normalText }}
        >
          {block.text}
        </p>
      );
    }

    if (block.type === "list") {
      return (
        <ul key={index} className="mt-1 list-disc space-y-1 pl-5">
          {block.items.map((item, itemIndex) => (
            <li
              key={itemIndex}
              className="text-[13px] leading-6"
              style={{ color: colors.normalText }}
            >
              {item}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p
        key={index}
        className="text-[13px] leading-6"
        style={{ color: colors.normalText }}
      >
        {block.text}
      </p>
    );
  });
};

// Single-banner popup for a slider in "promo" mode — image, blue title
// bar, rich body text and optional labeled sections below it (e.g. a
// deposit bonus's "Eligible Tier" table plus a separate "Eligible Games"
// list). Deliberately smaller than PromotionModal (no list/search), since
// a slide only ever shows its own one promo.
const SliderPromoModal = ({ open, onClose, image, title, description, table }) => {
  const { isBangla } = useLanguage();

  const modalColorSetting = useSelector(selectModalColorSetting);
  const colors = {
    ...defaultModalColors,
    ...(modalColorSetting || {}),
  };

  const sections = Array.isArray(table?.sections) ? table.sections : [];
  const showTable = Boolean(table?.enabled) && sections.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center px-4"
          style={{ background: colors.pageOverlayBg }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative flex max-h-[88vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[10px] shadow-2xl"
            style={{ backgroundColor: colors.modalBg }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={isBangla ? "বন্ধ করুন" : "Close"}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
            >
              <X size={18} />
            </button>

            {image ? (
              <img
                src={image}
                alt={title}
                className="max-h-[360px] w-full object-contain"
                style={{ backgroundColor: colors.headerBg }}
              />
            ) : null}

            <div
              className="px-4 py-3 text-[16px] font-bold"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              {title}
            </div>

            {description || showTable ? (
              <div className="promo-modal-scroll flex-1 overflow-y-auto px-4 py-4">
                {renderBody(description, colors)}

                {showTable && (
                  <div
                    className="mt-4 divide-y overflow-hidden rounded-[6px] border"
                    style={{ borderColor: colors.cardBorder }}
                  >
                    {sections.map((section, sectionIndex) => {
                      const sectionLabel = isBangla
                        ? section?.label?.bn
                        : section?.label?.en;
                      const columns = Array.isArray(section?.columns)
                        ? section.columns
                        : [];
                      const rows = Array.isArray(section?.rows)
                        ? section.rows
                        : [];
                      const hasColumns = columns.length > 0;

                      return (
                        <div
                          key={sectionIndex}
                          className="flex items-stretch"
                          style={{ borderColor: colors.cardBorder }}
                        >
                          {sectionLabel ? (
                            <div
                              className="flex w-[92px] shrink-0 items-center justify-center border-r px-2 py-3 text-center text-[12px] font-bold"
                              style={{
                                backgroundColor: colors.headerBg,
                                color: colors.headerText,
                                borderColor: colors.cardBorder,
                              }}
                            >
                              {sectionLabel}
                            </div>
                          ) : null}

                          <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {hasColumns ? (
                              <table className="w-full min-w-max border-collapse text-left">
                                <thead>
                                  <tr>
                                    {columns.map((col, colIndex) => (
                                      <th
                                        key={colIndex}
                                        className="px-3 py-2 text-[12px] font-bold"
                                        style={{
                                          backgroundColor: colors.headerBg,
                                          color: colors.headerText,
                                        }}
                                      >
                                        {isBangla ? col?.bn : col?.en}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {rows.map((row, rowIndex) => (
                                    <tr
                                      key={rowIndex}
                                      className="border-t"
                                      style={{ borderColor: colors.cardBorder }}
                                    >
                                      {(row?.cells || []).map(
                                        (cell, cellIndex) => (
                                          <td
                                            key={cellIndex}
                                            className="px-3 py-2 text-[12px]"
                                            style={{ color: colors.normalText }}
                                          >
                                            {isBangla ? cell?.bn : cell?.en}
                                          </td>
                                        ),
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="divide-y" style={{ borderColor: colors.cardBorder }}>
                                {rows.map((row, rowIndex) => (
                                  <div
                                    key={rowIndex}
                                    className="px-3 py-2 text-[12px]"
                                    style={{
                                      color: colors.normalText,
                                      borderColor: colors.cardBorder,
                                    }}
                                  >
                                    {isBangla
                                      ? row?.cells?.[0]?.bn
                                      : row?.cells?.[0]?.en}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>

          <style>{`
            .promo-modal-scroll::-webkit-scrollbar {
              width: 6px;
            }

            .promo-modal-scroll::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.06);
              border-radius: 20px;
            }

            .promo-modal-scroll::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.28);
              border-radius: 20px;
            }

            .promo-modal-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.45);
            }

            .promo-modal-scroll {
              scrollbar-width: thin;
              scrollbar-color: rgba(0, 0, 0, 0.28) rgba(0, 0, 0, 0.06);
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SliderPromoModal;
