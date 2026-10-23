// Builds one card per flagship: a small live motif of what the project does, its name, the number
// that proves it, and one line. Text is drawn as paths (an SVG shown as an <img> can't load fonts).
// node tools/cards.js assets/work
const fs = require('fs');
const { createGlyphs } = require('./glyphs.js');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });

const W = 480, H = 262, BAND = 122, PAD = 28;
const INK = '#ecebe6', DIM = '#a9a4ae', BG0 = '#100f16', BG1 = '#17141f';

// What each card says. Numbers are the measured ones the portfolio shows (assets/portfolio/data.js).
const CARDS = [
  { id: 'relay', name: 'Relay', kind: 'LLM gateway', color: '#ffb547', n: '99.98%', unit: 'answered in an outage', line: 'Take a deployment down. The answers keep landing.' },
  { id: 'tracewise', name: 'Tracewise', kind: 'Observability', color: '#62b6ff', n: '98.9%', unit: 'culprit named first', line: 'Break a service. The traces name the culprit.' },
  { id: 'onboard', name: 'Onboard', kind: 'Customer data', color: '#4fe3c1', n: '0.977', unit: 'match F1', line: 'Three messy exports in, one customer table out.' },
  { id: 'dispatch', name: 'Dispatch', kind: 'Field service', color: '#ff7ab6', n: '97.0%', unit: 'on time on a bad day', line: 'A technician calls in sick. The day re-plans itself.' },
  { id: 'atlas', name: 'Atlas', kind: 'Search, no server', color: '#a78bfa', n: '85%', unit: 'right first time', line: 'Ask my notes anything. No server, no model.' },
  { id: 'studio', name: 'Intonation Studio', kind: 'Real-time audio', color: '#c8ff4a', n: '0.17¢', unit: 'worst error', line: 'Play a scale. It hears every note to a fraction of a cent.' },
  { id: 'layerline', name: 'Layerline', kind: 'Geometry + WebAssembly', color: '#ff8a65', n: '21 ms', unit: 'to slice a gear', line: 'Drop in an STL, get G-code. 66 KB of WebAssembly.' },
  { id: 'shelf', name: 'The whole shelf', kind: 'invokfung.github.io', color: '#ecebe6', n: '174', unit: 'notes so far', line: 'Older experiments, the history, and StudyLog.' }
];

const f = (v) => +v.toFixed(1);
const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/* ------------------------------------------------------------------ motifs, each in the band (W x BAND) */
const M = {};

// Requests flow through the gateway's stages; half the time the primary region is down and they
// fail over to the other one.
M.relay = (c) => {
  const y = 50, xs = Array.from({ length: 7 }, (_, i) => 44 + i * 40), fork = xs[6];
  const up = `M${fork} ${y} C ${fork + 40} ${y} ${fork + 40} 30 ${fork + 80} 30 L 430 30`;
  const dn = `M${fork} ${y} C ${fork + 40} ${y} ${fork + 40} 76 ${fork + 80} 76 L 430 76`;
  const trunk = `M20 ${y} L ${fork} ${y}`;
  const dots = (path, n, dur, cls) => Array.from({ length: n }, (_, i) => `<circle r="3" fill="${c}" class="${cls}"><animateMotion dur="${dur}s" repeatCount="indefinite" begin="-${f(i * dur / n)}s" path="${path}"/></circle>`).join('');
  return `<style>
.up{animation:upl 8s infinite} .dn{animation:dnl 8s infinite} .x{animation:x 8s infinite}
@keyframes upl{0%,44%{opacity:1}50%,94%{opacity:0}100%{opacity:1}}
@keyframes dnl{0%,44%{opacity:0}50%,94%{opacity:1}100%{opacity:0}}
@keyframes x{0%,44%{opacity:0}50%,94%{opacity:1}100%{opacity:0}}
</style>
<path d="${trunk}" stroke="${c}" stroke-opacity=".25" stroke-width="1.5" fill="none"/>
<path d="${up}" stroke="${c}" stroke-opacity=".25" stroke-width="1.5" fill="none"/>
<path d="${dn}" stroke="${c}" stroke-opacity=".25" stroke-width="1.5" fill="none"/>
${xs.map((x) => `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="4" fill="${BG1}" stroke="${c}" stroke-opacity=".7"/>`).join('')}
<rect x="430" y="21" width="28" height="18" rx="5" fill="${BG1}" stroke="${c}" stroke-opacity=".7"/>
<rect x="430" y="67" width="28" height="18" rx="5" fill="${BG1}" stroke="${c}" stroke-opacity=".7"/>
<g class="x"><rect x="430" y="21" width="28" height="18" rx="5" fill="#ff5d5d" fill-opacity=".22" stroke="#ff5d5d"/><path d="M439 25.5l10 9M449 25.5l-10 9" stroke="#ff5d5d" stroke-width="1.6"/></g>
<g class="mv">${dots(trunk, 6, 2.4, '')}<g class="up">${dots(up, 2, 1.2, '')}</g><g class="dn">${dots(dn, 2, 1.2, '')}</g></g>`;
};

