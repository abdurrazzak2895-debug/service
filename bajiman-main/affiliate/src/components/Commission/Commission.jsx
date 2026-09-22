import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliateGlobalData } from "../../features/global/globalSlice";
import {
  selectAffiliateCommissionSetting,
  selectGlobalLoaded,
  selectGlobalLoading,
} from "../../features/global/globalSelectors";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEFAULT_FLOW_IMAGES = [
  "https://crickexpartner.com/wp-content/uploads/2025/10/1.-win-or-loss.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/2.-cost.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/3.-bonus.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/4.-payment-fee.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/5.-net-profit.png",
  "https://crickexpartner.com/wp-content/uploads/2025/10/6.-50-profit_.png",
];

const DEFAULT_FLOW_TEXT_BN = [
  "কাস্টমার\nজয়/হার",
  "২০%\nঅপারেটিং\nকস্ট",
  "বোনাস",
  "পেমেন্ট ফি",
  "নেট প্রফিট",
  "অ্যাফিলিয়েট\nমোট নেট প্রফিটের\n৫০% আয় করে",
];

const DEFAULT_FLOW_TEXT_EN = [
  "CUSTOMER\nWIN/LOSS",
  "20%\nOPERATING\nCOST",
  "BONUS",
  "PAYMENT FEE",
  "NET PROFIT",
  "AFFILIATE\nEARNS 50%\nOF TOTAL NET\nPROFIT",
];

