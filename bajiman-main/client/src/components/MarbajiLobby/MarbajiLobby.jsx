import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, Flame, Gamepad2, Play, Search, Sparkles, Trophy } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchGlobalGameData } from "../../features/globalGame/globalGameSlice";
import "./MarbajiLobby.css";
import {
  selectGameCategories,
  selectGlobalGameLoaded,
  selectGlobalGameLoading,
  selectGlobalGames,
  selectHotGames,
  selectPopularGames,
  selectGameProviders,
  selectGlobalGameError,
} from "../../features/globalGame/globalGameSelectors";
import { selectUser, selectUserBalance } from "../../features/auth/authSelectors";

const categoryIcon = (name = "") => {
  const value = name.toLowerCase();
  if (value.includes("sport")) return Trophy;
  if (value.includes("slot") || value.includes("casino")) return Sparkles;
  return Gamepad2;
};

const gameName = (game, isBangla) =>
  String(
    game?.oracleGame?.name ||
      game?.name ||
      game?.gameName ||
      game?.gameUId ||
      (isBangla ? "গেম" : "Game"),
  );

const gameImage = (game) =>
  game?.imageUrl ||
  game?.image ||
  game?.oracleGame?.image ||
  game?.oracleGame?.imageUrl ||
  "";

const gameId = (game) => game?.gameId || game?.id || game?._id;

const vipTiers = [
  { name: "Bronze", min: 0, color: "#c88955" },
  { name: "Silver", min: 5000, color: "#cbd5e1" },
  { name: "Gold", min: 25000, color: "#f5b942" },
  { name: "Platinum", min: 100000, color: "#9dd7ff" },
  { name: "Diamond", min: 500000, color: "#d9b7ff" },
];

const getVip = (balance, user) => {
  const explicit = String(user?.vipTier || user?.vip?.tier || "").trim().toLowerCase();
  return vipTiers.find((tier) => tier.name.toLowerCase() === explicit) ||
    [...vipTiers].reverse().find((tier) => balance >= tier.min) || vipTiers[0];
};

const GameCard = ({ game, isBangla, onPlay }) => {
  const image = gameImage(game);
  return (
    <button type="button" className="mb-lobby-card" onClick={() => onPlay(game)}>
      <div className="mb-lobby-card-image">
        {image ? <img src={image} alt={gameName(game, isBangla)} loading="lazy" /> : <Gamepad2 size={32} />}
        <span className="mb-lobby-play"><Play size={16} fill="currentColor" /></span>
      </div>
      <span className="mb-lobby-card-name">{gameName(game, isBangla)}</span>
      <span className="mb-lobby-card-provider">{game?.provider?.providerName || game?.providerName || "Premium"}</span>
    </button>
  );
};

const Section = ({ icon: Icon, title, games, isBangla, onPlay, onMore }) => {
  const visible = (Array.isArray(games) ? games : []).filter((game) => gameId(game)).slice(0, 8);
  if (!visible.length) return null;
  return (
    <section className="mb-lobby-section">
      <div className="mb-lobby-section-heading">
        <div className="mb-lobby-section-title"><Icon size={18} /> <h2>{title}</h2></div>
        <button type="button" className="mb-lobby-more" onClick={onMore}>{isBangla ? "আরও" : "More"}<ChevronRight size={16} /></button>
      </div>
      <div className="mb-lobby-grid">{visible.map((game) => <GameCard key={String(gameId(game))} game={game} isBangla={isBangla} onPlay={onPlay} />)}</div>
    </section>
  );
};

