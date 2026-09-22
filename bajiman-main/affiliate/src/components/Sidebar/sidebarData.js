import {
  Home,
  Flame,
  Trophy,
  Gift,
  Users,
  Handshake,
  Award,
  Ticket,
  Dice5,
  Rocket,
  CircleDot,
  Gamepad2,
  Fish,
  Crown,
  Building2,
} from "lucide-react";

export const topMenus = [
  { key: "home", bn: "হোম", en: "Home", icon: Home, path: "/" },
  {
    key: "promotion",
    bn: "প্রমোশন",
    en: "Promotion",
    icon: Gift,
    path: "/promotion",
  },
  {
    key: "referral",
    bn: "রেফারেল",
    en: "Referral",
    icon: Users,
    path: "/referral",
  },
  {
    key: "sponsor",
    bn: "স্পনসরশিপ",
    en: "Sponsorship",
    icon: Handshake,
    path: "/sponsorship",
  },
  {
    key: "leaderboard",
    bn: "লিডারবোর্ড",
    en: "Leaderboard",
    icon: Building2,
    path: "/leaderboard",
  },
  {
    key: "winner",
    bn: "বিজয়ীদের তালিকা",
    en: "Winner List",
    icon: Award,
    path: "/winner-list",
  },
];

export const gameMenus = [
  {
    key: "hot",
    bn: "হট গেম",
    en: "Hot Game",
    icon: Flame,
    path: "/hot-games",
  },

  {
    key: "sports",
    bn: "স্পোর্ট",
    en: "Sports",
    icon: Trophy,

    children: [
      {
        id: 1,
        name: { bn: "ক্রিকেট", en: "CRICKET" },
        image:
          "https://img.c88rx.com/cx/h5/assets/images/icon-set/sports-icon/icon-exchange.png?v=1779771685731",
        path: "/sports/cricket",
      },

      {
        id: 2,
        name: { bn: "সাবা", en: "SABA" },
        image:
          "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-saba.png?v=1779771685731",
        path: "/sports/saba",
      },

      {
        id: 3,
        name: { bn: "বিটিআই", en: "BTi" },
        image:
          "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-sbtech.png?v=1779771685731",
        path: "/sports/bti",
      },

      {
        id: 4,
        name: { bn: "এসবিও", en: "SBO" },
        image:
          "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-sbov2.png?v=1779771685731",
        path: "/sports/sbo",
      },

      {
        id: 5,
        name: { bn: "হর্স", en: "HORSE" },
        image:
          "https://img.c88rx.com/cx/h5/assets/images/icon-set/sports-icon/icon-horsebook.png?v=1779771685731",
        path: "/sports/horse",
      },

      {
        id: 6,
        name: { bn: "সিএমডি", en: "CMD" },
        image:
          "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-cmd.png?v=1779771685731",
        path: "/sports/cmd",
      },

      {
        id: 7,
        name: { bn: "পিনাকল", en: "PINNACLE" },
        image:
          "https://img.c88rx.com/cx/h5/assets/images/brand/black/provider-awcv2_pinnacle.png?v=1779771685731",
        path: "/sports/pinnacle",
      },
    ],
  },

  {
    key: "casino",
    bn: "ক্যাসিনো",
    en: "Casino",
    icon: Ticket,
    path: "/casino",
  },

  {
    key: "slot",
    bn: "স্লট",
    en: "Slot",
    icon: Dice5,
    path: "/slot",
  },

  {
    key: "crash",
    bn: "ক্র্যাশ",
    en: "Crash",
    icon: Rocket,
    path: "/crash",
  },

  {
    key: "table",
    bn: "টেবিল",
    en: "Table",
    icon: CircleDot,
    path: "/table",
  },

  {
    key: "fishing",
    bn: "ফিশিং",
    en: "Fishing",
    icon: Fish,
    path: "/fishing",
  },

  {
    key: "arcade",
    bn: "আর্কেড",
    en: "Arcade",
    icon: Gamepad2,
    path: "/arcade",
  },

  {
    key: "lottery",
    bn: "লটারি",
    en: "Lottery",
    icon: CircleDot,
    path: "/lottery",
  },
];

export const otherMenus = [
  {
    key: "rank",
    bn: "প্রমোশন",
    en: "Promotion",
    icon: Gift,
    path: "/promotion",
  },
  { key: "vip", bn: "ভিআইপি", en: "VIP", icon: Crown, path: "/vip" },
];
