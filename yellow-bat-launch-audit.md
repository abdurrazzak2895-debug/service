# Live Provider Launch Configuration Audit

**Snapshot:** 2026-09-25 19:56 UTC
**Source:** `http://128.140.100.85/api/global/client/game-data`

## Current launch routing

| Route | Provider codes | Required launch configuration |
|---|---|---|
| 9Wicket | `WORLD_141`, `9W`, `9WICKET`, `9WICKETS`, or provider name `9wicket`/`9wickets` | `NINEWICKET_TOKEN` or `WORLD_CASINO_TOKEN`; `NINEWICKET_SECRET` or `WORLD_CASINO_SECRET` (exactly 32 UTF-8 bytes); callback/return/currency settings; static egress relay or proxy when required |
| Oracle-compatible | `WORLD_92`, `WORLD_133` by default; extendable with `ORACLE_PROVIDER_CODES` | `ORACLE_LAUNCH_KEY`; optional `ORACLE_GAME_LAUNCH_URL` (defaults to `https://oraclegames.net/api/game/launch`) |
| Unsupported | All other provider codes | No launch adapter; environment variables alone do not enable them |

## Yellow Bat (`WORLD_166`)

Yellow Bat is currently **unsupported** and returns `PROVIDER_LAUNCH_NOT_CONFIGURED`.

There is no `YELLOW_BAT_*` configuration in the repository. Do not point it at the 9Wicket endpoint or reuse 9Wicket credentials.

### Possible Oracle-compatible configuration (only if Yellow Bat confirms this contract)

```dotenv
ORACLE_PROVIDER_CODES=WORLD_92,WORLD_133,WORLD_166
ORACLE_GAME_LAUNCH_URL=https://<provider-confirmed-launch-endpoint>
ORACLE_LAUNCH_KEY=<provider-confirmed-launch-key>
```

The Oracle adapter sends:

```json
{
  "amount": "<integer local balance>",
  "username": "<generated 10-letter player name>",
  "game_uid": "<catalog gameUId>"
}
```

with header `x-oracle-key: <ORACLE_LAUNCH_KEY>`. This option is valid only after the provider confirms that Yellow Bat accepts this exact payload, header, balance model, and returned launch URL format.

### Possible SoftAPI/IGAMING configuration (requires code wiring first)

```dotenv
SOFTAPI_LAUNCH_URL=https://<provider-account-launch-endpoint>
SOFTAPI_TOKEN=<provider-token>
SOFTAPI_SECRET=<exactly-32-byte-secret>
SOFTAPI_CALLBACK_URL=https://<backend>/api/softapi/callback
SOFTAPI_RETURN_URL=https://<client>/lobby
SOFTAPI_GAME_UID=<provider-game-code>
SOFTAPI_CURRENCY_CODE=BDT
SOFTAPI_CALLBACK_ENCRYPTION_MODE=required
```

`IGAMING_LAUNCH_URL`, `IGAMING_API_TOKEN`, `IGAMING_API_SECRET`, and `IGAMING_GAME_UID` are supported aliases. The existing SoftAPI adapter is intentionally **not wired into** `/api/game/launch`; it needs an explicit provider mapping and wallet-reconciliation policy before it can be used for Yellow Bat.

## Live provider results

- **Total providers:** 128
- **Configured 9Wicket:** 1 (`WORLD_141`, 9wickets)
- **Configured Oracle-compatible:** 2 (`WORLD_92`, YGRGaming; `WORLD_133`, KA)
- **Unconfigured:** 125

The complete unconfigured list is below.

