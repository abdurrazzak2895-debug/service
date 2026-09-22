import React, { useEffect, useRef, useState } from "react";

import jackpotBg from "../../assets/jackpot.png";

const formatAmount = (value) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const useJackpotCounter = (base, ratePerSecond) => {
  const [value, setValue] = useState(base);
  const valueRef = useRef(base);
  const lastTsRef = useRef(null);

  useEffect(() => {
    let rafId;

    const tick = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const deltaSeconds = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      valueRef.current += ratePerSecond * deltaSeconds;
      setValue(valueRef.current);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ratePerSecond]);

  return value;
};

const numberStyle = {
  color: "#ffe9a8",
  textShadow: "0 1px 3px rgba(0,0,0,0.7)",
};

const JackpotBanner = () => {
  const grand = useJackpotCounter(825586.08, 18);
  const mini = useJackpotCounter(4107.85, 0.9);
  const major = useJackpotCounter(188561.79, 6);

  return (
    <div
      className="relative mb-4 w-full overflow-hidden rounded-sm aspect-1200/400 md:aspect-1200/300"
    >
      <img
        src={jackpotBg}
        alt="Jackpot"
        className="absolute inset-0 h-full w-full object-cover"
        draggable="false"
      />

      <div
        className="absolute left-[11.44%] top-[33.3%] flex h-[21%] w-[48.22%] items-center justify-center md:left-[21.1%] md:w-[36.2%]"
      >
        <span
          className="text-[13px] font-black sm:text-[20px] md:text-[28px]"
          style={numberStyle}
        >
          {formatAmount(grand)}
        </span>
      </div>

      <div
        className="absolute left-[10.22%] top-[72.7%] flex h-[19%] w-[24.67%] items-center justify-center md:left-[20.2%] md:w-[18.5%]"
      >
        <span
          className="text-[10px] font-black sm:text-[14px] md:text-[20px]"
          style={numberStyle}
        >
          {formatAmount(mini)}
        </span>
      </div>

      <div
        className="absolute left-[36%] top-[72.7%] flex h-[19%] w-[24.78%] items-center justify-center md:left-[39.5%] md:w-[18.6%]"
      >
        <span
          className="text-[10px] font-black sm:text-[14px] md:text-[20px]"
          style={numberStyle}
        >
          {formatAmount(major)}
        </span>
      </div>
    </div>
  );
};

export default JackpotBanner;
