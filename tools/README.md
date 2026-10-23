# How the profile is drawn

Everything on the profile is an SVG in `assets/`, built by the scripts here. Text is set as paths,
because an SVG shown as an image can't load fonts.

| File | Built by | What it is |
| --- | --- | --- |
| `assets/banner.svg` | `banner/` | The homepage's cover at first light. The scene and the sea are real frames of the portfolio's own renderer; the SVG sets the name over them, crossfades the sea, drifts the mist and opens on the dawn. |
| `assets/work/*.svg` | `cards.js` | A card per flagship: a small live motif, the name, the measured number and one line. Numbers come from the portfolio's `assets/portfolio/data.js`. |
| `assets/toolbox.svg` | `toolbox.js` | The stack, with logos from Simple Icons (CC0). |
| `assets/ridge.svg` | `ridge.mjs` | The last year of contributions as a ridge. `.github/workflows/ridge.yml` redraws it every day; it needs no packages, only `ridge-glyphs.json` (made by `ridge-glyphs.js`). |

To rebuild:

```sh
cd tools && npm install && ./fonts.sh && cd ..
node tools/cards.js assets/work
node tools/toolbox.js assets/toolbox.svg
node tools/ridge-glyphs.js tools/ridge-glyphs.json

# the banner needs the portfolio running (python3 -m http.server 8765 in invokfung.github.io) and Playwright
node tools/banner/render.js 1200 400 1.5 tools/banner/layers
python3 tools/banner/encode.py tools/banner/layers
node tools/banner/build.js tools/banner/layers assets/banner.svg
```
