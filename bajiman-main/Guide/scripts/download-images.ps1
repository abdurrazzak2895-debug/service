# Downloads the remaining Guide-site images (hosted on i.ibb.co) into src/assets.
# Run this from anywhere; it resolves paths relative to this script's location.
# Usage:  powershell -ExecutionPolicy Bypass -File .\download-images.ps1

$ErrorActionPreference = "Stop"
$base = Join-Path (Split-Path $PSScriptRoot -Parent) "src\assets"

$pairs = @(
  @{ url = "https://i.ibb.co/G4tRV6Hx/imgi-169-hat.png";                                                 dest = "vip\hat.png" },
  @{ url = "https://i.ibb.co/rR2XJX62/imgi-154-777-Rapid-Gems.png";                                       dest = "games\777-rapid-gems.png" },
  @{ url = "https://i.ibb.co/xtxk5N9y/imgi-153-Adventure-Of-the-West-FASTSPIN.png";                       dest = "games\adventure-of-the-west.png" },
  @{ url = "https://i.ibb.co/DH9fPqxc/imgi-152-Blossom-Of-wealth-JDB.png";                                dest = "games\blossom-of-wealth.png" },
  @{ url = "https://i.ibb.co/Z65J1HDG/imgi-151-Crazy-777-2.png";                                          dest = "games\crazy-777.png" },
  @{ url = "https://i.ibb.co/GvwfqnPS/imgi-150-Fortune-Dragon-CQ8.png";                                   dest = "games\fortune-dragon.png" },
  @{ url = "https://i.ibb.co/YFmD2SkX/imgi-149-Friuty-Bonaza-JDB.png";                                    dest = "games\fruity-bonanza.png" },
  @{ url = "https://i.ibb.co/rKpD3Wx2/imgi-147-Golden-Genie-FC-CHAI.png";                                 dest = "games\golden-genie.png" },
  @{ url = "https://i.ibb.co/dsMZHmTf/imgi-48-Extra-Sicbo.png";                                           dest = "games\extra-sicbo.png" },
  @{ url = "https://i.ibb.co/qF3ZSJZK/imgi-144-Lucky-Tiger.png";                                          dest = "games\lucky-tiger.png" },
  @{ url = "https://i.ibb.co/v6hZDHRN/imgi-143-MAGIC-ACE-JDB.png";                                        dest = "games\magic-ace.png" },
  @{ url = "https://i.ibb.co/pr101Yzy/imgi-139-Poseidon-CQ9.png";                                         dest = "games\poseidon.png" },
  @{ url = "https://i.ibb.co/DH5FBqkr/365-365.webp";                                                      dest = "refer\my-account.webp" },
  @{ url = "https://i.ibb.co/zTnL7mMV/Step1-1.webp";                                                      dest = "refer\refer-bonus.webp" },
  @{ url = "https://i.ibb.co/ynhrGg4f/Step2-2.webp";                                                      dest = "refer\share-button.webp" },
  @{ url = "https://i.ibb.co/HTDX6pJR/Step3-1.webp";                                                      dest = "refer\share-friends.webp" },
  @{ url = "https://i.ibb.co/2YYCYGhz/reward-img-1.webp";                                                 dest = "leaderboard\silver-badge.webp" },
  @{ url = "https://i.ibb.co/C3RsyVWs/reward-img-2.webp";                                                 dest = "leaderboard\gold-badge.webp" },
  @{ url = "https://i.ibb.co/SXC6NPQ0/reward-img-3.webp";                                                 dest = "leaderboard\bronze-badge.webp" },
  @{ url = "https://i.ibb.co/HD18x9t6/imgi-32-slot-machine-min.png";                                      dest = "vip\slot-machine.png" },
  @{ url = "https://i.ibb.co/k2ZxkpPZ/imgi-29-suitcase.png";                                              dest = "vip\suitcase.png" },
  @{ url = "https://i.ibb.co/cKm9PJC3/imgi-33-open-gift-box-min.png";                                     dest = "vip\gift-box.png" },
  @{ url = "https://i.ibb.co/hJFb69V4/commision-level.webp";                                              dest = "rebate\commission-level.webp" },
  @{ url = "https://i.ibb.co/Jwk2Vts1/person-img.webp";                                                   dest = "rebate\person-img.webp" },
  @{ url = "https://i.ibb.co/214PkZ6n/imgi-172-BG.png";                                                   dest = "vip\club-bg.png" },
  @{ url = "https://i.ibb.co/bR5mtN8p/imgi-7-megaphone.png";                                              dest = "vip\megaphone.png" },
  @{ url = "https://i.ibb.co/npt4Dcm/c5097541-0c54-45e5-9074-a0b400127f67-Photoroom.png";                 dest = "vip\vip-club-logo.png" },
  @{ url = "https://i.ibb.co/Xk8hDLzk/imgi-9-bronze-act.webp";                                            dest = "vip-tiers\bronze.webp" },
  @{ url = "https://i.ibb.co/zThMKxXc/imgi-10-bronze-inact.webp";                                         dest = "vip-tiers\silver.webp" },
  @{ url = "https://i.ibb.co/S4TtK1nC/imgi-13-gold-active.webp";                                          dest = "vip-tiers\gold.webp" },
  @{ url = "https://i.ibb.co/gMkmM3vq/imgi-16-emerald-inactive.webp";                                     dest = "vip-tiers\emerald.webp" },
  @{ url = "https://i.ibb.co/btdVnqn/imgi-18-ruby-inactive.webp";                                         dest = "vip-tiers\ruby.webp" },
  @{ url = "https://i.ibb.co/nX2ppwc/imgi-19-diamond-active.webp";                                        dest = "vip-tiers\diamond.webp" },
  @{ url = "https://i.ibb.co/F4zFSLwx/imgi-21-saphhire-active.webp";                                      dest = "vip-tiers\sapphire.webp" }
)

$failed = @()

foreach ($pair in $pairs) {
  $destPath = Join-Path $base $pair.dest
  $destDir = Split-Path $destPath -Parent
  if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
  }

  try {
    Invoke-WebRequest -Uri $pair.url -OutFile $destPath -UserAgent "Mozilla/5.0" -TimeoutSec 30
    Write-Output "OK: $($pair.dest)"
  } catch {
    Write-Output "FAIL: $($pair.url) -> $($pair.dest) ($($_.Exception.Message))"
    $failed += $pair.url
  }
}

if ($failed.Count -gt 0) {
  Write-Output ""
  Write-Output "$($failed.Count) file(s) failed to download. Re-run this script to retry them."
} else {
  Write-Output ""
  Write-Output "All images downloaded successfully."
}
