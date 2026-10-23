// Builds banner.svg: the homepage's cover at first light, as a banner. The scene and the sea are
// real frames of the site's own renderer (render.js, encode.py); the SVG lays the name over them in
// paths, crossfades the sea between frames, drifts the wisps and mist, and opens on the dawn.
// node tools/banner/build.js tools/banner/layers assets/banner.svg
const fs = require('fs');
const { createGlyphs } = require('../glyphs.js');
const [dir, out] = process.argv.slice(2);
const G = createGlyphs('b');
const W = 1200, H = 400;
const uri = (f) => `data:image/webp;base64,${fs.readFileSync(`${dir}/${f}`).toString('base64')}`;

// the name, as on the cover: "Alan" upright, "Fung" in italics, centred, its foot down in the cloud
const NS = 172, BASE = 268;
const wA = G.measure('serif', 'Alan', NS), wSp = G.measure('serif', ' ', NS), wF = G.measure('serifI', 'Fung', NS);
const x0 = (W - (wA + wSp + wF)) / 2;
const name = G.text('serif', 'Alan', x0, BASE, NS) + G.text('serifI', 'Fung', x0 + wA + wSp, BASE, NS);
const role = G.text('monoM', 'FORWARD DEPLOYED ENGINEER', W / 2, 381, 15, { track: 0.32, anchor: 'middle' });

// a tiling strip that drifts left forever: two copies side by side, sliding one width in `s` seconds
const drift = (f, y, h, s, cls, op = 1) => `<g class="${cls}" opacity="${op}"><g class="drift" style="animation-duration:${s}s"><image href="${uri(f)}" x="0" y="${y}" width="${W}" height="${h}" preserveAspectRatio="none"/><image href="${uri(f)}" x="${W}" y="${y}" width="${W}" height="${h}" preserveAspectRatio="none"/></g></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">Alan Fung, Forward Deployed Engineer, over a sea of cloud at first light</title>
<style>
.drift{animation:drift linear infinite}
@keyframes drift{to{transform:translateX(-${W}px)}}
.s1,.s2,.s3{opacity:0;animation:24s ease-in-out infinite}
.s1{animation-name:s1}.s2{animation-name:s2}.s3{animation-name:s3}
@keyframes s1{0%,4.2%{opacity:0}16.7%,87.5%{opacity:1}100%{opacity:0}}
@keyframes s2{0%,20.8%{opacity:0}33.3%,70.8%{opacity:1}83.3%,100%{opacity:0}}
@keyframes s3{0%,37.5%{opacity:0}50%,54.2%{opacity:1}66.7%,100%{opacity:0}}
.night{opacity:0;animation:night 3.2s cubic-bezier(.3,0,.2,1) both}
@keyframes night{from{opacity:.86}to{opacity:0}}
.name{animation:rise 2.6s cubic-bezier(.2,.7,.2,1) .5s both}
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.role{animation:fade 1.6s ease 2.2s both}
@keyframes fade{from{opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
${G.defsSvg()}
<clipPath id="r"><rect width="${W}" height="${H}" rx="14"/></clipPath>
<linearGradient id="ink" x1="0" y1="${BASE - NS * 0.72}" x2="0" y2="${BASE + NS * 0.2}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f3f1ec"/><stop offset=".75" stop-color="#ece4dc"/><stop offset="1" stop-color="#e7d3c6"/></linearGradient>
<linearGradient id="footfade" x1="0" y1="${BASE - 4}" x2="0" y2="${BASE + NS * 0.24}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="foot" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${BASE - 4}" fill="#fff"/><rect y="${BASE - 4}" width="${W}" height="${H}" fill="url(#footfade)"/></mask>
<pattern id="grain" width="64" height="64" patternUnits="userSpaceOnUse"><image href="${uri('grain.webp')}" width="64" height="64"/></pattern>
<filter id="shade" x="-5%" y="-20%" width="110%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#120c16" flood-opacity=".38"/></filter>
</defs>
<g clip-path="url(#r)">
<image href="${uri('bg.webp')}" width="${W}" height="${H}"/>
<image class="s1" href="${uri('sea1.webp')}" y="170" width="${W}" height="202"/>
<image class="s2" href="${uri('sea2.webp')}" y="170" width="${W}" height="202"/>
<image class="s3" href="${uri('sea3.webp')}" y="170" width="${W}" height="202"/>
${drift('w4.webp', 100, 80, 238, 'w1', 0.9)}
${drift('w9.webp', 144, 68, 139, 'w2', 0.9)}
<g class="name" mask="url(#foot)"><g filter="url(#shade)" fill="url(#ink)">${name}</g><g fill="url(#grain)">${name}</g></g>
${drift('mist.webp', 232, 88, 167, 'm1')}
<g class="role" fill="#ecebe6" fill-opacity=".62">${role}</g>
<rect class="night" width="${W}" height="${H}" fill="#090b11"/>
</g>
</svg>`;
fs.writeFileSync(out, svg);
console.log(out, (svg.length / 1024).toFixed(1) + ' KB');
