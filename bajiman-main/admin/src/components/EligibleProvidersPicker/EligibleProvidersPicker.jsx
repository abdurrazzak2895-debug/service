import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/axios";
import { sumEligibleProvidersPercent } from "./eligibleProvidersUtils";

const PROVIDERS_QUERY_KEY = ["eligible-providers-picker-live-providers"];

// Each provider's percent is a dedicated minimum share of the turnover
// this bonus generates (e.g. 50%+50% across two providers splits the
// whole requirement into two dedicated caps); any leftover percent is an
// open pool any provider can fill. Reused across Deposit Bonus &
// Turnover (per method + per promotion), Auto Deposit (per bonus), and
// Register Bonus Campaign — see server/routes/callbackRoutes.js for how
// this is applied at turnover-progress time.
const EligibleProvidersPicker = ({ value, onChange, compact = false }) => {
  const providerPercents = {};

  (Array.isArray(value) ? value : []).forEach((item) => {
    const code = String(item?.providerCode || "").toUpperCase();
    if (code) {
      providerPercents[code] = Math.min(
        100,
        Math.max(0, Number(item?.percent ?? 100)),
      );
    }
  });

  const {
    data: providersRes,
    isLoading: providersLoading,
    isError: providersError,
    error: providersErrorObj,
  } = useQuery({
    queryKey: PROVIDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get("/api/admin/game-api-key/admin/providers");
      return res.data;
    },
    retry: false,
    staleTime: 60000,
  });

  const providers = Array.isArray(providersRes?.data) ? providersRes.data : [];

  const totalPercent = sumEligibleProvidersPercent(
    Object.entries(providerPercents).map(([providerCode, percent]) => ({
      providerCode,
      percent,
    })),
  );
  const openPercent = Math.max(0, 100 - totalPercent);
  const overLimit = totalPercent > 100;
  const selectedCount = Object.keys(providerPercents).length;

  const emitChange = (nextMap) => {
    onChange(
      Object.entries(nextMap).map(([providerCode, percent]) => ({
        providerCode,
        percent,
      })),
    );
  };

  const toggleProvider = (code) => {
    const next = { ...providerPercents };

    if (code in next) {
      delete next[code];
    } else {
      next[code] = 100;
    }

    emitChange(next);
  };

  const setPercent = (code, val) => {
    const clamped = Math.min(100, Math.max(0, Number(val) || 0));
    emitChange({ ...providerPercents, [code]: clamped });
  };

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-blue-300/20 bg-black/20 p-3"
          : "rounded-2xl border border-blue-300/20 bg-black/30 p-4"
      }
    >
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <p className="text-xs font-semibold text-blue-100/70">
          {selectedCount
            ? `${selectedCount} provider(s) selected`
            : "কোনো restriction নেই — সব provider unrestricted"}
        </p>

        {selectedCount ? (
          <span
            className={`inline-flex w-fit rounded-lg border px-2 py-1 text-[11px] font-semibold ${
              overLimit
                ? "border-red-400/40 bg-red-500/10 text-red-200"
                : "border-blue-300/20 bg-black/30 text-blue-100"
            }`}
          >
            Dedicated: {totalPercent}%
            {overLimit ? " — ১০০%-এর বেশি" : ` · Open: ${openPercent}%`}
          </span>
        ) : null}
      </div>

      {providersError ? (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-xs text-red-200">
          {providersErrorObj?.response?.data?.message ||
            "Provider list লোড করা যায়নি। Game API key active/verified আছে কিনা দেখো।"}
        </div>
      ) : providersLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg bg-blue-300/10"
            />
          ))}
        </div>
      ) : providers.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {providers.map((provider) => {
            const code = String(provider.providerCode || "").toUpperCase();
            if (!code) return null;

            const checked = code in providerPercents;
            const percent = providerPercents[code] ?? 100;

            return (
              <div
                key={code}
                className={`rounded-lg border p-2 transition ${
                  checked
                    ? "border-[#63a8ee] bg-[#2f79c9]/20"
                    : "border-blue-300/20 bg-black/30 hover:bg-blue-900/10"
                }`}
              >
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleProvider(code)}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#63a8ee]"
                  />

                  {provider.providerIconUrl ? (
                    <img
                      src={provider.providerIconUrl}
                      alt={provider.providerName}
                      className="h-6 w-6 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <div className="h-6 w-6 shrink-0 rounded bg-blue-300/10" />
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      {provider.providerName}
                    </p>
                    <p className="truncate text-[10px] text-blue-100/60">
                      {code}
                    </p>
                  </div>
                </label>

                {checked && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={percent}
                      onChange={(e) => setPercent(code, e.target.value)}
                      className="h-7 w-full rounded-md border border-blue-300/20 bg-black/40 px-2 text-xs text-white outline-none focus:border-[#63a8ee]"
                    />
                    <span className="text-xs font-semibold text-blue-100/70">
                      %
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-blue-100/60">No providers found.</p>
      )}
    </div>
  );
};

export default EligibleProvidersPicker;