// A trace's waterfall: spans open one under another; one runs long and is named the culprit.
M.tracewise = (c) => {
  const spans = [[30, 400], [48, 250], [70, 120], [70, 300], [110, 90], [124, 60]];
  const bad = 3;
  return `<style>
.sp{transform-box:fill-box;transform-origin:left;animation:grow 7s cubic-bezier(.3,.7,.3,1) infinite}
@keyframes grow{0%{transform:scaleX(0)}14%,86%{transform:scaleX(1)}96%,100%{transform:scaleX(0)}}
.bad{animation-name:growbad}
@keyframes growbad{0%,8%{transform:scaleX(0)}40%,86%{transform:scaleX(1)}96%,100%{transform:scaleX(0)}}
.ring{opacity:0;animation:ring 7s infinite}
@keyframes ring{0%,42%{opacity:0}48%,84%{opacity:1}92%,100%{opacity:0}}
</style>
${spans.map(([x, w], i) => {
    const y = 18 + i * 15, isBad = i === bad, ww = isBad ? 330 : w;
    return `<rect class="sp${isBad ? ' bad' : ''}" style="animation-delay:${f(i * 0.18)}s" x="${x + 20}" y="${y}" width="${ww}" height="9" rx="3" fill="${isBad ? '#ff6b6b' : c}" fill-opacity="${isBad ? 0.85 : 0.55 - i * 0.04}"/>`;
  }).join('')}
<g class="ring"><rect x="86" y="58" width="342" height="17" rx="6" fill="none" stroke="#ff6b6b" stroke-width="1.4"/><circle cx="438" cy="66.5" r="3.5" fill="#ff6b6b"/></g>
<line class="mv cur" x1="20" x2="20" y1="12" y2="110" stroke="${INK}" stroke-opacity=".25"><animate attributeName="x1" values="20;460;20" dur="7s" repeatCount="indefinite"/><animate attributeName="x2" values="20;460;20" dur="7s" repeatCount="indefinite"/></line>`;
};

// Three exports stream in and merge into one table.
M.onboard = (c) => {
  const ys = [24, 56, 88], mx = 300, my = 56;
  const paths = ys.map((y) => `M20 ${y} L 170 ${y} C 240 ${y} 240 ${my} ${mx} ${my}`);
  const tail = `M${mx} ${my} L 372 ${my}`;
  const dots = (p, n, dur, op) => Array.from({ length: n }, (_, i) => `<circle r="2.8" fill="${c}" fill-opacity="${op}"><animateMotion dur="${dur}s" repeatCount="indefinite" begin="-${f(i * dur / n + op)}s" path="${p}"/></circle>`).join('');
  const rows = Array.from({ length: 5 }, (_, i) => `<rect class="row" style="animation-delay:${f(i * 0.35)}s" x="384" y="${28 + i * 12}" width="72" height="8" rx="2" fill="${c}"/>`).join('');
  return `<style>
.row{opacity:.18;animation:row 3.5s ease-in-out infinite}
@keyframes row{0%,100%{opacity:.18}30%{opacity:.75}}
</style>
${paths.map((p) => `<path d="${p}" stroke="${c}" stroke-opacity=".22" stroke-width="1.5" fill="none"/>`).join('')}
<path d="${tail}" stroke="${c}" stroke-opacity=".4" stroke-width="2" fill="none"/>
${ys.map((y) => `<rect x="12" y="${y - 6}" width="12" height="12" rx="3" fill="${BG1}" stroke="${c}" stroke-opacity=".6"/>`).join('')}
<rect x="378" y="20" width="84" height="72" rx="6" fill="${BG1}" stroke="${c}" stroke-opacity=".6"/>
${rows}
<g class="mv">${paths.map((p, i) => dots(p, 4, 3.2, [0.95, 0.7, 0.85][i])).join('')}${dots(tail, 2, 1, 1)}</g>`;
};

