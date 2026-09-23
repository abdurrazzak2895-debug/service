import React, { useMemo, useState } from "react";
import { ArrowLeft, Coins, Gamepad2, RotateCcw, Sparkles } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";

const STARTING_CREDITS = 2000;
const STORAGE_KEY = "bajiman_demo_wallet_v1";

const readWallet = (gameId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const existing = saved?.[gameId];
    if (existing && Number.isFinite(Number(existing.balance))) return existing;
  } catch {
    // Use a fresh demo wallet when local storage is unavailable or invalid.
  }
  return { balance: STARTING_CREDITS, plays: 0 };
};

const DemoGame = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const [wallet, setWallet] = useState(() => readWallet(gameId));
  const [message, setMessage] = useState("Try the demo with virtual credits only.");
  const [playing, setPlaying] = useState(false);
  const gameUid = searchParams.get("uid") || gameId || "demo-game";
  const title = useMemo(() => `Demo Game ${gameUid}`, [gameUid]);

  const saveWallet = (next) => {
    setWallet(next);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, [gameId]: next }));
    } catch {
      // The demo still works for the current session if storage is blocked.
    }
  };

  const playRound = () => {
    if (playing) return;
    const stake = 25;
    if (wallet.balance < stake) {
      setMessage("Demo credits are finished. Reset the demo wallet to play again.");
      return;
    }
    setPlaying(true);
    window.setTimeout(() => {
      const won = Math.random() > 0.55;
      const payout = won ? stake * 2 : 0;
      const next = { balance: wallet.balance - stake + payout, plays: wallet.plays + 1 };
      saveWallet(next);
      setMessage(won ? `Demo win: +${payout} virtual credits` : `Demo round complete: -${stake} virtual credits`);
      setPlaying(false);
    }, 650);
  };

  const reset = () => {
    const next = { balance: STARTING_CREDITS, plays: 0 };
    saveWallet(next);
    setMessage("Your 2,000 virtual demo credits were restored.");
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-auto bg-[#071321] text-white">
      <div className="mx-auto flex min-h-full w-full max-w-[980px] flex-col px-4 py-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#c8d5e3] hover:text-[#ffcf67]"><ArrowLeft size={17} /> Back</button>
          <span className="flex items-center gap-2 text-xs font-bold tracking-[.18em] text-[#ffcf67]"><Sparkles size={16} /> DEMO MODE</span>
          <button type="button" onClick={reset} className="flex items-center gap-2 text-xs text-[#9eafc1] hover:text-white"><RotateCcw size={15} /> Reset</button>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#f5b942]/40 bg-[#10243a] text-[#f5b942] shadow-[0_0_45px_rgba(245,185,66,.18)]"><Gamepad2 size={38} /></div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#91a5ba]">Virtual play only</p>
          <h1 className="mb-3 text-center text-3xl font-black text-white sm:text-5xl">{title}</h1>
          <p className="mb-8 text-center text-sm text-[#9eafc1]">No deposit, no provider wallet, no cashout. This is a local demo experience.</p>
          <section className="w-full max-w-[520px] rounded-3xl border border-[#f5b942]/30 bg-[#10243a] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between"><div><span className="block text-xs uppercase tracking-widest text-[#91a5ba]">Demo credits</span><strong className="mt-1 block text-4xl font-black text-[#ffcf67]">{wallet.balance.toLocaleString()}</strong></div><Coins className="text-[#f5b942]" size={34} /></div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#243a50]"><span className="block h-full rounded-full bg-gradient-to-r from-[#c88955] via-[#f5b942] to-[#ffcf67]" style={{ width: `${Math.min(100, (wallet.balance / STARTING_CREDITS) * 100)}%` }} /></div>
            <button type="button" disabled={playing} onClick={playRound} className="w-full rounded-xl bg-[#f5b942] px-5 py-3 font-black text-[#1e1606] transition hover:bg-[#ffcf67] disabled:cursor-wait disabled:opacity-60">{playing ? "Playing demo..." : "Play demo round · 25 credits"}</button>
            <p className="mt-4 text-center text-xs text-[#9eafc1]">{message}</p>
            <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-xs text-[#8195aa]"><span>Rounds played: {wallet.plays}</span><span>Starting wallet: 2,000</span></div>
          </section>
        </main>
        <footer className="border-t border-white/10 py-4 text-center text-[11px] text-[#71879d]">Demo mode is for testing the interface only. Virtual credits have no cash value.</footer>
      </div>
    </div>
  );
};

export default DemoGame;
