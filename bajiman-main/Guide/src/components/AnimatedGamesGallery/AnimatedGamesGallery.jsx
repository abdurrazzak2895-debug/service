import React, { useMemo } from "react";

import { useLanguage } from "../../Context/LanguageProvider";
import rapidGemsImage from "../../assets/games/777-rapid-gems.png";
import adventureOfTheWestImage from "../../assets/games/adventure-of-the-west.png";
import blossomOfWealthImage from "../../assets/games/blossom-of-wealth.png";
import crazy777Image from "../../assets/games/crazy-777.png";
import fortuneDragonImage from "../../assets/games/fortune-dragon.png";
import fruityBonanzaImage from "../../assets/games/fruity-bonanza.png";
import goldenGenieImage from "../../assets/games/golden-genie.png";
import extraSicboImage from "../../assets/games/extra-sicbo.png";
import luckyTigerImage from "../../assets/games/lucky-tiger.png";
import magicAceImage from "../../assets/games/magic-ace.png";
import poseidonImage from "../../assets/games/poseidon.png";

const baseGames = [
  {
    id: 1,
    image: rapidGemsImage,
    name: {
      en: "777 Rapid Gems",
      bn: "৭৭৭ র‍্যাপিড জেমস",
    },
  },
  {
    id: 2,
    image: adventureOfTheWestImage,
    name: {
      en: "Adventure Of The West",
      bn: "অ্যাডভেঞ্চার অফ দ্য ওয়েস্ট",
    },
  },
  {
    id: 3,
    image: blossomOfWealthImage,
    name: {
      en: "Blossom Of Wealth",
      bn: "ব্লসম অফ ওয়েলথ",
    },
  },
  {
    id: 4,
    image: crazy777Image,
    name: {
      en: "Crazy 777",
      bn: "ক্রেজি ৭৭৭",
    },
  },
  {
    id: 5,
    image: fortuneDragonImage,
    name: {
      en: "Fortune Dragon",
      bn: "ফরচুন ড্রাগন",
    },
  },
  {
    id: 6,
    image: fruityBonanzaImage,
    name: {
      en: "Fruity Bonanza",
      bn: "ফ্রুটি বোনাঞ্জা",
    },
  },
  {
    id: 7,
    image: goldenGenieImage,
    name: {
      en: "Golden Genie",
      bn: "গোল্ডেন জিনি",
    },
  },
  {
    id: 8,
    image: extraSicboImage,
    name: {
      en: "Extra Sicbo",
      bn: "এক্সট্রা সিকবো",
    },
  },
  {
    id: 9,
    image: luckyTigerImage,
    name: {
      en: "Lucky Tiger",
      bn: "লাকি টাইগার",
    },
  },
  {
    id: 10,
    image: magicAceImage,
    name: {
      en: "Magic Ace",
      bn: "ম্যাজিক এস",
    },
  },
  {
    id: 11,
    image: poseidonImage,
    name: {
      en: "Poseidon",
      bn: "পোসাইডন",
    },
  },
];

