import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SidebarItem = ({
  item,
  label,
  active,
  expanded,
  desktop = false,
  onClick,
}) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full cursor-pointer items-center justify-between transition-all duration-200 ease-in-out ${
        desktop
          ? `h-[50px] px-6 text-white ${
              active
                ? "bg-[#37a2ff] shadow-[inset_4px_0_0_0_#ffffff]"
                : "bg-[#0b66a8] hover:bg-[#1979c9]"
            }`
          : `h-[53px] px-3 text-[#1b1b1b] hover:bg-[#f2f8ff] ${
              active ? "bg-[#eef7ff]" : "bg-white"
            }`
      }`}
    >
      {active && !desktop && (
        <span className="absolute left-0 top-0 h-full w-[4px] bg-[#0b66a8]" />
      )}

      <div className="flex items-center gap-3">
        <span
          className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-white transition-all duration-200 ${
            desktop
              ? active
                ? "bg-[#1666b1]"
                : "bg-[#075893]"
              : "bg-[#0b5183]"
          }`}
        >
          {Icon && <Icon size={19} strokeWidth={2} />}
        </span>

        <span
          className={`whitespace-nowrap text-[15px] ${
            desktop ? "font-bold text-white" : "font-medium text-[#111]"
          }`}
        >
          {label}
        </span>
      </div>

      {item.children && desktop && (
        <span className="text-white">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      )}
    </button>
  );
};

export default SidebarItem;