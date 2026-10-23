#!/usr/bin/env node
// Draws assets/ridge.svg: the last year of contributions as a ridge at first light, one step a
// week, the same dawn as the banner. The workflow in .github/workflows/ridge.yml runs it daily.
//
//   GITHUB_TOKEN=... node tools/ridge.mjs            reads the calendar from GitHub
//   node tools/ridge.mjs calendar.json               reads a saved one (the GraphQL contributionCalendar)
//
// No packages and no fonts: the digits and labels come as paths in ridge-glyphs.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const LOGIN = process.env.LOGIN || 'InvokFung';
const OUT = new URL('../assets/ridge.svg', import.meta.url);
const font = JSON.parse(readFileSync(new URL('./ridge-glyphs.json', import.meta.url)));

async function calendar() {
  if (process.argv[2]) return JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
    totalContributions weeks { contributionDays { date contributionCount } } } } } }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'ridge' },
    body: JSON.stringify({ query, variables: { login: LOGIN } })
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json.data.user.contributionsCollection.contributionCalendar;
}

const W = 980, H = 260, BASE = 214, X0 = 40, X1 = W - 40;
const INK = '#ecebe6', DIM = '#a9a4ae';
const f1 = (v) => +v.toFixed(1);

// a number set in the serif's italic digits, at size px, ending (anchor end) or starting at x
function number(str, x, y, size, anchor = 'start') {
  const k = size / 1000;
  const w = [...str].reduce((a, ch) => a + font.digits[ch].adv * k, 0);
  let cx = anchor === 'end' ? x - w : x;
  const parts = [...str].map((ch) => { const g = `<path transform="translate(${f1(cx)} ${y}) scale(${k})" d="${font.digits[ch].d}"/>`; cx += font.digits[ch].adv * k; return g; });
  return parts.join('');
}
const label = (key, x, y) => `<g transform="translate(${x} ${y})" fill="${DIM}">${font.labels[key].g}</g>`;
// a smooth line through points (Catmull-Rom, as cubic Béziers)
function smooth(pts) {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] || pts[i], pts[i], pts[i + 1], pts[i + 2] || pts[i + 1]];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}
// the cloud tops: heaps of every size along a line, from a fixed seed so it doesn't change daily
function cloud(width, y, seed) {
  let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  let d = `M0 ${H}L0 ${y}`, x = 0;
  while (x < width) {
    const w = 70 + r() * 110, h = 3 + r() * 6, n = Math.min(width, x + w);
    d += `Q${f1((x + n) / 2)} ${f1(y - h * 2)} ${f1(n)} ${f1(y + (r() - 0.5) * 3)}`;
    x = n;
  }
  return d + `L${width} ${H}Z`;
}

