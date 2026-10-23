// Writes ridge-glyphs.json for tools/ridge.mjs: the digits it sets numbers in, and its labels, as
// paths, so the workflow that redraws the ridge needs no fonts and no packages.
// node tools/ridge-glyphs.js tools/ridge-glyphs.json
const fs = require('fs');
const { createGlyphs, font } = require('./glyphs.js');
const out = process.argv[2];
const f = font('serifI'), s = 1000 / f.unitsPerEm;
const digits = {};
for (const ch of '0123456789,') {
  const g = f.charToGlyph(ch);
  const d = g.path.commands.map((c) => {
    const P = (x, y) => `${Math.round(x * s)} ${Math.round(-y * s)}`;
    return c.type === 'M' ? 'M' + P(c.x, c.y) : c.type === 'L' ? 'L' + P(c.x, c.y) : c.type === 'Q' ? 'Q' + P(c.x1, c.y1) + ' ' + P(c.x, c.y) : c.type === 'C' ? 'C' + P(c.x1, c.y1) + ' ' + P(c.x2, c.y2) + ' ' + P(c.x, c.y) : 'Z';
  }).join('');
  digits[ch] = { d, adv: Math.round(g.advanceWidth * s) };
}
const G = createGlyphs('r');
const LABELS = {
  total: 'CONTRIBUTIONS, LAST 12 MONTHS',
  week: 'BUSIEST WEEK',
  streak: 'LONGEST STREAK, DAYS'
};
const labels = {};
for (const [k, t] of Object.entries(LABELS)) labels[k] = { g: G.text('monoM', t, 0, 0, 12, { track: 0.16 }), w: +G.measure('monoM', t, 12, 0.16).toFixed(1) };
fs.writeFileSync(out, JSON.stringify({ digits, labels, defs: G.defsSvg() }));
console.log(out, (fs.statSync(out).size / 1024).toFixed(1) + ' KB');
