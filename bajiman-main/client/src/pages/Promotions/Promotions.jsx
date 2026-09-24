import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Gift, ChevronRight, Sparkles } from "lucide-react";
import api from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { useSelector } from "react-redux";
import { selectIsAuth } from "../../features/auth/authSelectors";

const CATEGORIES = [
  { key: "all", bn: "সব", en: "All" },
  { key: "Welcome Offer", bn: "ওয়েলকাম", en: "Welcome" },
  { key: "Slots", bn: "স্লট", en: "Slots" },
  { key: "Live Casino", bn: "লাইভ ক্যাসিনো", en: "Live Casino" },
  { key: "Sports", bn: "স্পোর্টস", en: "Sports" },
];

const Promotions = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const isAuth = useSelector(selectIsAuth);
  const [active, setActive] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["promotions-active"],
    queryFn: async () => {
      const res = await api.get("/api/promotions/active/list");
      return res.data;
    },
    staleTime: 30000,
  });

  const promos = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];
    if (active === "all") return list;
    return list.filter((p) => p.category === active);
  }, [data, active]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const text = (obj) => (isBangla ? obj?.bn || obj?.en : obj?.en || obj?.bn) || "";
  const claim = () => navigate(isAuth ? "/deposit" : "/login");

  return (
    <div className="promo-page" data-testid="promotions-page">
      <div className="promo-hero">
        <div className="promo-hero-copy">
          <span className="promo-kicker">
            <Sparkles size={15} /> {isBangla ? "প্রমোশন ও বোনাস" : "PROMOTIONS & BONUS"}
          </span>
          <h1>{isBangla ? "আপনার জন্য সেরা অফার" : "The best offers for you"}</h1>
          <p>
            {isBangla
              ? "ওয়েলকাম, রিলোড ও ক্যাশব্যাক বোনাস দাবি করুন এবং আরও বেশি খেলুন।"
              : "Claim welcome, reload and cashback bonuses and play more."}
          </p>
        </div>
        <div className="promo-hero-mark">
          <Gift size={54} />
        </div>
      </div>

      <div className="promo-tabs" data-testid="promo-category-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            className={active === c.key ? "active" : ""}
            onClick={() => setActive(c.key)}
            data-testid={`promo-tab-${c.key}`}
          >
            {isBangla ? c.bn : c.en}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="promo-status">{isBangla ? "লোড হচ্ছে..." : "Loading..."}</div>
      ) : !promos.length ? (
        <div className="promo-status">
          {isBangla ? "এই মুহূর্তে কোনো প্রমোশন নেই" : "No promotions available right now"}
        </div>
      ) : (
        <div className="promo-grid">
          {promos.map((p) => (
            <article className="promo-card" key={p._id} data-testid="promo-card">
              <div className="promo-card-image">
                {p.imageUrl || p.image ? (
                  <img src={p.imageUrl || p.image} alt={text(p.title)} loading="lazy" />
                ) : (
                  <Gift size={40} />
                )}
                <span className="promo-badge">{p.category}</span>
              </div>
              <div className="promo-card-body">
                <h3>{text(p.title)}</h3>
                <p>{text(p.description)}</p>
                <button
                  type="button"
                  className="promo-claim"
                  onClick={claim}
                  data-testid="promo-claim-btn"
                >
                  {isBangla ? "এখনই দাবি করুন" : "Claim now"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <style>{`
        .promo-page { max-width: 1180px; margin: 0 auto; padding: 20px 16px 60px; color: #e8eef6; }
        .promo-hero { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-radius: 16px; padding: 30px 26px; background: radial-gradient(120% 140% at 100% 0%, rgba(245,185,66,.20), transparent 55%), linear-gradient(135deg, #0d1d30, #0a1522); border: 1px solid rgba(245,185,66,.18); }
        .promo-kicker { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; letter-spacing: .12em; font-weight: 700; color: #f5b942; }
        .promo-hero-copy h1 { margin: 10px 0 6px; font-size: 30px; font-weight: 800; line-height: 1.1; }
        .promo-hero-copy p { margin: 0; color: #9fb2c6; font-size: 14px; max-width: 520px; }
        .promo-hero-mark { flex-shrink: 0; width: 96px; height: 96px; border-radius: 999px; display: grid; place-items: center; color: #1a1206; background: linear-gradient(160deg, #ffd777, #f5b942); box-shadow: 0 12px 30px rgba(245,185,66,.35); }
        .promo-tabs { display: flex; flex-wrap: wrap; gap: 10px; margin: 22px 0; }
        .promo-tabs button { cursor: pointer; padding: 9px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #cdd9e6; background: #10243a; border: 1px solid rgba(255,255,255,.08); transition: background-color .18s, color .18s, border-color .18s; }
        .promo-tabs button:hover { border-color: rgba(245,185,66,.4); }
        .promo-tabs button.active { background: linear-gradient(160deg, #ffd777, #f5b942); color: #1a1206; border-color: transparent; }
        .promo-status { padding: 60px 0; text-align: center; color: #9fb2c6; font-size: 15px; }
        .promo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .promo-card { overflow: hidden; border-radius: 14px; background: #0d1d30; border: 1px solid rgba(255,255,255,.07); display: flex; flex-direction: column; transition: transform .2s, box-shadow .2s, border-color .2s; }
        .promo-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(0,0,0,.45); border-color: rgba(245,185,66,.35); }
        .promo-card-image { position: relative; aspect-ratio: 16/9; background: #0a1522; display: grid; place-items: center; color: #37506c; }
        .promo-card-image img { width: 100%; height: 100%; object-fit: cover; }
        .promo-badge { position: absolute; top: 12px; left: 12px; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 999px; color: #1a1206; background: rgba(245,185,66,.92); backdrop-filter: blur(4px); }
        .promo-card-body { padding: 16px 16px 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .promo-card-body h3 { margin: 0; font-size: 17px; font-weight: 800; color: #fff; }
        .promo-card-body p { margin: 0; font-size: 13px; line-height: 1.5; color: #9fb2c6; flex: 1; }
        .promo-claim { margin-top: 8px; align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; padding: 10px 18px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #1a1206; background: linear-gradient(160deg, #ffd777, #f5b942); border: none; transition: filter .18s, transform .18s; }
        .promo-claim:hover { filter: brightness(1.05); transform: translateX(2px); }
        @media (max-width: 640px) { .promo-hero-copy h1 { font-size: 23px; } .promo-hero-mark { width: 70px; height: 70px; } .promo-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Promotions;
