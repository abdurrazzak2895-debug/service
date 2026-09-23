import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { RefreshCcw, X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectIsAuth, selectUser } from "../../features/auth/authSelectors";
import Loading from "../../components/Loading/Loading";

const API_BASE = "";

const PlayGame = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();

  const { isBangla } = useLanguage();

  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);

  const token =
    localStorage.getItem("user_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const [loading, setLoading] = useState(true);
  const [launchUrl, setLaunchUrl] = useState("");
  const [errorText, setErrorText] = useState("");
  const [hasTried, setHasTried] = useState(false);

  const uidFromQuery = searchParams.get("uid") || "";

  const t = (bn, en) => (isBangla ? bn : en);

  const isActiveUser = useMemo(() => {
    if (!user) return true;
    return user?.isActive !== false;
  }, [user]);

  const extractLaunchUrl = (data) => {
    return (
      data?.gameUrl ||
      data?.launch_url ||
      data?.launchUrl ||
      data?.data?.launch_url ||
      data?.data?.launchUrl ||
      data?.data?.gameUrl ||
      data?.url ||
      data?.data?.url ||
      ""
    );
  };

  const launchGame = async () => {
    if (!gameId) {
      toast.error(t("গেম আইডি পাওয়া যায়নি", "Game ID not found"));
      navigate("/", { replace: true });
      return;
    }

    if (!isAuth || !token) {
      toast.error(t("খেলতে লগইন করুন", "Please login to play"));
      navigate("/", { replace: true });
      return;
    }

    if (!isActiveUser) {
      toast.error(
        t("আপনার একাউন্ট অ্যাক্টিভ নয়", "Your account is not active"),
      );
      navigate("/", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setErrorText("");
      setHasTried(true);

      let resolvedGameUid = uidFromQuery || gameId;

      if (!uidFromQuery) {
        const gameLookupResponse = await axios.get(
          `${API_BASE}/api/global/client/play-game/${encodeURIComponent(gameId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          },
        );

        const gameData = gameLookupResponse?.data?.data || {};
        resolvedGameUid = gameData?.gameUId || gameData?.game_uid || gameId;
      }

      const payload = {
        gameID: resolvedGameUid,
        game_uid: resolvedGameUid,
        gameId: resolvedGameUid,
      };

      const res = await axios.post(
        `${API_BASE}/api/game/launch`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      const data = res?.data || {};
      const url = extractLaunchUrl(data);

      if (!url || typeof url !== "string") {
        setErrorText(t("গেম URL পাওয়া যায়নি", "No game URL received"));
        toast.error(t("গেম URL পাওয়া যায়নি", "No game URL received"));
        setLaunchUrl("");
        return;
      }

      setLaunchUrl(url);
    } catch (error) {
      console.error("PlayGame launch error:", error?.response?.data || error);

      const providerCode = error?.response?.data?.code;
      const message =
        providerCode === "NINEWICKET_REQUIRES_INITIAL_CREDIT"
          ? t(
              "নতুন ব্যবহারকারীর জন্য প্রথমবার একটি positive amount দিয়ে গেম চালু করুন। এরপর zero balance হলেও পুরোনো 9Wicket wallet reopen করা যাবে।",
              "This is a new 9Wicket account. Launch once with a positive amount; after that, zero-balance reopen is supported.",
            )
          : error?.response?.data?.message ||
        t("গেম চালু করা যায়নি", "Failed to launch game");

      setErrorText(message);
      setLaunchUrl("");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    launchGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, uidFromQuery, isAuth, token, isActiveUser]);

  return (
    <div
      className={`fixed inset-0 z-9999 ${loading ? "bg-transparent" : "bg-black"}`}
    >
      {/* Small Close Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute right-3 top-3 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {/* Loading */}
      <Loading
        open={loading}
        text={t("গেম প্রস্তুত করা হচ্ছে...", "Preparing your game...")}
      />

      {/* Error State */}
      {!loading && !launchUrl && (
        <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-white">
          <div className="max-w-[420px] rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h2 className="mb-2 text-lg font-semibold">
              {t("গেম চালু হয়নি", "Game launch failed")}
            </h2>

            <p className="mb-5 text-sm text-white/80">
              {errorText ||
                t(
                  "গেম চালু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                  "There was a problem launching the game. Please try again.",
                )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={launchGame}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#0b66a8] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#09578f]"
              >
                <RefreshCcw size={16} />
                {t("আবার চেষ্টা করুন", "Try Again")}
              </button>

              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {t("হোমে যান", "Go Home")}
              </button>
            </div>

            {hasTried && (
              <p className="mt-4 text-xs text-white/50">
                {t(
                  "সমস্যা থাকলে পরে আবার চেষ্টা করুন",
                  "If the issue continues, please try again later",
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Game iframe */}
      {!loading && launchUrl && (
        <iframe
          src={launchUrl}
          title="Game"
          className="h-full w-full border-0"
          allow="fullscreen; autoplay"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default PlayGame;
