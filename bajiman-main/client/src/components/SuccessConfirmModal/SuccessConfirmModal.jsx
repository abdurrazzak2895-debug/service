import React from "react";
import { AnimatePresence, motion } from "framer-motion";

// Generic centered "success" confirmation modal — icon circle + title +
// optional description + one action button. Colors come from the caller's
// already-resolved modal color settings so it matches whichever modal it's
// shown on top of (withdraw, forgot-password, etc.).
const SuccessConfirmModal = ({
  open,
  icon: Icon,
  title,
  description,
  buttonText,
  onButtonClick,
  colors = {},
}) => {
  const iconBg = colors.successBg || "#22c55e";
  const iconColor = colors.successText || "#ffffff";
  const modalBg = colors.modalBg || "#ffffff";
  const titleColor = colors.primaryBg || iconBg;
  const descColor = colors.mutedText || "#555555";
  const buttonBg = colors.primaryBg || iconBg;
  const buttonTextColor = colors.primaryText || "#ffffff";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100020] flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-[340px] rounded-2xl p-6 text-center shadow-2xl"
            style={{ backgroundColor: modalBg }}
          >
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: iconBg }}
            >
              {Icon ? <Icon size={30} color={iconColor} /> : null}
            </div>

            <h3
              className="mt-4 text-[17px] font-bold"
              style={{ color: titleColor }}
            >
              {title}
            </h3>

            {description ? (
              <p
                className="mt-2 text-[13px] leading-5"
                style={{ color: descColor }}
              >
                {description}
              </p>
            ) : null}

            <button
              type="button"
              onClick={onButtonClick}
              className="mt-5 h-[42px] w-full cursor-pointer rounded-[6px] text-[14px] font-bold"
              style={{ backgroundColor: buttonBg, color: buttonTextColor }}
            >
              {buttonText}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessConfirmModal;