const makeImageUrl = (path = "") => {
  if (!path) return "";
  if (
    String(path).startsWith("http://") ||
    String(path).startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}/${String(path).replace(/^\/+/, "")}`;
};

const getText = (obj, isBangla, fallback = "") => {
  if (!obj) return fallback;
  return isBangla ? obj.bn || obj.en || fallback : obj.en || obj.bn || fallback;
};

const getColor = (setting, key, fallback) => setting?.[key] || fallback;

const CommissionSkeleton = () => (
  <section className="w-full px-4 py-8 sm:px-6 lg:px-12">
    <div className="mx-auto w-full max-w-[1425px] animate-pulse rounded-md bg-[#edf5fa]/95 px-5 py-10 shadow-lg sm:px-8 lg:px-12">
      <div className="mx-auto mb-8 h-9 w-64 rounded bg-slate-300" />

      <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-5 xl:gap-8">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="flex min-w-[140px] flex-col items-center">
            <div className="mb-4 h-[76px] w-[76px] rounded-lg bg-slate-300" />
            <div className="h-5 w-28 rounded bg-slate-300" />
            <div className="mt-2 h-5 w-20 rounded bg-slate-300" />
          </div>
        ))}
      </div>
    </div>

    <div className="mx-auto mt-16 w-full max-w-[1425px] animate-pulse rounded-md bg-[#edf5fa]/95 px-5 py-10 shadow-lg sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="h-12 rounded-full bg-slate-300" />
        <div className="h-12 rounded-full bg-slate-300" />
        <div className="h-12 rounded-full bg-slate-300" />
      </div>

      <div className="mt-4 space-y-4">
        <div className="h-12 rounded-full bg-slate-300" />
        <div className="h-12 rounded-full bg-slate-300" />
      </div>

      <div className="mt-4 h-4 w-full rounded-full bg-slate-300" />
    </div>
  </section>
);

const Commission = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();

  const globalLoading = useSelector(selectGlobalLoading);
  const globalLoaded = useSelector(selectGlobalLoaded);
  const setting = useSelector(selectAffiliateCommissionSetting);

  useEffect(() => {
    if (!globalLoaded && !globalLoading) {
      dispatch(fetchAffiliateGlobalData());
    }
  }, [dispatch, globalLoaded, globalLoading]);

  const defaultFlowItems = useMemo(
    () =>
      DEFAULT_FLOW_IMAGES.map((image, index) => ({
        image,
        text: isBangla
          ? DEFAULT_FLOW_TEXT_BN[index]
          : DEFAULT_FLOW_TEXT_EN[index],
        operatorAfter:
          index < DEFAULT_FLOW_IMAGES.length - 2
            ? "-"
            : index === DEFAULT_FLOW_IMAGES.length - 2
              ? "="
              : "none",
      })),
    [isBangla],
  );

  const flowItems = useMemo(() => {
    const list = Array.isArray(setting?.flowItems) ? setting.flowItems : [];

    const activeItems = list
      .filter((item) => item?.status !== "inactive")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item) => ({
        image: item.imageUrl || makeImageUrl(item.image),
        text: getText(item.text, isBangla),
        operatorAfter: item.operatorAfter || "none",
      }))
      .filter((item) => item.image || item.text);

    return activeItems.length ? activeItems : defaultFlowItems;
  }, [setting, isBangla, defaultFlowItems]);

  const tableRows = useMemo(() => {
    const rows = Array.isArray(setting?.tableRows) ? setting.tableRows : [];

    const activeRows = rows
      .filter((item) => item?.status !== "inactive")
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((item) => ({
        activePlayers: getText(item.activePlayers, isBangla),
        playerLoss: item.playerLoss || "",
        commission: item.commission || "",
        rowBg: item.rowBg || "#b9efff",
        textColor: item.textColor || "#333333",
      }));

    if (activeRows.length) return activeRows;

    return [
      {
        activePlayers: isBangla ? "৫ থেকে ২০" : "5 to 20",
        playerLoss: "1,000",
        commission: "35%",
        rowBg: "#b9efff",
        textColor: "#333333",
      },
      {
        activePlayers: isBangla ? "২১ এবং তার বেশি" : "21 and Above",
        playerLoss: "1,000",
        commission: "50%",
        rowBg: "#d8f8ff",
        textColor: "#333333",
      },
    ];
  }, [setting, isBangla]);

  const colors = {
    sectionBg: getColor(setting, "sectionBg", "transparent"),
    cardBg: getColor(setting, "cardBg", "#edf5fa"),
    titleColor: getColor(setting, "titleColor", "#192075"),
    flowTextColor: getColor(setting, "flowTextColor", "#303030"),
    operatorColor: getColor(setting, "operatorColor", "#3a3a3a"),
    headerGradientFrom: getColor(setting, "headerGradientFrom", "#1c5d9e"),
    headerGradientTo: getColor(setting, "headerGradientTo", "#4add13"),
    headerTextColor: getColor(setting, "headerTextColor", "#ffffff"),
    bottomBarBg: getColor(setting, "bottomBarBg", "#4ad022"),
  };

  const contentMaxWidth = setting?.contentMaxWidth || "1425px";
  const flowImageSize = setting?.flowImageSize || "76px";

  const table = {
    activePlayers: getText(
      setting?.tableHeadActivePlayers,
      isBangla,
      isBangla ? "অ্যাকটিভ প্লেয়ার" : "ACTIVE PLAYERS",
    ),
    playerLoss: getText(
      setting?.tableHeadPlayerLoss,
      isBangla,
      isBangla ? "প্লেয়ার লস" : "PLAYER LOSS",
    ),
    commission: getText(
      setting?.tableHeadCommission,
      isBangla,
      isBangla ? "কমিশন ৫০%" : "COMMISSION 50%",
    ),
  };

  if (!globalLoaded && globalLoading) {
    return <CommissionSkeleton />;
  }

  return (
    <section
      className="w-full px-4 py-8 sm:px-6 lg:px-12"
      style={{ backgroundColor: colors.sectionBg }}
    >
      <div
        className="mx-auto w-full rounded-md px-5 py-10 shadow-lg sm:px-8 lg:px-12"
        style={{
          maxWidth: contentMaxWidth,
          backgroundColor: colors.cardBg,
        }}
      >
        <h2
          className="mb-8 text-center text-[28px] font-extrabold uppercase tracking-wide drop-shadow-md sm:text-[32px]"
          style={{ color: colors.titleColor }}
        >
          {getText(
            setting?.flowTitle,
            isBangla,
            isBangla ? "কমিশন ফ্লো" : "COMMISSION FLOW",
          )}
        </h2>

        <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-5 xl:gap-8">
          {flowItems.map((item, index) => (
            <React.Fragment key={`${item.image}-${index}`}>
              <div className="flex min-w-[140px] flex-col items-center text-center">
                {item.image && (
                  <img
                    src={item.image}
                    alt={`Commission Flow ${index + 1}`}
                    className="mb-4 rounded-lg object-contain shadow-[0_3px_14px_rgba(0,0,0,0.22)]"
                    style={{
                      height: flowImageSize,
                      width: flowImageSize,
                    }}
                    draggable={false}
                  />
                )}

                <p
                  className="whitespace-pre-line text-[18px] font-extrabold uppercase leading-[1.45] sm:text-[20px]"
                  style={{ color: colors.flowTextColor }}
                >
                  {item.text}
                </p>
              </div>

              {item.operatorAfter !== "none" && (
                <span
                  className="hidden text-[34px] font-extrabold lg:block"
                  style={{ color: colors.operatorColor }}
                >
                  {item.operatorAfter}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div
        className="mx-auto mt-16 w-full rounded-md px-5 py-10 shadow-lg sm:px-8 lg:px-12"
        style={{
          maxWidth: contentMaxWidth,
          backgroundColor: colors.cardBg,
        }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[table.activePlayers, table.playerLoss, table.commission].map(
            (head) => (
              <div
                key={head}
                className="rounded-full px-6 py-3 text-center text-[17px] font-extrabold uppercase md:text-left"
                style={{
                  backgroundImage: `linear-gradient(to right, ${colors.headerGradientFrom}, ${colors.headerGradientTo})`,
                  color: colors.headerTextColor,
                }}
              >
                {head}
              </div>
            ),
          )}
        </div>

        <div className="mt-4 space-y-4">
          {tableRows.map((row, index) => (
            <div
              key={`${row.activePlayers}-${index}`}
              className="grid grid-cols-1 overflow-hidden rounded-full px-6 py-3 text-center text-[16px] font-bold md:grid-cols-3 md:text-left"
              style={{
                backgroundColor: row.rowBg,
                color: row.textColor,
              }}
            >
              <span>{row.activePlayers}</span>
              <span>{row.playerLoss}</span>
              <span>{row.commission}</span>
            </div>
          ))}
        </div>

        <div
          className="mt-4 h-4 w-full rounded-full"
          style={{ backgroundColor: colors.bottomBarBg }}
        />
      </div>
    </section>
  );
};

export default Commission;
