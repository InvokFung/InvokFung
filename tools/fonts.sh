#!/bin/sh
# The fonts the portfolio uses (Google Fonts, OFL), as TTF for opentype.js. Kept out of git.
set -e
cd "$(dirname "$0")" && mkdir -p fonts && cd fonts
get() { curl -sSfo "$1" "$2"; }
get InstrumentSerif-Regular.ttf https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf
get InstrumentSerif-Italic.ttf https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zATiw.ttf
get Inter-Regular.ttf https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf
get Inter-Medium.ttf https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf
get Inter-SemiBold.ttf https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf
get JBMono-Regular.ttf https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf
get JBMono-Medium.ttf https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxjPQ.ttf
