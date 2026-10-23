// Renders the homepage cover at banner size: the scene with no name, no wisps and no mist (those are
// drawn by the SVG so they can move), a few frames of the drifting sea, and the wisp/mist tiles.
// With the portfolio (invokfung.github.io) served at $SITE (default http://localhost:8765):
// node tools/banner/render.js 1200 400 1.5 tools/banner/layers
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
(async () => {
  const [W, H, D, out] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: +D, serviceWorkers: 'block' });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '.foot,.folio,.thread,.skip{display:none!important} .cover .name h1{color:transparent!important;text-shadow:none!important}';
      document.head.appendChild(s);
      document.querySelectorAll('.cover .w1, .cover .w2, .cover .m1').forEach(e => e.remove());
    });
  });
  await p.goto(`${process.env.SITE || 'http://localhost:8765'}/?q=high`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(6000);
  for (let i = 0; i < 4; i++) {
    await p.screenshot({ path: `${out}/f${i}.png` });
    await p.waitForTimeout(2500);
  }
  // the wisp and mist tiles, painted by the site's own painters with the cover's palette
  const tiles = await p.evaluate(async () => {
    const art = await import('/lab/unfold/art.js');
    const pal = { mist: '#ffd6aa', wisp: ['#b08a96', '#ffd2aa'] };
    return { w4: art.paintWisp(pal.wisp[0], pal.wisp[1], 4).toDataURL(), w9: art.paintWisp(pal.wisp[0], pal.wisp[1], 9).toDataURL(), mist: art.paintMist(pal.mist).toDataURL() };
  });
  for (const [k, v] of Object.entries(tiles)) fs.writeFileSync(`${out}/${k}.png`, Buffer.from(v.split(',')[1], 'base64'));
  await b.close();
})();
