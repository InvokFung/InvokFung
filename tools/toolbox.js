// Builds toolbox.svg: the stack in four groups, each tool with its logo (Simple Icons, CC0) and name.
// node tools/toolbox.js assets/toolbox.svg
const fs = require('fs');
const si = require('simple-icons');
const { createGlyphs } = require('./glyphs.js');
const out = process.argv[2];
const G = createGlyphs('t');

const INK = '#ecebe6', DIM = '#a9a4ae', BG0 = '#100f16', BG1 = '#17141f';
const GROUPS = [
  { title: 'Languages', color: '#ffb547', items: [['TypeScript', si.siTypescript], ['JavaScript', si.siJavascript], ['Python', si.siPython], ['C++', si.siCplusplus], ['Java', si.siOpenjdk]] },
  { title: 'Web & graphics', color: '#a78bfa', items: [['React', si.siReact], ['Next.js', si.siNextdotjs], ['Vue', si.siVuedotjs], ['Three.js', si.siThreedotjs], ['WebAssembly', si.siWebassembly]] },
  { title: 'Backend & data', color: '#4fe3c1', items: [['Node.js', si.siNodedotjs], ['PostgreSQL', si.siPostgresql], ['MongoDB', si.siMongodb], ['OpenTelemetry', si.siOpentelemetry]] },
  { title: 'Cloud & infra', color: '#62b6ff', items: [['Docker', si.siDocker], ['Kubernetes', si.siKubernetes], ['AWS', si.siAmazonwebservices], ['Terraform', si.siTerraform]] }
];

const W = 980, PAD = 32, COL = (W - PAD * 2) / 4, ROW = 42, TOP = 64;
const H = TOP + ROW * 5 + 18;
const icons = new Map();
const body = GROUPS.map((g, i) => {
  const x = PAD + i * COL;
  const head = G.text('monoM', g.title.toUpperCase(), x, 42, 13, { track: 0.16, fill: g.color });
  const rows = g.items.map(([name, icon], j) => {
    const y = TOP + j * ROW;
    icons.set(icon.slug, icon.path);
    return `<rect x="${x}" y="${y}" width="30" height="30" rx="8" fill="${BG1}" stroke="${INK}" stroke-opacity=".1"/>`
      + `<use href="#i-${icon.slug}" transform="translate(${x + 7} ${y + 7}) scale(${16 / 24})" fill="${INK}" fill-opacity=".9"/>`
      + G.text('sans', name, x + 42, y + 20.5, 16, { fill: '#d6d1d9' });
  }).join('');
  return head + rows;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t">
<title id="t">Toolbox. Languages: TypeScript, JavaScript, Python, C++, Java. Web and graphics: React, Next.js, Vue, Three.js, WebAssembly. Backend and data: Node.js, PostgreSQL, MongoDB, OpenTelemetry. Cloud and infra: Docker, Kubernetes, AWS, Terraform.</title>
<defs>${G.defsSvg()}${[...icons].map(([slug, d]) => `<path id="i-${slug}" d="${d}"/>`).join('')}
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG1}"/><stop offset="1" stop-color="${BG0}"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="16" fill="url(#bg)"/>
${body}
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="15.5" fill="none" stroke="${INK}" stroke-opacity=".1"/>
</svg>`;
fs.writeFileSync(out, svg);
console.log(out, (svg.length / 1024).toFixed(1) + ' KB', W + 'x' + H);