const AnimatedGamesGallery = () => {
  const { isBangla } = useLanguage();

  /*
   * ১১টি game repeat করে মোট ৪৪টি card তৈরি করা হয়েছে।
   */
  const allGames = useMemo(() => {
    return Array.from({ length: 44 }, (_, index) => {
      const game = baseGames[index % baseGames.length];

      return {
        ...game,
        uniqueId: `${game.id}-${index}`,
      };
    });
  }, []);

  /*
   * ৪৪টি game তিনটি row-তে ভাগ করা হয়েছে:
   * Row 1 = 15
   * Row 2 = 15
   * Row 3 = 14
   */
  const gameRows = useMemo(() => {
    return [
      allGames.slice(0, 15),
      allGames.slice(15, 30),
      allGames.slice(30, 44),
    ];
  }, [allGames]);

  const sectionLabel = isBangla ? "জনপ্রিয় গেমসমূহ" : "Popular Games";

  return (
    <section
      className="animated-games-gallery relative w-full overflow-hidden border-y-[3px] border-[#e5b925] bg-[#073691] py-4 sm:py-5"
      aria-label={sectionLabel}
    >
      {/* Accessible bilingual title */}
      <h2 className="sr-only">{sectionLabel}</h2>

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[80px] -top-[220px] h-[520px] w-[180px] rotate-[-25deg] bg-[#194da4]/55" />

        <div className="absolute left-[44%] -top-[250px] h-[540px] w-[160px] rotate-[24deg] bg-[#154798]/25" />

        <div className="absolute -right-[80px] -top-[230px] h-[530px] w-[170px] rotate-[24deg] bg-[#174b9e]/45" />
      </div>

      <div className="relative z-10 flex flex-col gap-3 sm:gap-4 lg:gap-[20px]">
        {gameRows.map((row, rowIndex) => (
          <GameMarqueeRow
            key={rowIndex}
            games={row}
            isBangla={isBangla}
            reverse={rowIndex === 1}
            duration={rowIndex === 0 ? 38 : rowIndex === 1 ? 42 : 36}
          />
        ))}
      </div>

      {/* Side fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-[30px] bg-gradient-to-r from-[#073691] to-transparent sm:w-[55px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-[30px] bg-gradient-to-l from-[#073691] to-transparent sm:w-[55px]" />

      <style>
        {`
          @keyframes gameMarqueeLeft {
            from {
              transform: translateX(0);
            }

            to {
              transform: translateX(-50%);
            }
          }

          .games-marquee-track {
            display: flex;
            width: max-content;
            will-change: transform;
            animation-name: gameMarqueeLeft;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }

          .games-marquee-reverse {
            animation-direction: reverse;
          }

          .animated-games-gallery:hover .games-marquee-track {
            animation-play-state: paused;
          }

          .game-gallery-card {
            transform: translateZ(0);
            backface-visibility: hidden;
          }

          .game-gallery-card img {
            transform: translateZ(0);
          }

          @media (prefers-reduced-motion: reduce) {
            .games-marquee-track {
              animation-play-state: paused;
            }
          }
        `}
      </style>
    </section>
  );
};

const GameMarqueeRow = ({
  games,
  isBangla,
  reverse = false,
  duration = 40,
}) => {
  /*
   * একই row দুইবার render করা হয়েছে,
   * যাতে animation শেষ হওয়ার সময় কোনো ফাঁকা জায়গা না আসে।
   */
  return (
    <div className="w-full overflow-hidden">
      <div
        className={`games-marquee-track ${
          reverse ? "games-marquee-reverse" : ""
        }`}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        <GameGroup games={games} isBangla={isBangla} groupKey="first" />

        <GameGroup
          games={games}
          isBangla={isBangla}
          groupKey="second"
          hiddenFromScreenReader
        />
      </div>
    </div>
  );
};

const GameGroup = ({
  games,
  isBangla,
  groupKey,
  hiddenFromScreenReader = false,
}) => {
  return (
    <div
      className="flex shrink-0 gap-2 pr-2 sm:gap-3 sm:pr-3 lg:gap-[12px] lg:pr-[12px]"
      aria-hidden={hiddenFromScreenReader}
    >
      {games.map((game, index) => {
        const gameName = isBangla ? game.name.bn : game.name.en;

        return (
          <button
            key={`${groupKey}-${game.uniqueId}-${index}`}
            type="button"
            title={gameName}
            aria-label={gameName}
            className="game-gallery-card group relative h-[105px] w-[77px] shrink-0 cursor-pointer overflow-hidden rounded-[7px] bg-[#082a66] shadow-[0_3px_8px_rgba(0,0,0,0.25)] transition-all duration-300 hover:z-10 hover:scale-105 hover:shadow-[0_6px_15px_rgba(0,0,0,0.4)] sm:h-[135px] sm:w-[96px] sm:rounded-[8px] md:h-[150px] md:w-[108px] lg:h-[120px] lg:w-[90px] xl:h-[145px] xl:w-[105px]"
          >
            <img
              src={game.image}
              alt={gameName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              loading="lazy"
              draggable={false}
            />

            {/* Hover overlay */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        );
      })}
    </div>
  );
};

export default AnimatedGamesGallery;
