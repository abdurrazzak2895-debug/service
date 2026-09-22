export const sumEligibleProvidersPercent = (value) =>
  (Array.isArray(value) ? value : []).reduce(
    (sum, item) => sum + Number(item?.percent || 0),
    0,
  );