export function render(cal) {
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  const weeks = cal.weeks.map((w) => w.contributionDays.reduce((a, d) => a + d.contributionCount, 0));
  const max = Math.max(...weeks), busiest = weeks.indexOf(max);
  let streak = 0, run = 0;
  for (const d of days) { run = d.contributionCount > 0 ? run + 1 : 0; streak = Math.max(streak, run); }

  const n = weeks.length, step = (X1 - X0) / Math.max(1, n - 1);
  const heightOf = (v) => 14 + 90 * Math.sqrt(max ? v / max : 0);
  const near = weeks.map((v, i) => [X0 + i * step, BASE - heightOf(v)]);
  // a farther range behind it: the same year, worn smooth
  const far = weeks.map((_, i) => {
    const win = weeks.slice(Math.max(0, i - 3), i + 4), avg = win.reduce((a, b) => a + b, 0) / win.length;
    return [X0 + i * step, BASE - 18 - heightOf(avg) * 0.85];
  });
  const edge = (pts) => `M0 ${f1(pts[0][1])}L` + smooth(pts).slice(1) + `L${W} ${f1(pts[pts.length - 1][1])}`;
  const fill = (pts) => edge(pts) + `L${W} ${H}L0 ${H}Z`;
  const [bx, by] = near[busiest];
  // the sun comes up at the newest end of the year, just clear of the land under it
  const sx = Math.abs(bx - (X1 - 34)) < 70 ? bx - 96 : X1 - 34;
  const sy = Math.min(...near.concat(far).filter((p) => Math.abs(p[0] - sx) < 40).map((p) => p[1])) - 26;

  const stats = [
    [Number(cal.totalContributions).toLocaleString('en-US'), 'total', 40],
    [String(max), 'week', 330],
    [String(streak), 'streak', 560]
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">The last year on GitHub as a ridge, a week a step: ${stats[0][0]} contributions, ${max} in the busiest week, a longest streak of ${streak} days.</title>
<style>
.rim{stroke-dasharray:100;animation:rim 2.8s cubic-bezier(.3,.6,.2,1) .3s both}
@keyframes rim{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.rise{animation:rise 2.4s cubic-bezier(.2,.7,.2,1) both}
@keyframes rise{from{transform:translateY(26px)}}
.flag{animation:fade 1s ease 2.4s both}
@keyframes fade{from{opacity:0}}
.drift{animation:drift 140s linear infinite}
@keyframes drift{to{transform:translateX(-${W}px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${BASE}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#090b11"/><stop offset=".45" stop-color="#151826"/><stop offset=".8" stop-color="#463645"/><stop offset="1" stop-color="#a8694a"/></linearGradient>
<radialGradient id="glow" cx="${sx}" cy="${f1(sy)}" r="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffaa60" stop-opacity=".5"/><stop offset="1" stop-color="#ffaa60" stop-opacity="0"/></radialGradient>
<linearGradient id="near" x1="0" y1="${BASE - 110}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6f5f6a"/><stop offset="1" stop-color="#2e2836"/></linearGradient>
<linearGradient id="far" x1="0" y1="${BASE - 110}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4d4555"/><stop offset="1" stop-color="#2a2433"/></linearGradient>
<linearGradient id="sea" x1="0" y1="${BASE - 6}" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e8b89a"/><stop offset=".3" stop-color="#8f7486"/><stop offset="1" stop-color="#2a2236"/></linearGradient>
<linearGradient id="mist" x1="0" y1="${BASE - 46}" x2="0" y2="${BASE + 14}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c9a49a" stop-opacity="0"/><stop offset="1" stop-color="#c9a49a" stop-opacity=".55"/></linearGradient>
<clipPath id="r"><rect width="${W}" height="${H}" rx="16"/></clipPath>
${font.defs}
</defs>
<g clip-path="url(#r)">
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<circle cx="${sx}" cy="${f1(sy)}" r="12" fill="#ffe1b0" fill-opacity=".92"/>
<g class="rise"><path d="${fill(far)}" fill="url(#far)"/><path d="${edge(far)}" fill="none" stroke="#ffd3a1" stroke-opacity=".35" stroke-width="1.2"/></g>
<g class="rise" style="animation-delay:.15s"><path d="${fill(near)}" fill="url(#near)"/><path class="rim" pathLength="100" d="${edge(near)}" fill="none" stroke="#ffd3a1" stroke-opacity=".85" stroke-width="1.6"/>
<g class="flag"><line x1="${f1(bx)}" y1="${f1(by)}" x2="${f1(bx)}" y2="${f1(by - 24)}" stroke="${INK}" stroke-width="1.4"/><path d="M${f1(bx)} ${f1(by - 24)}l15 4.5l-15 4.5z" fill="#ffb547"/></g></g>
<rect y="${BASE - 46}" width="${W}" height="${H - BASE + 46}" fill="url(#mist)"/>
<g class="drift" opacity=".55"><path d="${cloud(W, BASE + 4, 11)}" fill="url(#sea)"/><path transform="translate(${W} 0)" d="${cloud(W, BASE + 4, 11)}" fill="url(#sea)"/></g>
<g class="drift" style="animation-duration:90s"><path d="${cloud(W, BASE + 16, 7)}" fill="url(#sea)"/><path transform="translate(${W} 0)" d="${cloud(W, BASE + 16, 7)}" fill="url(#sea)"/></g>
<g fill="${INK}">${stats.map(([v, , x]) => number(v, x, 70, 44)).join('')}</g>
${stats.map(([, k, x]) => label(k, x, 94)).join('')}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="${INK}" stroke-opacity=".1"/>
</svg>
`;
}

const svg = render(await calendar());
const before = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
if (svg !== before) { writeFileSync(OUT, svg); console.log('ridge.svg redrawn'); } else console.log('ridge.svg unchanged');