// A day of visits in a small city: technicians drive their routes; an urgent job drops in and a
// route bends to take it.
M.dispatch = (c) => {
  const grid = [];
  for (let x = 40; x < 460; x += 36) grid.push(`M${x} 8V${BAND - 8}`);
  for (let y = 16; y < BAND; y += 24) grid.push(`M16 ${y}H464`);
  const river = 'M16 92 C 120 70 170 112 260 88 S 400 60 464 80';
  const routes = [
    'M40 40 H112 V16 H220 V40 H292',
    'M76 112 V88 H184 V64 H328 V40 H400',
    'M436 16 V64 H364 V112 H256'
  ];
  const re = 'M76 112 V88 H184 V64 H256 V40 H328 V40 H400'; // bent to take the urgent job at (256, 40)
  return `<style>
.rt{stroke-dasharray:100;animation:draw 9s ease-in-out infinite}
@keyframes draw{0%{stroke-dashoffset:100}25%,100%{stroke-dashoffset:0}}
.pin{opacity:0;animation:pin 9s infinite}
@keyframes pin{0%,38%{opacity:0}42%,92%{opacity:1}100%{opacity:0}}
.old{animation:old 9s infinite}
@keyframes old{0%,46%{opacity:1}54%,92%{opacity:0}100%{opacity:1}}
.new{opacity:0;animation:new 9s infinite}
@keyframes new{0%,46%{opacity:0}54%,92%{opacity:1}100%{opacity:0}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 1.6s ease-out infinite}
@keyframes ping{from{transform:scale(.4);opacity:.9}to{transform:scale(2.4);opacity:0}}
</style>
<path d="${grid.join('')}" stroke="${INK}" stroke-opacity=".06"/>
<path d="${river}" stroke="#62b6ff" stroke-opacity=".22" stroke-width="5" fill="none"/>
<path class="rt" pathLength="100" d="${routes[0]}" stroke="${c}" stroke-opacity=".55" stroke-width="2" fill="none"/>
<path class="rt old" pathLength="100" d="${routes[1]}" stroke="${c}" stroke-opacity=".55" stroke-width="2" fill="none"/>
<path class="new" d="${re}" stroke="${c}" stroke-opacity=".9" stroke-width="2.4" fill="none"/>
<path class="rt" pathLength="100" d="${routes[2]}" stroke="${c}" stroke-opacity=".55" stroke-width="2" fill="none"/>
<g class="pin"><circle class="ping" cx="256" cy="40" r="6" fill="none" stroke="#ff5d5d" stroke-width="1.5"/><circle cx="256" cy="40" r="4" fill="#ff5d5d"/></g>
<g class="mv">${routes.map((p, i) => `<circle r="4" fill="${INK}" stroke="${c}" stroke-width="2"><animateMotion dur="${[6, 7, 5][i]}s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;.5;1" calcMode="linear" path="${p}"/></circle>`).join('')}</g>`;
};

// Passages of notes as lines of text; a query sweeps across and the best three light up, ranked.
M.atlas = (c) => {
  const r = rnd(5), cols = 6, rows = 6, cw = 70, items = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) items.push([30 + i * cw, 16 + j * 16, 26 + r() * 30]);
  const hits = [[3, 2, 1], [1, 4, 2], [4, 0, 3]];
  return `<style>
.sw{animation:sw 6s cubic-bezier(.45,0,.55,1) infinite}
@keyframes sw{0%{transform:translateX(0)}55%,100%{transform:translateX(430px)}}
.hit{opacity:0;animation:hit 6s infinite}
@keyframes hit{0%,50%{opacity:0}58%,90%{opacity:1}100%{opacity:0}}
</style>
${items.map(([x, y, w]) => `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="4" rx="2" fill="${INK}" fill-opacity=".14"/>`).join('')}
${hits.map(([i, j, k], n) => { const [x, y, w] = items[i * rows + j]; return `<g class="hit" style="animation-delay:${f(n * 0.25)}s"><rect x="${f(x)}" y="${y}" width="${f(w)}" height="4" rx="2" fill="${c}"/><circle cx="${f(x - 9)}" cy="${y + 2}" r="5.5" fill="${c}" fill-opacity=".2" stroke="${c}"/><text x="${f(x - 9)}" y="${y + 4.6}" font-size="7" text-anchor="middle" fill="${c}" font-family="monospace">${k}</text></g>`; }).join('')}
<g class="mv sw"><rect x="10" y="8" width="2" height="${BAND - 16}" fill="${c}" fill-opacity=".8"/><rect x="-30" y="8" width="40" height="${BAND - 16}" fill="url(#swg)"/></g>
<defs><linearGradient id="swg"><stop offset="0" stop-color="${c}" stop-opacity="0"/><stop offset="1" stop-color="${c}" stop-opacity=".18"/></linearGradient></defs>`;
};