| Provider code | Provider name |
|---|---|
| `WORLD_101` | Turbogames World |
| `WORLD_102` | OneGaming |
| `WORLD_104` | Mini |
| `WORLD_105` | 2J |
| `WORLD_106` | EpicWin |
| `WORLD_107` | Smartsoft |
| `WORLD_108` | Wonwon |
| `WORLD_109` | BtGaming |
| `WORLD_110` | Pix |
| `WORLD_111` | Galaxsys |
| `WORLD_112` | InOut |
| `WORLD_113` | V8 CARD |
| `WORLD_114` | WM CASINO |
| `WORLD_117` | EazyGaming |
| `WORLD_118` | BtiGaming |
| `WORLD_121` | OnGaming |
| `WORLD_122` | AOG |
| `WORLD_123` | PgsGaming |
| `WORLD_124` | Expanse |
| `WORLD_125` | FAST SPIN |
| `WORLD_126` | SBO |
| `WORLD_128` | Askmeslot |
| `WORLD_129` | Vplus |
| `WORLD_130` | Casini |
| `WORLD_132` | MT GAMING |
| `WORLD_134` | Casino Game (CG) |
| `WORLD_135` | Crowdplay |
| `WORLD_136` | RubyPlay |
| `WORLD_137` | Amigo |
| `WORLD_138` | ATM |
| `WORLD_139` | Aviatrix |
| `WORLD_142` | CMD |
| `WORLD_143` | CreedRoomz |
| `WORLD_144` | Ag |
| `WORLD_145` | BG |
| `WORLD_146` | RG |
| `WORLD_147` | WintoSlot |
| `WORLD_148` | WintoLive |
| `WORLD_149` | topbet |
| `WORLD_150` | Evolution-BTG Row |
| `WORLD_152` | Endorphina |
| `WORLD_153` | Casino |
| `WORLD_154` | EVO888H5 |
| `WORLD_156` | GAMINGSOFT-WOW |
| `WORLD_157` | GAMINGSOFT-AI LIVE CASINO |
| `WORLD_158` | Live22 |
| `WORLD_159` | VeliPlay |
| `WORLD_160` | PenguinKing |
| `WORLD_161` | 18Peaches |
| `WORLD_162` | 9game |
| `WORLD_163` | Funky Games |
| `WORLD_164` | VA |
| `WORLD_165` | ATG |
| `WORLD_166` | Yellow Bat |
| `WORLD_167` | Rectangle |
| `WORLD_169` | PSG |
| `WORLD_171` | EEAi |
| `WORLD_173` | SpadeGaming |
| `WORLD_174` | Aura Gaming |
| `WORLD_175` | Betby |
| `WORLD_178` | BigGaming |
| `WORLD_179` | Titi Gaming |
| `WORLD_180` | BetSoft |
| `WORLD_181` | Darpha |
| `WORLD_182` | KY Gaming |
| `WORLD_184` | Mancala (暂停使用) |
| `WORLD_185` | Revenge |
| `WORLD_186` | Aviator |
| `WORLD_187` | DB |
| `WORLD_188` | Tydo |
| `WORLD_189` | PlayStar |
| `WORLD_190` | XGaming |
| `WORLD_191` | Palace Originals |
| `WORLD_192` | LightWonder |
| `WORLD_193` | GreenTube |
| `WORLD_194` | Amusnet |
| `WORLD_195` | Onlyplay |
| `WORLD_197` | Barbara Bang |
| `WORLD_198` | Kalamba |
| `WORLD_199` | 18Peaches Sweepstakes |
| `WORLD_200` | CyberBetX |
| `WORLD_202` | BHARAT MATKA |
| `WORLD_45` | PGSoft |
| `WORLD_46` | SABASports(IBC) |
| `WORLD_48` | UnitedGaming |
| `WORLD_49` | JILI |
| `WORLD_50` | JDB |
| `WORLD_51` | TADAGaming |
| `WORLD_52` | CQ9 |
| `WORLD_53` | PragmaticPlay-EU |
| `WORLD_54` | PragmaticPlay-Asia |
| `WORLD_55` | PragmaticPlayLive-EU |
| `WORLD_56` | PragmaticPlayLive-Asia |
| `WORLD_57` | Spribe |
| `WORLD_58` | Evolution Live |
| `WORLD_60` | YeeBet |
| `WORLD_61` | FaChaiGaming |
| `WORLD_62` | BigTimeGaming |
| `WORLD_64` | GameArt |
| `WORLD_65` | Bgaming |
| `WORLD_67` | NoLimit City |
| `WORLD_68` | Netent |
| `WORLD_70` | RelaxGaming |
| `WORLD_71` | Skywind |
| `WORLD_72` | Playtech |
| `WORLD_73` | PlaynGo |
| `WORLD_74` | RedTiger |
| `WORLD_76` | Playson |
| `WORLD_77` | Evoplay |
| `WORLD_78` | Ezugi |
| `WORLD_79` | iDeal |
| `WORLD_80` | T1 |
| `WORLD_81` | PlayAce(AgGaming) |
| `WORLD_82` | Astar |
| `WORLD_83` | LuckySport |
| `WORLD_84` | Rich88 |
| `WORLD_85` | TF |
| `WORLD_86` | NextSpin |
| `WORLD_87` | DreamGaming |
| `WORLD_88` | Sexy |
| `WORLD_89` | Sagaming |
| `WORLD_90` | Microgaming |
| `WORLD_91` | Habanero |
| `WORLD_99` | Hacksaw World |
| `YGR` | Ygr |

## Conclusion

The three configured routes are the only launch paths currently present in code. The other 125 catalog providers need either a provider-specific adapter, a confirmed Oracle-compatible mapping, or a confirmed SoftAPI/IGAMING mapping. Adding only an environment variable is safe for Oracle-compatible providers because `ORACLE_PROVIDER_CODES` is an explicit allow-list; it is not sufficient for arbitrary providers.
