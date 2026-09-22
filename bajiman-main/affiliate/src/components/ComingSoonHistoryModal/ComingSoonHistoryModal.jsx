import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Clock } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectTransactionHistoryColorSetting } from "../../features/global/globalSelectors";
// import TransactionTab from "../TransactionTab/TransactionTab";
import AutoDepositModalHistory from "../AutoDepositModalHistory/AutoDepositModalHistory";

const defaultHistoryColors = {
  modalBg: "#ffffff",
  pageOverlayBg: "rgba(0,0,0,0.45)",
  headerBg: "#0865a9",
  headerText: "#ffffff",
  closeIconColor: "#ffffff",
  primaryBg: "#0865a9",
  sectionBg: "#f3f7fb",
  summaryBg: "#eaf4ff",
  summaryText: "#0865a9",
  mutedText: "#666666",
};

const ComingSoonHistoryModal = ({
  open,
  onClose,
  activeTab,
  onTabChange,
  title,
  onBackToDeposit,
}) => {
  const { isBangla } = useLanguage();

  const transactionHistoryColorSetting = useSelector(
    selectTransactionHistoryColorSetting,
  );

  const colors = {
    ...defaultHistoryColors,
    ...(transactionHistoryColorSetting || {}),
  };

  const renderBody = () => {
    if (activeTab === "autoDeposit") {
      return (
        <AutoDepositModalHistory
          onBackToDeposit={() => {
            onClose?.();
            onBackToDeposit?.();
          }}
        />
      );
    }

    return (
      <div
        className="flex flex-1 items-center justify-center px-5"
        style={{ backgroundColor: colors.sectionBg }}
      >
        <div className="text-center">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: colors.summaryBg,
              color: colors.summaryText,
            }}
          >
            <Clock size={42} />
          </div>

          <h3
            className="mt-5 text-[24px] font-bold"
            style={{ color: colors.primaryBg }}
          >
            {isBangla ? "শীঘ্রই আসছে" : "Coming Soon"}
          </h3>

          <p
            className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6"
            style={{ color: colors.mutedText }}
          >
            {isBangla
              ? "এই হিস্টোরি সার্ভিস খুব শীঘ্রই চালু হবে।"
              : "This history service will be available soon."}
          </p>
        </div>
      </div>
    );
  };

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
            style={{ backgroundColor: colors.modalBg }}
          >
            <div
              className="relative flex h-[50px] shrink-0 items-center justify-center"
              style={{
                backgroundColor: colors.headerBg,
                color: colors.headerText,
              }}
            >
              <h2 className="text-[18px] font-semibold">{title}</h2>

              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
                style={{ color: colors.closeIconColor }}
              >
                <X size={24} />
              </button>
            </div>

            {/* <TransactionTab activeTab={activeTab} onChange={onTabChange} /> */}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {renderBody()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonHistoryModal;