// A scale played up and down: the pitch trace scrolls past, each note held with a little vibrato,
// against the in-tune line.
M.studio = (c) => {
  const seg = 60, notes = [0, 1, 2, 3, 4, 3, 2, 1], period = seg * notes.length; // 480: one loop
  let d = '';
  for (let k = 0; k < 2; k++) notes.forEach((n, i) => {
    const x0 = k * period + i * seg, y0 = 96 - n * 17;
    for (let x = 0; x <= seg; x += 3) {
      const t = x / seg, vib = Math.sin(x * 0.42) * 2.6 * Math.min(1, t * 3) * Math.min(1, (1 - t) * 5);
      const glide = x < 8 ? (1 - x / 8) * ((i ? notes[i - 1] : notes[notes.length - 1]) - n) * 17 : 0;
      d += `${d ? 'L' : 'M'}${f(x0 + x)} ${f(y0 + vib - glide)}`;
    }
  });
  const lines = notes.slice(0, 5).map((n) => `<line x1="0" x2="${W}" y1="${96 - n * 17}" y2="${96 - n * 17}" stroke="${INK}" stroke-opacity=".08"/>`).join('');
  return `<style>
.tr{animation:tr 8s linear infinite}
@keyframes tr{to{transform:translateX(-${period}px)}}
</style>
${lines}
<g class="mv tr"><path d="${d}" stroke="${c}" stroke-width="2.2" fill="none" stroke-linejoin="round"/></g>
<rect x="${W - 70}" y="0" width="70" height="${BAND}" fill="url(#fadeR)"/>
<line x1="${W - 70}" x2="${W - 70}" y1="10" y2="${BAND - 10}" stroke="${c}" stroke-opacity=".5" stroke-dasharray="2 4"/>
<defs><linearGradient id="fadeR"><stop offset="0" stop-color="${BG1}" stop-opacity="0"/><stop offset="1" stop-color="${BG1}"/></linearGradient></defs>`;
};

// One layer of a gear being sliced: the outer wall, then the inner wall, then the infill, with the
// nozzle tracing the wall; then the next layer.
M.layerline = (c) => {
  const cx = 240, cy = 61, teeth = 14;
  const gear = (ro, ri) => {
    const pts = [];
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2, s = (Math.PI * 2) / teeth;
      for (const [t, r] of [[0, ri], [0.3, ri], [0.42, ro], [0.78, ro], [0.9, ri]]) pts.push([cx + Math.cos(a + t * s) * r, cy + Math.sin(a + t * s) * r]);
    }
    return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
  };
  const outer = gear(50, 41), inner = gear(45, 36);
  const hatch = [];
  for (let x = -60; x <= 60; x += 7) hatch.push(`<line class="ht" style="animation-delay:${f(3.2 + (x + 60) / 120 * 1.6)}s" x1="${cx + x - 30}" y1="${cy + 30}" x2="${cx + x + 30}" y2="${cy - 30}"/>`);
  return `<style>
.ow,.iw{stroke-dasharray:100;animation:ow 9s linear infinite}
.iw{animation-name:iw}
@keyframes ow{0%{stroke-dashoffset:100;opacity:1}22%{stroke-dashoffset:0}88%{stroke-dashoffset:0;opacity:1}96%,100%{stroke-dashoffset:0;opacity:0}}
@keyframes iw{0%,22%{stroke-dashoffset:100;opacity:1}38%{stroke-dashoffset:0}88%{stroke-dashoffset:0;opacity:1}96%,100%{stroke-dashoffset:0;opacity:0}}
.ht{opacity:0;animation:ht 9s infinite}
@keyframes ht{0%{opacity:0}2%,52%{opacity:1}60%,100%{opacity:0}}
.nz{animation:nz 9s infinite}
@keyframes nz{0%,36%{opacity:1}40%,100%{opacity:0}}
</style>
<defs><clipPath id="in"><path d="${inner}"/></clipPath></defs>
<path d="${outer}" transform="translate(0 4)" fill="${c}" fill-opacity=".06" stroke="${c}" stroke-opacity=".22" stroke-width="1.4" stroke-linejoin="round"/>
<path class="ow" pathLength="100" d="${outer}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/>
<path class="iw" pathLength="100" d="${inner}" fill="none" stroke="${c}" stroke-opacity=".6" stroke-width="1.6" stroke-linejoin="round"/>
<g clip-path="url(#in)" stroke="${c}" stroke-opacity=".45" stroke-width="1.4">${hatch.join('')}</g>
<circle cx="${cx}" cy="${cy}" r="12" fill="${BG1}" stroke="${c}" stroke-opacity=".8" stroke-width="1.6"/>
<g class="mv nz"><circle r="4" fill="${INK}" stroke="${c}" stroke-width="1.5"><animateMotion dur="9s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.22;1" calcMode="linear" path="${outer}"/></circle></g>
<g fill="${c}">${Array.from({ length: 7 }, (_, i) => `<rect${i === 6 ? ' class="top"' : ''} x="${70 + i}" y="${96 - i * 9}" width="${80 - i * 2}" height="6" rx="2" fill-opacity="${i === 6 ? 0.9 : 0.12 + i * 0.08}"/>`).join('')}</g>
<style>.top{animation:top 9s infinite}@keyframes top{0%,96%{opacity:1}97%,100%{opacity:0}}</style>`;
};

