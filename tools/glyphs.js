// Text as SVG paths, since an SVG shown as an <img> can't load web fonts. Each glyph is defined once
// (in a 1000-unit em, y down) and placed with <use>, so repeated letters cost a few bytes each.
const opentype = require('opentype.js');
const path = require('path');
const FONTS = {
  serif: 'InstrumentSerif-Regular.ttf', serifI: 'InstrumentSerif-Italic.ttf',
  sans: 'Inter-Regular.ttf', sansM: 'Inter-Medium.ttf', sansB: 'Inter-SemiBold.ttf',
  mono: 'JBMono-Regular.ttf', monoM: 'JBMono-Medium.ttf'
};
const loaded = {};
const font = (k) => (loaded[k] ||= opentype.loadSync(path.join(__dirname, 'fonts', FONTS[k])));

function createGlyphs(prefix = 'g') {
  const defs = new Map(); // id -> path d
  const id = (k, g) => {
    const key = `${prefix}${k}${g.index}`;
    if (!defs.has(key)) {
      const s = 1000 / font(k).unitsPerEm;
      const cmds = g.path.commands.map((c) => {
        const P = (x, y) => `${Math.round(x * s)} ${Math.round(-y * s)}`;
        switch (c.type) {
          case 'M': return 'M' + P(c.x, c.y);
          case 'L': return 'L' + P(c.x, c.y);
          case 'Q': return 'Q' + P(c.x1, c.y1) + ' ' + P(c.x, c.y);
          case 'C': return 'C' + P(c.x1, c.y1) + ' ' + P(c.x2, c.y2) + ' ' + P(c.x, c.y);
          case 'Z': return 'Z';
        }
      }).join('');
      defs.set(key, cmds);
    }
    return key;
  };
  // advance width of a string at a size, with tracking (em units) and kerning
  function measure(k, str, size, track = 0) {
    const f = font(k), s = size / f.unitsPerEm, gs = f.stringToGlyphs(str);
    let w = 0;
    gs.forEach((g, i) => { w += g.advanceWidth * s + track * size; if (i < gs.length - 1) w += f.getKerningValue(g, gs[i + 1]) * s; });
    return w - (gs.length ? track * size : 0);
  }
  // <use> elements for a run of text; anchor: start | middle | end
  function text(k, str, x, y, size, { track = 0, anchor = 'start', fill, cls, extra = '' } = {}) {
    const f = font(k), s = size / f.unitsPerEm, gs = f.stringToGlyphs(str);
    let cx = x - (anchor === 'middle' ? measure(k, str, size, track) / 2 : anchor === 'end' ? measure(k, str, size, track) : 0);
    const k1000 = size / 1000;
    const parts = [];
    gs.forEach((g, i) => {
      if (g.path.commands.length) parts.push(`<use href="#${id(k, g)}" x="${(cx / k1000).toFixed(0)}" y="${(y / k1000).toFixed(0)}"/>`);
      cx += g.advanceWidth * s + track * size;
      if (i < gs.length - 1) cx += f.getKerningValue(g, gs[i + 1]) * s;
    });
    return `<g transform="scale(${+k1000.toFixed(5)})"${fill ? ` fill="${fill}"` : ''}${cls ? ` class="${cls}"` : ''}${extra}>${parts.join('')}</g>`;
  }
  // wrap words into lines no wider than w
  function wrap(k, str, size, w, track = 0) {
    const words = str.split(' '), lines = [];
    let line = '';
    for (const wd of words) {
      const t = line ? line + ' ' + wd : wd;
      if (measure(k, t, size, track) > w && line) { lines.push(line); line = wd; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  const defsSvg = () => [...defs].map(([k, d]) => `<path id="${k}" d="${d}"/>`).join('');
  return { text, measure, wrap, defsSvg, font };
}
module.exports = { createGlyphs, font };
