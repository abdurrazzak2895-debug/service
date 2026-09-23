import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, Flame, Gamepad2, Play, Search, Sparkles, Trophy } from "lucide-react";
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
  const categories = useSelector(selectGameCategories);
  const providers = useSelector(selectGameProviders);
  const games = useSelector(selectGlobalGames);
  const hotGames = useSelector(selectHotGames);
  const popularGames = useSelector(selectPopularGames);
  const loaded = useSelector(selectGlobalGameLoaded);
  const loading = useSelector(selectGlobalGameLoading);
  const error = useSelector(selectGlobalGameError);

  useEffect(() => {
    if (!loaded) dispatch(fetchGlobalGameData());
  }, [dispatch, loaded]);

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
      <div className="mb-lobby-hero">
        <div className="mb-lobby-hero-glow" />
        <div className="mb-lobby-hero-copy"><span className="mb-lobby-kicker">{isBangla ? "প্রিমিয়াম গেমিং" : "PREMIUM GAMING"}</span><h1>{title}</h1><p>{isBangla ? "সেরা স্পোর্টস, ক্যাসিনো ও স্লট গেম এক জায়গায়" : "Sports, casino and slot favorites in one place."}</p><button type="button" className="mb-lobby-cta" onClick={openCategory}>{isBangla ? "এখনই খেলুন" : "Play now"}<ChevronRight size={17} /></button></div>
        <div className="mb-lobby-hero-mark"><Trophy size={54} /><span>PLAY<br />BOLD</span></div>
      </div>

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
    </main>
  );
};

export default MarbajiLobby;