const MarbajiLobby = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const categories = useSelector(selectGameCategories);
  const providers = useSelector(selectGameProviders);
  const games = useSelector(selectGlobalGames);
  const hotGames = useSelector(selectHotGames);
  const popularGames = useSelector(selectPopularGames);
  const loaded = useSelector(selectGlobalGameLoaded);
  const loading = useSelector(selectGlobalGameLoading);
  const error = useSelector(selectGlobalGameError);
  const user = useSelector(selectUser);
  const userBalance = useSelector(selectUserBalance);
  const vip = getVip(userBalance, user);
  const carouselSlides = [
    { eyebrow: isBangla ? "আজকের স্পেশাল" : "TODAY'S SPECIAL", title: isBangla ? "গোল্ডেন গেমিং নাইট" : "Golden gaming night", text: isBangla ? "প্রিমিয়াম গেমে আপনার ভাগ্য পরীক্ষা করুন" : "Try your luck across premium games.", className: "gold" },
    { eyebrow: isBangla ? "স্পোর্টস লাইভ" : "LIVE SPORTS", title: isBangla ? "প্রতিটি মুহূর্তে জয়" : "Win every moment", text: isBangla ? "স্পোর্টস ও লাইভ অ্যাকশনে যোগ দিন" : "Join the action across sports and live play.", className: "blue" },
    { eyebrow: isBangla ? "ভিআইপি সুবিধা" : "VIP PRIVILEGES", title: isBangla ? "আপনার স্ট্যাটাস বাড়ান" : "Level up your status", text: isBangla ? "আরও খেলুন, আরও সুবিধা পান" : "Play more and unlock more benefits.", className: "violet" },
  ];

  useEffect(() => {
    if (!loaded) dispatch(fetchGlobalGameData());
  }, [dispatch, loaded]);

  useEffect(() => {
    if (carouselPaused) return undefined;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % carouselSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [carouselPaused, carouselSlides.length]);

  const filteredGames = useMemo(() => {
    let list = Array.isArray(games) ? games : [];
    if (activeCategory !== "all") {
      list = list.filter((game) => String(game?.categoryId) === String(activeCategory));
    }
    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter((game) => `${gameName(game, false)} ${game?.provider?.providerName || game?.providerName || ""}`.toLowerCase().includes(term));
    }
    return list;
  }, [games, activeCategory, query]);

  const play = (game) => {
    const id = gameId(game);
    if (id) navigate(`/play-game/${id}?uid=${encodeURIComponent(game?.gameUId || "")}`);
  };

  const openCategory = () => navigate(activeCategory === "all" ? "/games" : `/games?categoryId=${activeCategory}&providerDbId=all`);
  const title = isBangla ? "আপনার গেমিং জগৎ" : "Your gaming world";

  return (
    <main className="mb-lobby">
      <header className="mb-lobby-catalog-header">
        <div className="mb-lobby-brand"><span className="mb-lobby-brand-mark">MB</span><div><strong>MARBAJI</strong><small>{isBangla ? "প্রিমিয়াম গেমিং লাউঞ্জ" : "PREMIUM GAMING LOUNGE"}</small></div></div>
        <nav className="mb-lobby-header-links" aria-label="Lobby navigation"><button type="button" onClick={() => setActiveCategory("all")}>{isBangla ? "হোম" : "Home"}</button><button type="button" onClick={openCategory}>{isBangla ? "সব গেম" : "All games"}</button><button type="button" onClick={() => navigate("/deposit")}>{isBangla ? "ডিপোজিট" : "Deposit"}</button></nav>
        <div className="mb-lobby-header-status"><span className="mb-lobby-status-dot" />{isBangla ? "লাইভ সাপোর্ট" : "Live support"}</div>
      </header>
      <section className="mb-lobby-carousel" onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)} aria-label="Promotional banners">
        {carouselSlides.map((slide, index) => (
          <article key={slide.title} className={`mb-lobby-slide ${slide.className} ${index === activeSlide ? "is-active" : ""}`} aria-hidden={index !== activeSlide}>
            <div className="mb-lobby-slide-copy"><span className="mb-lobby-kicker">{slide.eyebrow}</span><h2>{slide.title}</h2><p>{slide.text}</p><button type="button" className="mb-lobby-cta" onClick={openCategory}>{isBangla ? "খেলুন" : "Explore"}<ChevronRight size={17} /></button></div>
            <div className="mb-lobby-slide-orb"><Sparkles size={48} /></div>
          </article>
        ))}
        <button type="button" className="mb-lobby-carousel-arrow prev" onClick={() => setActiveSlide((activeSlide - 1 + carouselSlides.length) % carouselSlides.length)} aria-label="Previous banner"><ArrowLeft size={17} /></button>
        <button type="button" className="mb-lobby-carousel-arrow next" onClick={() => setActiveSlide((activeSlide + 1) % carouselSlides.length)} aria-label="Next banner"><ArrowRight size={17} /></button>
        <div className="mb-lobby-dots">{carouselSlides.map((slide, index) => <button type="button" key={slide.title} className={index === activeSlide ? "active" : ""} onClick={() => setActiveSlide(index)} aria-label={`Show banner ${index + 1}`} />)}</div>
      </section>
      <div className="mb-lobby-hero">
        <div className="mb-lobby-hero-glow" />
        <div className="mb-lobby-hero-copy"><span className="mb-lobby-kicker">{isBangla ? "প্রিমিয়াম গেমিং" : "PREMIUM GAMING"}</span><h1>{title}</h1><p>{isBangla ? "সেরা স্পোর্টস, ক্যাসিনো ও স্লট গেম এক জায়গায়" : "Sports, casino and slot favorites in one place."}</p><button type="button" className="mb-lobby-cta" onClick={openCategory}>{isBangla ? "এখনই খেলুন" : "Play now"}<ChevronRight size={17} /></button></div>
        <div className="mb-lobby-hero-mark"><Trophy size={54} /><span>PLAY<br />BOLD</span></div>
      </div>

      <section className="mb-lobby-vip" style={{ "--vip-color": vip.color }}>
        <div className="mb-lobby-vip-badge"><Trophy size={21} /><span>VIP</span></div>
        <div className="mb-lobby-vip-copy"><span>{isBangla ? "আপনার বর্তমান স্তর" : "Your current tier"}</span><strong>{vip.name}</strong><small>{isBangla ? "ব্যালেন্সের ভিত্তিতে" : "Based on current balance"}</small></div>
        <div className="mb-lobby-vip-meter"><div className="mb-lobby-vip-meter-head"><span>{isBangla ? "লয়্যালটি প্রগ্রেস" : "Loyalty progress"}</span><b>{userBalance.toLocaleString()} {user?.currency || "BDT"}</b></div><div className="mb-lobby-vip-track"><span style={{ width: `${Math.min(100, Math.max(8, (userBalance / (vip.min + (vip.min || 5000))) * 100))}%` }} /></div><small>{isBangla ? "পরবর্তী স্তরের সুবিধা আনলক করুন" : "Keep playing to unlock the next tier"}</small></div>
      </section>

      <div className="mb-lobby-toolbar">
        <div className="mb-lobby-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isBangla ? "গেম খুঁজুন..." : "Search games..."} /></div>
        <div className="mb-lobby-providers">{(providers || []).slice(0, 6).map((provider) => <span key={String(provider?._id || provider?.id || provider?.providerCode)}>{provider?.providerName || provider?.providerCode}</span>)}</div>
      </div>

      <nav className="mb-lobby-categories" aria-label="Game categories">
        <button type="button" className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}><Gamepad2 size={17} />{isBangla ? "সব" : "All"}</button>
        {(categories || []).slice(0, 7).map((category) => { const name = category?.categoryName?.en || category?.categoryTitle?.en || "Games"; const Icon = categoryIcon(name); return <button type="button" key={String(category?._id)} className={activeCategory === category?._id ? "active" : ""} onClick={() => setActiveCategory(category?._id)}><Icon size={17} />{isBangla ? category?.categoryName?.bn || name : name}</button>; })}
      </nav>

      {loading && <div className="mb-lobby-status">{isBangla ? "গেম লোড হচ্ছে..." : "Loading games..."}</div>}
      {error && <div className="mb-lobby-status error">{isBangla ? "গেম লোড করা যায়নি" : "Could not load games"}</div>}
      {!loading && !error && query && <Section icon={Search} title={isBangla ? "সার্চ রেজাল্ট" : "Search results"} games={filteredGames} isBangla={isBangla} onPlay={play} onMore={openCategory} />}
      {!query && <><Section icon={Flame} title={isBangla ? "জনপ্রিয় গেম" : "Popular games"} games={popularGames} isBangla={isBangla} onPlay={play} onMore={openCategory} /><Section icon={Sparkles} title={isBangla ? "সব গেম" : "All games"} games={filteredGames} isBangla={isBangla} onPlay={play} onMore={openCategory} /></>}
      <footer className="mb-lobby-footer"><div><strong>MARBAJI</strong><span>{isBangla ? "খেলুন দায়িত্বশীলভাবে • ১৮+" : "Play responsibly • 18+"}</span></div><div className="mb-lobby-footer-links"><button type="button">{isBangla ? "শর্তাবলি" : "Terms"}</button><button type="button">{isBangla ? "গোপনীয়তা" : "Privacy"}</button><button type="button">{isBangla ? "সাপোর্ট" : "Support"}</button></div><small>© {new Date().getFullYear()} Marbaji</small></footer>
    </main>
  );
};

export default MarbajiLobby;