// The map from the portfolio: a 3 x 3 of the projects, each cell lighting up in its colour.
M.shelf = () => {
  const cells = [['#c8ff4a', '#ff8a65', '#b7b6b0'], ['#a78bfa', '#ecebe6', '#ffb547'], ['#ff7ab6', '#4fe3c1', '#62b6ff']];
  const s = 26, g = 6, x0 = W / 2 - (s * 3 + g * 2) / 2, y0 = BAND / 2 - (s * 3 + g * 2) / 2 + 2;
  const order = [4, 5, 8, 7, 6, 3, 0, 1, 2];
  return `<style>
.cl{animation:cl 6.3s ease-in-out infinite}
@keyframes cl{0%,100%{fill-opacity:.12}8%{fill-opacity:.85}24%{fill-opacity:.3}}
</style>
${cells.flatMap((row, j) => row.map((col, i) => `<rect class="cl" style="animation-delay:${f(order.indexOf(j * 3 + i) * 0.7)}s" x="${x0 + i * (s + g)}" y="${y0 + j * (s + g)}" width="${s}" height="${s}" rx="6" fill="${col}" fill-opacity=".3" stroke="${col}" stroke-opacity=".55"/>`)).join('')}`;
};

/* ------------------------------------------------------------------ the card */
for (const card of CARDS) {
  const G = createGlyphs('c');
  const c = card.color;
  const kind = G.text('monoM', card.kind.toUpperCase(), PAD, BAND + 34, 13, { track: 0.16, fill: c });
  const unit = G.text('mono', card.unit, W - PAD, BAND + 34, 13.5, { anchor: 'end', fill: DIM });
  const nameSize = G.measure('serif', card.name, 44) > 300 ? 38 : 44;
  const name = G.text('serif', card.name, PAD, BAND + 82, nameSize, { fill: INK });
  const num = G.text('serifI', card.n, W - PAD, BAND + 82, 40, { anchor: 'end', fill: c });
  const lines = G.wrap('sans', card.line, 16, W - PAD * 2);
  const body = lines.slice(0, 2).map((l, i) => G.text('sans', l, PAD, BAND + 116 + i * 22, 16, { fill: '#c8c3cc' })).join('');
  const motif = M[card.id](c);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">${card.name}: ${card.line} ${card.n} ${card.unit}.</title>
<style>@media (prefers-reduced-motion:reduce){*{animation:none!important}.mv{display:none}}</style>
<defs>${G.defsSvg()}
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG0}"/></linearGradient>
<radialGradient id="glow" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="${c}" stop-opacity=".14"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
<clipPath id="cl"><rect width="${W}" height="${H}" rx="16"/></clipPath>
</defs>
<g clip-path="url(#cl)">
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${BAND}" fill="url(#glow)"/>
<g>${motif}</g>
<line x1="${PAD}" x2="${W - PAD}" y1="${BAND + 0.5}" y2="${BAND + 0.5}" stroke="${INK}" stroke-opacity=".07"/>
${kind}${unit}${name}${num}${body}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="${INK}" stroke-opacity=".1"/>
</svg>`;
  fs.writeFileSync(`${out}/${card.id}.svg`, svg);
  console.log(card.id, (svg.length / 1024).toFixed(1) + ' KB', lines.length > 1 ? 'WRAPS' : '');
}
