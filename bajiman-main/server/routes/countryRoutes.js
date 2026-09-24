import express from "express";

const router = express.Router();

// Curated fallback list (server-side, no external dependency) so the
// register modal's country/dial-code picker always works even when the
// upstream provider is unreachable. Bangladesh first-class supported.
const FALLBACK = [
  { name: "Bangladesh", code: "+880", cca2: "BD" },
  { name: "India", code: "+91", cca2: "IN" },
  { name: "Pakistan", code: "+92", cca2: "PK" },
  { name: "Nepal", code: "+977", cca2: "NP" },
  { name: "Sri Lanka", code: "+94", cca2: "LK" },
  { name: "Bhutan", code: "+975", cca2: "BT" },
  { name: "Myanmar", code: "+95", cca2: "MM" },
  { name: "Malaysia", code: "+60", cca2: "MY" },
  { name: "Singapore", code: "+65", cca2: "SG" },
  { name: "Indonesia", code: "+62", cca2: "ID" },
  { name: "Thailand", code: "+66", cca2: "TH" },
  { name: "Philippines", code: "+63", cca2: "PH" },
  { name: "Vietnam", code: "+84", cca2: "VN" },
  { name: "United Arab Emirates", code: "+971", cca2: "AE" },
  { name: "Saudi Arabia", code: "+966", cca2: "SA" },
  { name: "Qatar", code: "+974", cca2: "QA" },
  { name: "Kuwait", code: "+965", cca2: "KW" },
  { name: "Oman", code: "+968", cca2: "OM" },
  { name: "Bahrain", code: "+973", cca2: "BH" },
  { name: "United Kingdom", code: "+44", cca2: "GB" },
  { name: "United States", code: "+1", cca2: "US" },
  { name: "Canada", code: "+1", cca2: "CA" },
  { name: "Australia", code: "+61", cca2: "AU" },
  { name: "China", code: "+86", cca2: "CN" },
  { name: "Japan", code: "+81", cca2: "JP" },
  { name: "South Korea", code: "+82", cca2: "KR" },
  { name: "Turkey", code: "+90", cca2: "TR" },
  { name: "South Africa", code: "+27", cca2: "ZA" },
  { name: "Nigeria", code: "+234", cca2: "NG" },
  { name: "Germany", code: "+49", cca2: "DE" },
  { name: "France", code: "+33", cca2: "FR" },
  { name: "Italy", code: "+39", cca2: "IT" },
  { name: "Spain", code: "+34", cca2: "ES" },
  { name: "Brazil", code: "+55", cca2: "BR" },
];

const withFlags = (list) =>
  list
    .map((c) => ({
      name: c.name,
      code: c.code,
      cca2: c.cca2,
      flag: `https://flagcdn.com/w40/${String(c.cca2).toLowerCase()}.png`,
    }))
    .filter((c) => c.name && c.code && c.cca2)
    .sort((a, b) => a.name.localeCompare(b.name));

let cache = null;

router.get("/", async (req, res) => {
  if (cache) {
    return res.json({ success: true, message: "Countries", data: cache });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const r = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags",
      { signal: controller.signal },
    );
    clearTimeout(timer);

    const data = await r.json();

    const list = (Array.isArray(data) ? data : [])
      .map((c) => {
        const root = c?.idd?.root || "";
        const suffix = c?.idd?.suffixes?.[0] || "";
        return {
          name: c?.name?.common || "",
          code: `${root}${suffix}`.trim(),
          cca2: c?.cca2 || "",
        };
      })
      .filter((c) => c.name && c.code && c.cca2);

    const result = list.length ? withFlags(list) : withFlags(FALLBACK);
    cache = result;
    return res.json({ success: true, message: "Countries", data: result });
  } catch (error) {
    const result = withFlags(FALLBACK);
    cache = result;
    return res.json({
      success: true,
      message: "Countries (fallback)",
      data: result,
    });
  }
});

export default router;
