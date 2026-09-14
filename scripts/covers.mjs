// Port of the portfolio's ProjectCover.astro: the same hand-built covers, drawn at 800×500.
// On the portfolio they animate on hover; a README has no hover, so here the loops simply run.
import { mulberry32 } from "./lib.mjs";

export const COVER_W = 800;
export const COVER_H = 500;

const qr = (seed, n = 21) => {
  const rand = mulberry32(seed);
  const cells = [];
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (inFinder(x, y)) continue;
      if (rand() < 0.48) cells.push([x, y]);
    }
  return { cells, finders: [[0, 0], [n - 7, 0], [0, n - 7]] };
};
const qrMarkup = (q) =>
  q.cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" class="ink-fill"/>`).join("") +
  q.finders.map(([x, y]) => `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" class="qr-ring"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" class="ink-fill"/>`).join("");

const spark = (seed, x, y, w, h, n = 14) => {
  const rand = mulberry32(seed);
  let v = 0.5;
  return Array.from({ length: n }, (_, i) => {
    v = Math.min(0.95, Math.max(0.05, v + (rand() - 0.45) * 0.3));
    return `${i ? "L" : "M"}${(x + (i / (n - 1)) * w).toFixed(1)} ${(y + h - v * h).toFixed(1)}`;
  }).join("");
};

const d = (i) => `style="--i:${i}"`;

const agents = [
  { id: "P", x: 262, y: 92, consensus: true },
  { id: "S", x: 408, y: 196, consensus: false },
  { id: "V", x: 356, y: 352, consensus: false },
  { id: "O", x: 170, y: 352, consensus: true },
  { id: "Q", x: 116, y: 196, consensus: true },
];
const pairs = agents.flatMap((a, i) => agents.slice(i + 1).map((b) => [a, b]));
const histogram = [0.18, 0.32, 0.12, 0.9, 0.24, 0.4, 0.14, 0.28];
const hashes = ["run_started", "agents_answered", "critique_round", "consensus_weights", "run_committed"];

const consensus = () => `<g>
<path d="M84 150 L252 46 L312 82 L224 398 L118 398 L66 236Z" class="hull anim march"/>
<text x="72" y="436" class="label accent-text">CONSENSUS CLUSTER · QAOA</text>
${pairs
  .map(([a, b], i) => {
    const same = a.consensus && b.consensus;
    const cross = a.consensus !== b.consensus;
    const cls = same ? "edge-strong anim flow" : cross ? "edge-weak anim flicker" : "edge-mid anim flicker";
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}" ${d(i)}/>`;
  })
  .join("")}
${agents
  .map(
    (a, i) => `<g class="anim speak" ${d(i)}>
<rect x="${a.x - 22}" y="${a.y - 22}" width="56" height="56" rx="6" class="shadow"/>
<rect x="${a.x - 28}" y="${a.y - 28}" width="56" height="56" rx="6" class="${a.consensus ? "navy" : "panel"}"/>
<text x="${a.x}" y="${a.y + 8}" text-anchor="middle" class="node-letter ${a.consensus ? "on-navy" : "ink"}">${a.id}</text></g>`,
  )
  .join("")}
<text x="560" y="62" class="label">EVENT CHAIN</text>
${hashes
  .map((h, i) => {
    const y = 80 + i * 76;
    const last = i === hashes.length - 1;
    return `<g class="anim ${last ? "commit" : "append"}" ${d(i)}>
${i > 0 ? `<path d="M650 ${y - 20}V${y}" class="link"/>` : ""}
<rect x="566" y="${y + 5}" width="184" height="52" rx="5" class="shadow"/>
<rect x="560" y="${y}" width="184" height="52" rx="5" class="${last ? "navy" : "panel"}"/>
<text x="576" y="${y + 22}" class="mono-sm ${last ? "on-navy" : "ink"}">${h}</text>
<text x="576" y="${y + 41}" class="mono-xs ${last ? "on-navy-muted" : "muted"}">${last ? "anchored on-chain ✓" : `sha256 ${(0x3fa9c1 * (i + 7)).toString(16).slice(0, 8)}…`}</text></g>`;
  })
  .join("")}
${histogram
  .map((v, i) => `<rect x="${380 + i * 20}" y="${470 - v * 60}" width="14" height="${v * 60}" class="${v === Math.max(...histogram) ? "amber" : "frost-soft"} anim shots" ${d(i)}/>`)
  .join("")}
<text x="380" y="398" class="mono-xs muted">MEASURED CUT</text>
</g>`;

const bloch = () => `<g>
<circle cx="258" cy="258" r="160" class="shadow"/>
<circle cx="250" cy="250" r="160" class="panel"/>
<path d="M90 250A160 48 0 0 1 410 250" class="stroke dashed anim march"/>
<path d="M90 250A160 48 0 0 0 410 250" class="stroke"/>
<ellipse cx="250" cy="250" rx="52" ry="160" class="stroke thin anim meridian"/>
<line x1="250" y1="62" x2="250" y2="438" class="stroke thin"/>
<line x1="120" y1="330" x2="380" y2="170" class="stroke thin dashed"/>
<g class="anim precess"><path d="M250 250 L352 150" class="vector"/><rect x="343" y="141" width="18" height="18" class="amber"/></g>
<path d="M250 190 A60 60 0 0 1 292 208" class="stroke-amber"/>
<text x="276" y="186" class="mono-sm amber-text">θ</text>
<text x="250" y="48" text-anchor="middle" class="ket">|0⟩</text>
<text x="250" y="470" text-anchor="middle" class="ket">|1⟩</text>
<text x="480" y="62" class="label">CIRCUIT</text>
<rect x="486" y="84" width="260" height="130" rx="6" class="shadow"/>
<rect x="480" y="78" width="260" height="130" rx="6" class="panel"/>
<line x1="500" y1="118" x2="720" y2="118" class="stroke"/>
<line x1="500" y1="170" x2="720" y2="170" class="stroke"/>
<text x="496" y="112" class="mono-xs muted">q0</text>
<text x="496" y="164" class="mono-xs muted">q1</text>
<rect x="506" y="113" width="10" height="10" class="amber anim signal"/>
<rect x="506" y="165" width="10" height="10" class="amber anim signal" ${d(3)}/>
<rect x="540" y="100" width="36" height="36" rx="4" class="navy anim gate"/>
<text x="558" y="124" text-anchor="middle" class="mono-sm on-navy">H</text>
<line x1="620" y1="118" x2="620" y2="182" class="stroke"/>
<circle cx="620" cy="118" r="6" class="ink-fill"/>
<circle cx="620" cy="170" r="13" class="panel"/>
<path d="M607 170H633M620 157V183" class="stroke"/>
<rect x="668" y="100" width="36" height="36" rx="4" class="panel-2"/>
<path d="M676 128A10 10 0 0 1 696 128M686 128L694 110" class="stroke"/>
<rect x="668" y="152" width="36" height="36" rx="4" class="panel-2"/>
<path d="M676 180A10 10 0 0 1 696 180M686 180L694 162" class="stroke"/>
<text x="480" y="266" class="label">STATEVECTOR · QISKIT AER</text>
<rect x="486" y="286" width="260" height="160" rx="6" class="shadow"/>
<rect x="480" y="280" width="260" height="160" rx="6" class="panel"/>
<text x="500" y="318" class="mono-sm ink">|0⟩</text>
<rect x="540" y="304" width="180" height="18" class="panel-2"/>
<rect x="540" y="304" width="135" height="18" class="accent anim prob-zero"/>
<text x="720" y="342" text-anchor="end" class="mono-xs muted">P(0)</text>
<text x="500" y="386" class="mono-sm ink">|1⟩</text>
<rect x="540" y="372" width="180" height="18" class="panel-2"/>
<rect x="540" y="372" width="45" height="18" class="amber anim prob-one"/>
<text x="720" y="410" text-anchor="end" class="mono-xs muted">P(1)</text>
</g>`;

const verdict = () => `<g>
<rect x="76" y="66" width="300" height="380" rx="8" class="shadow"/>
<rect x="70" y="60" width="300" height="380" rx="8" class="panel"/>
<rect x="90" y="80" width="260" height="30" rx="4" class="panel-2"/>
<text x="104" y="100" class="mono-xs muted">https://news.example/…</text>
<rect x="90" y="132" width="240" height="16" class="ink-fill"/>
<rect x="90" y="156" width="180" height="16" class="ink-fill"/>
${[196, 218, 240, 262, 300, 322, 344, 366, 400]
  .map(
    (y, i) =>
      (i === 2 || i === 5 ? `<rect x="86" y="${y - 5}" width="${i === 2 ? 170 : 210}" height="18" class="highlight anim mark" ${d(i)}/>` : "") +
      `<rect x="90" y="${y}" width="${[250, 230, 160, 240, 250, 205, 240, 190, 120][i]}" height="8" class="line-fill"/>`,
  )
  .join("")}
<rect x="80" y="120" width="280" height="4" class="accent anim read"/>
<path d="M388 250H430" class="link-strong dashed anim flow"/>
<path d="M422 240L434 250L422 260" class="link-strong"/>
<rect x="452" y="176" width="130" height="150" rx="8" class="shadow"/>
<rect x="446" y="170" width="130" height="150" rx="8" class="navy"/>
${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="466" y="${192 + i * 16}" width="90" height="10" rx="2" class="layer anim fire" ${d(5 - i)}/>`).join("")}
<text x="511" y="306" text-anchor="middle" class="mono-xs on-navy">DISTILBERT</text>
<path d="M598 250H624" class="link-strong dashed anim flow"/>
<rect x="646" y="96" width="120" height="310" rx="8" class="shadow"/>
<rect x="640" y="90" width="120" height="310" rx="8" class="panel"/>
<path d="M660 190A40 40 0 0 1 740 190" class="gauge-track"/>
<path d="M660 190A40 40 0 0 1 738 182" class="gauge anim sweep" pathLength="100"/>
<line x1="700" y1="190" x2="735" y2="172" class="needle anim needle-swing"/>
<text x="700" y="238" text-anchor="middle" class="verdict">REAL</text>
<text x="700" y="262" text-anchor="middle" class="mono-xs muted">99.95% CONF.</text>
<text x="658" y="300" class="mono-xs ink">REAL</text>
<rect x="658" y="308" width="84" height="12" class="green anim grow-x"/>
<text x="658" y="346" class="mono-xs ink">FAKE</text>
<rect x="658" y="354" width="84" height="12" class="panel-2"/>
<rect x="658" y="354" width="3" height="12" class="red"/>
</g>`;

const flood = () => `<g>
<rect x="76" y="66" width="290" height="380" rx="8" class="shadow"/>
<rect x="70" y="60" width="290" height="380" rx="8" class="panel"/>
<clipPath id="flood-tank"><rect x="71" y="61" width="288" height="378" rx="7"/></clipPath>
<g clip-path="url(#flood-tank)">
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<line x1="${120 + i * 32}" y1="${80 + (i % 3) * 14}" x2="${112 + i * 32}" y2="${100 + (i % 3) * 14}" class="rain anim fall" ${d(i)}/>`).join("")}
<g class="anim tide">
<path d="M40 280 Q80 266 120 280 T200 280 T280 280 T360 280 T440 280 V470 H40Z" class="water anim wave"/>
<path d="M40 280 Q80 266 120 280 T200 280 T280 280 T360 280 T440 280" class="water-line anim wave"/>
<rect x="270" y="262" width="22" height="22" class="amber"/>
</g></g>
<rect x="190" y="118" width="50" height="26" rx="3" class="navy"/>
<circle cx="205" cy="131" r="6" class="panel"/>
<circle cx="225" cy="131" r="6" class="panel"/>
<line x1="215" y1="150" x2="215" y2="262" class="beam anim flow"/>
${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="84" y1="${160 + i * 40}" x2="${i % 2 ? 94 : 100}" y2="${160 + i * 40}" class="stroke thin"/>`).join("")}
<text x="108" y="238" class="mono-xs muted">↑ 1.5 cm/min</text>
<text x="404" y="62" class="label">RISK</text>
${["CRITICAL", "HIGH", "MODERATE", "LOW"].map((l, i) => `<rect x="404" y="${84 + i * 50}" width="150" height="40" rx="4" class="shadow"/><rect x="400" y="${80 + i * 50}" width="150" height="40" rx="4" class="panel"/>`).join("")}
<rect x="400" y="130" width="150" height="40" rx="4" class="risk-indicator anim risk-level"/>
${["CRITICAL", "HIGH", "MODERATE", "LOW"].map((l, i) => `<text x="416" y="${105 + i * 50}" class="mono-sm risk-text">${l}</text>`).join("")}
<text x="590" y="62" class="label">SHAP</text>
${[
  ["distance", 0.256],
  ["roll. mean", 0.207],
  ["rain trend", 0.179],
  ["rain level", 0.153],
  ["float", 0.074],
]
  .map(
    ([name, v], i) =>
      `<text x="590" y="${96 + i * 38}" class="mono-xs muted">${name}</text><rect x="590" y="${104 + i * 38}" width="${((v / 0.256) * 150).toFixed(1)}" height="12" class="${i < 3 ? "accent" : "frost-soft"} anim attribution" ${d(i)}/>`,
  )
  .join("")}
<rect x="406" y="306" width="344" height="134" rx="8" class="shadow"/>
<rect x="400" y="300" width="344" height="134" rx="8" class="navy"/>
<text x="420" y="330" class="mono-xs on-navy-muted">LOCAL LLM · EXPLANATION</text>
<rect x="420" y="348" width="290" height="8" class="navy-line anim type" ${d(0)}/>
<rect x="420" y="368" width="250" height="8" class="navy-line anim type" ${d(1)}/>
<rect x="420" y="388" width="200" height="8" class="navy-line anim type" ${d(2)}/>
<rect x="626" y="384" width="10" height="16" class="amber anim blink"/>
</g>`;

const ledger = () => {
  const blocks = [
    { x: 70, y: 110, l: "COLLECT", s: "gps + time" },
    { x: 210, y: 180, l: "LAB TEST", s: "purity" },
    { x: 350, y: 110, l: "PROCESS", s: "dry · grind" },
    { x: 490, y: 180, l: "PACKAGE", s: "batch 0425" },
    { x: 630, y: 110, l: "SCAN", s: "consumer" },
  ];
  return `<g>
${blocks
  .map((b, i, arr) => {
    const nav = i === 4;
    return (
      (i < arr.length - 1 ? `<path d="M${b.x + 100} ${b.y + 50} L${arr[i + 1].x} ${arr[i + 1].y + 50}" class="chain anim flow"/>` : "") +
      `<g class="anim confirm" ${d(i)}>
<rect x="${b.x + 7}" y="${b.y + 7}" width="100" height="100" rx="6" class="shadow"/>
<rect x="${b.x}" y="${b.y}" width="100" height="100" rx="6" class="${nav ? "navy" : "panel"}"/>
<text x="${b.x + 14}" y="${b.y + 28}" class="mono-xs ${nav ? "on-navy-muted" : "muted"}">0${i + 1}</text>
<text x="${b.x + 14}" y="${b.y + 70}" class="mono-sm ${nav ? "on-navy" : "ink"}">${b.l}</text>
<text x="${b.x + 14}" y="${b.y + 88}" class="mono-xs ${nav ? "on-navy-muted" : "muted"}">${b.s}</text></g>`
    );
  })
  .join("")}
<path d="M120 60 C120 44 144 44 144 60 C144 72 132 84 132 90 C132 84 120 72 120 60Z" class="accent anim bounce" transform="translate(-10 4)"/>
<text x="146" y="66" class="mono-xs muted">20.29°N 85.82°E</text>
<rect x="76" y="336" width="400" height="120" rx="8" class="shadow"/>
<rect x="70" y="330" width="400" height="120" rx="8" class="panel"/>
<text x="90" y="360" class="label">HERB JOURNEY · ASHWAGANDHA</text>
${[0, 1, 2, 3]
  .map(
    (i) =>
      `<rect x="${90 + i * 92}" y="382" width="80" height="10" class="panel-2"/><rect x="${90 + i * 92}" y="382" width="80" height="10" class="${i < 3 ? "accent" : "frost-soft"} anim fill-step" ${d(i)}/><text x="${90 + i * 92}" y="418" class="mono-xs muted">${["tx 7f2a", "tx 91c0", "tx 3be4", "tx c6d1"][i]}</text>`,
  )
  .join("")}
<rect x="556" y="306" width="170" height="170" rx="8" class="shadow"/>
<rect x="550" y="300" width="170" height="170" rx="8" class="panel"/>
<g transform="translate(572 322) scale(6)">${qrMarkup(qr(11, 21))}</g>
<rect x="560" y="318" width="150" height="4" class="amber anim qr-scan"/>
</g>`;
};

const cycle = () => {
  const ring = Array.from({ length: 28 }, (_, i) => {
    const day = i + 1;
    const phase = day <= 5 ? "red" : day <= 13 ? "frost" : day <= 16 ? "amber" : "accent";
    const a0 = (i / 28) * Math.PI * 2 - Math.PI / 2 + 0.02;
    const a1 = ((i + 1) / 28) * Math.PI * 2 - Math.PI / 2 - 0.02;
    const cx = 250, cy = 250, ro = 165, ri = 118;
    const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    return { i, phase, d: `M${p(ro, a0)}A${ro} ${ro} 0 0 1 ${p(ro, a1)}L${p(ri, a1)}A${ri} ${ri} 0 0 0 ${p(ri, a0)}Z` };
  });
  const a = (13.5 / 28) * Math.PI * 2 - Math.PI / 2;
  const marker = { x: 250 + 190 * Math.cos(a), y: 250 + 190 * Math.sin(a) };
  return `<g>
<circle cx="258" cy="258" r="176" class="shadow"/>
<circle cx="250" cy="250" r="176" class="panel"/>
${ring.map((s) => `<path d="${s.d}" class="seg ${s.phase} anim phase-wave" ${d(s.i)}/>`).join("")}
<rect x="${(marker.x - 9).toFixed(1)}" y="${(marker.y - 9).toFixed(1)}" width="18" height="18" class="ink-fill anim pulse"/>
<text x="250" y="244" text-anchor="middle" class="big-mono ink">DAY 14</text>
<text x="250" y="272" text-anchor="middle" class="mono-xs muted">OVULATION WINDOW</text>
${[
  { y: 60, l: "CO₂", v: "612 ppm", seed: 5 },
  { y: 180, l: "HUMIDITY", v: "64 %", seed: 9 },
]
  .map(
    (t, i) => `<rect x="486" y="${t.y + 6}" width="260" height="100" rx="6" class="shadow"/>
<rect x="480" y="${t.y}" width="260" height="100" rx="6" class="panel"/>
<text x="498" y="${t.y + 28}" class="mono-xs muted">${t.l}</text>
<text x="722" y="${t.y + 28}" text-anchor="end" class="mono-sm ink">${t.v}</text>
<path d="${spark(t.seed, 498, t.y + 42, 224, 42)}" class="spark anim draw" pathLength="100" ${d(i * 4)}/>`,
  )
  .join("")}
<rect x="486" y="306" width="260" height="100" rx="6" class="shadow"/>
<rect x="480" y="300" width="260" height="100" rx="6" class="panel"/>
<text x="498" y="328" class="mono-xs muted">BIN LOAD</text>
<rect x="498" y="344" width="224" height="16" class="panel-2"/>
<rect x="498" y="344" width="170" height="16" class="amber anim load"/>
<g class="anim blink"><rect x="498" y="372" width="96" height="18" rx="3" class="navy"/><text x="508" y="385" class="mono-xs on-navy">SERVICE</text></g>
<text x="480" y="440" class="label">ESP32 · 9 SENSORS</text>
</g>`;
};

const scanner = () => `<g>
<rect x="96" y="46" width="240" height="420" rx="26" class="shadow"/>
<rect x="90" y="40" width="240" height="420" rx="26" class="navy"/>
<rect x="106" y="70" width="208" height="360" rx="10" class="panel"/>
<path d="M126 96V86H136M294 86H284M294 86V96M126 404V414H136M284 414H294V404" class="bracket anim focus"/>
<rect x="140" y="130" width="140" height="210" rx="4" class="panel-2"/>
<g transform="translate(160 146) scale(4.8)">${qrMarkup(qr(3, 21))}</g>
<rect x="150" y="304" width="120" height="24" class="ocr-box anim march"/>
<rect x="158" y="312" width="90" height="8" class="line-fill"/>
<text x="152" y="298" class="mono-xs accent-text">OCR</text>
<rect x="120" y="226" width="180" height="4" class="amber anim scanline"/>
<text x="380" y="62" class="label">INVENTORY</text>
<rect x="386" y="86" width="360" height="200" rx="8" class="shadow"/>
<rect x="380" y="80" width="360" height="200" rx="8" class="panel"/>
${[
  ["ANTA003", "Antacid", "20"],
  ["PARA004", "Paracetamol", "64"],
  ["OREO001", "Biscuits", "8"],
  ["SHAM002", "Shampoo", "37"],
]
  .map(
    (row, i) =>
      (i === 2 ? `<rect x="388" y="${96 + i * 44}" width="344" height="36" rx="4" class="highlight anim mark"/>` : "") +
      `<text x="400" y="${120 + i * 44}" class="mono-xs ink">${row[0]}</text><text x="500" y="${120 + i * 44}" class="mono-xs muted">${row[1]}</text><text x="650" y="${120 + i * 44}" text-anchor="end" class="mono-xs ink">${row[2]}</text>` +
      (i === 2 ? `<g class="anim blink"><rect x="664" y="${105 + i * 44}" width="62" height="20" rx="3" class="amber"/><text x="672" y="${119 + i * 44}" class="mono-xs ink-dark">LOW</text></g>` : ""),
  )
  .join("")}
<text x="380" y="326" class="label">DEMAND</text>
<rect x="386" y="346" width="360" height="110" rx="8" class="shadow"/>
<rect x="380" y="340" width="360" height="110" rx="8" class="panel"/>
${[0.35, 0.5, 0.42, 0.7, 0.62, 0.85, 0.78].map((v, i) => `<rect x="${404 + i * 46}" y="${(436 - v * 76).toFixed(1)}" width="30" height="${(v * 76).toFixed(1)}" class="${v > 0.6 ? "accent" : "frost-soft"} anim bars" ${d(i)}/>`).join("")}
<line x1="396" y1="386" x2="724" y2="386" class="threshold anim flow"/>
</g>`;

const drawings = { consensus, bloch, verdict, flood, ledger, cycle, scanner };

// Everything below the drawing: grid background, then the art. Wrap in a <svg> or <g> by the caller.
export const coverMarkup = (visual) =>
  `<defs><pattern id="grid-${visual}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" class="grid-line"/></pattern></defs>` +
  `<rect width="${COVER_W}" height="${COVER_H}" class="bg"/><rect width="${COVER_W}" height="${COVER_H}" fill="url(#grid-${visual})"/>` +
  drawings[visual]();

export const coverCss = (t) => `
svg{--navy:${t.navy};--bg-sunk:${t.bgSunk};--surface:${t.surface};--surface-2:${t.surface2};--line:${t.line};--line-strong:${t.lineStrong};--text:${t.text};--text-muted:${t.textMuted};--text-faint:${t.textFaint};--accent:${t.accent};--frost:${t.frost};--green:${t.green};--amber:${t.amber};--red:${t.red};--shadow:${t.shadow};--ease:cubic-bezier(0.2,0.7,0.2,1);--font-display:'Space Mono',ui-monospace,Consolas,monospace}
.bg{fill:var(--surface-2)}.grid-line{stroke:var(--line);stroke-width:1}
.panel{fill:var(--surface);stroke:var(--line-strong);stroke-width:1.5}.panel-2{fill:var(--bg-sunk)}.shadow{fill:var(--shadow)}
.navy{fill:var(--navy)}.accent{fill:var(--accent)}.amber{fill:var(--amber)}.green{fill:var(--green)}.red{fill:var(--red)}
.frost-soft{fill:var(--frost);opacity:.45}.ink-fill{fill:var(--text)}.line-fill{fill:var(--line-strong)}.highlight{fill:var(--amber);opacity:.28}
.stroke{fill:none;stroke:var(--text-faint);stroke-width:2}.stroke.thin{stroke-width:1.2;opacity:.7}.dashed{stroke-dasharray:6 6}
.stroke-amber{fill:none;stroke:var(--amber);stroke-width:2.5;stroke-dasharray:4 4}
.label{font-family:var(--font-display);font-size:15px;letter-spacing:.1em;fill:var(--text-muted)}
.mono-sm{font-family:var(--font-display);font-size:16px;font-weight:700}.mono-xs{font-family:var(--font-display);font-size:13px}
.big-mono{font-family:var(--font-display);font-size:34px;font-weight:700}
.ink{fill:var(--text)}.ink-dark{fill:#1b2130}.muted{fill:var(--text-faint)}.on-navy{fill:#f4f6fb}.on-navy-muted{fill:#c3cdf2}.accent-text{fill:var(--accent)}.amber-text{fill:var(--amber)}
.hull{fill:var(--accent);fill-opacity:.08;stroke:var(--accent);stroke-width:2;stroke-dasharray:8 7}
.edge-strong{stroke:var(--accent);stroke-width:5;stroke-dasharray:18 6}.edge-mid{stroke:var(--text-faint);stroke-width:3;opacity:.6}
.edge-weak{stroke:var(--text-faint);stroke-width:1.5;stroke-dasharray:5 6;opacity:.55}
.node-letter{font-family:var(--font-display);font-size:24px;font-weight:700}.link{stroke:var(--line-strong);stroke-width:3}
.vector{stroke:${t.name === "dark" ? "var(--accent)" : "var(--navy)"};stroke-width:7;stroke-linecap:square}
.ket{font-family:var(--font-display);font-size:22px;font-weight:700;fill:var(--text)}
.link-strong{fill:none;stroke:var(--text-faint);stroke-width:3}.layer{fill:#f4f6fb;opacity:.35}
.gauge-track{fill:none;stroke:var(--line);stroke-width:12}.gauge{fill:none;stroke:var(--green);stroke-width:12}.needle{stroke:var(--text);stroke-width:3}
.verdict{font-family:var(--font-display);font-size:26px;font-weight:700;fill:var(--green)}
.rain{stroke:var(--frost);stroke-width:2.5;stroke-linecap:round}.beam{stroke:${t.name === "dark" ? "var(--accent)" : "var(--navy)"};stroke-width:2;stroke-dasharray:3 5}
.water{fill:var(--frost);opacity:.35}.water-line{fill:none;stroke:var(--frost);stroke-width:3}.navy-line{fill:#f4f6fb;opacity:.4}
.risk-text{fill:var(--text)}.risk-indicator{fill:var(--amber);fill-opacity:.3;stroke:var(--amber);stroke-width:3}
.chain{stroke:var(--text-faint);stroke-width:4;stroke-dasharray:12 6;fill:none}.qr-ring{fill:none;stroke:var(--text);stroke-width:1}
.seg.red{fill:var(--red);opacity:.85}.seg.frost{fill:var(--frost);opacity:.6}.seg.amber{fill:var(--amber)}.seg.accent{fill:var(--accent);opacity:.55}
.spark{fill:none;stroke:var(--accent);stroke-width:2.5}.bracket{fill:none;stroke:var(--accent);stroke-width:3}
.ocr-box{fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:5 4}.threshold{stroke:var(--amber);stroke-width:2;stroke-dasharray:6 5}
.anim{transform-box:fill-box;transform-origin:center;animation:var(--anim);animation-delay:calc(var(--i,0)*var(--step,140ms))}
.flow{--anim:dash-flow 1.1s linear infinite}.march{--anim:dash-flow 2.4s linear infinite}.flicker{--anim:flicker 2.6s ease-in-out infinite}
.blink{--anim:blink 1.1s steps(1) infinite}.mark{--anim:mark 2.4s ease-in-out infinite}
@keyframes dash-flow{to{stroke-dashoffset:-48}}@keyframes flicker{0%,100%{opacity:.55}50%{opacity:.12}}@keyframes blink{50%{opacity:.15}}@keyframes mark{0%,100%{opacity:.28}50%{opacity:.6}}
.speak{--anim:speak 2.5s var(--ease) infinite;--step:180ms}.append{--anim:append 3.5s var(--ease) infinite}.commit{--anim:commit 3.5s var(--ease) infinite}
.shots{transform-origin:bottom;--anim:shots .9s ease-in-out infinite alternate;--step:90ms}
@keyframes speak{0%,30%,100%{transform:none}12%{transform:translateY(-8px) scale(1.06)}}
@keyframes append{0%,70%,100%{opacity:1;transform:none}8%{opacity:.35;transform:translateX(-10px)}}
@keyframes commit{0%,60%,100%{transform:none}70%{transform:scale(1.05)}80%{transform:none}}
@keyframes shots{from{transform:scaleY(1)}to{transform:scaleY(.55)}}
.precess{transform-box:view-box;transform-origin:250px 250px;--anim:precess 4s ease-in-out infinite}.meridian{--anim:meridian 4s ease-in-out infinite}
.signal{--anim:signal 2.2s linear infinite;--step:180ms}.gate{--anim:gate 2.2s ease-in-out infinite}
.prob-zero{transform-origin:left;--anim:prob-zero 4s ease-in-out infinite}.prob-one{transform-origin:left;--anim:prob-one 4s ease-in-out infinite}
@keyframes precess{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-62deg)}}@keyframes meridian{0%,100%{transform:scaleX(1)}50%{transform:scaleX(2.4)}}
@keyframes signal{0%{transform:translateX(0);opacity:1}88%{transform:translateX(206px);opacity:1}92%{transform:translateX(206px);opacity:0}96%{transform:translateX(0);opacity:0}100%{opacity:1}}
@keyframes gate{0%,100%{opacity:1}18%{opacity:.55}}@keyframes prob-zero{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.4)}}@keyframes prob-one{0%,100%{transform:scaleX(1)}50%{transform:scaleX(2.8)}}
.read{opacity:0;--anim:read 2.6s ease-in-out infinite}.fire{--anim:fire 1.4s ease-in-out infinite}.sweep{stroke-dasharray:100;--anim:sweep 2.6s var(--ease) infinite}
.needle-swing{transform-box:view-box;transform-origin:700px 190px;--anim:needle 2.6s var(--ease) infinite}.grow-x{transform-origin:left;--anim:grow-x 2.6s var(--ease) infinite}
@keyframes read{0%{transform:translateY(0);opacity:0}10%,90%{opacity:1}100%{transform:translateY(290px);opacity:0}}@keyframes fire{0%,100%{opacity:.35}30%{opacity:.95}}
@keyframes sweep{0%{stroke-dashoffset:0}12%{stroke-dashoffset:100}60%,100%{stroke-dashoffset:0}}
@keyframes needle{0%{transform:rotate(0deg)}12%{transform:rotate(-150deg)}50%{transform:rotate(8deg)}62%,100%{transform:rotate(0deg)}}
@keyframes grow-x{0%{transform:scaleX(1)}12%{transform:scaleX(0)}60%,100%{transform:scaleX(1)}}
.fall{--anim:fall .9s linear infinite;--step:110ms}.tide{--anim:tide 5s ease-in-out infinite}.wave{--anim:wave 1.6s linear infinite}
.risk-level{--anim:risk 5s ease-in-out infinite}.attribution{transform-origin:left;--anim:attribution 5s ease-in-out infinite;--step:0ms}
.type{transform-origin:left;--anim:type 3s steps(10) infinite;--step:700ms}
@keyframes fall{0%{transform:translateY(0);opacity:1}50%{transform:translateY(30px);opacity:0}51%{transform:translateY(-16px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes tide{0%,100%{transform:translateY(0)}45%{transform:translateY(96px)}}@keyframes wave{to{transform:translateX(-80px)}}
@keyframes risk{0%,100%{transform:translateY(0)}45%{transform:translateY(100px)}}@keyframes attribution{0%,100%{transform:scaleX(1)}45%{transform:scaleX(.35)}}
@keyframes type{0%{transform:scaleX(1)}8%{transform:scaleX(0)}60%,100%{transform:scaleX(1)}}
.confirm{--anim:confirm 3.2s var(--ease) infinite;--step:320ms}.fill-step{transform-origin:left;--anim:fill-step 3.2s var(--ease) infinite;--step:320ms}
.bounce{--anim:bounce 1.2s ease-in-out infinite}.qr-scan{--anim:qr-scan 2s ease-in-out infinite alternate}
@keyframes confirm{0%,40%,100%{transform:none}12%{transform:translateY(-10px)}}@keyframes fill-step{0%{transform:scaleX(1)}8%{transform:scaleX(0)}40%,100%{transform:scaleX(1)}}
@keyframes bounce{0%,100%{transform:translate(-10px,4px)}50%{transform:translate(-10px,-6px)}}@keyframes qr-scan{from{transform:translateY(0)}to{transform:translateY(128px)}}
.phase-wave{--anim:phase-wave 2.8s ease-in-out infinite;--step:100ms}.pulse{--anim:pulse 1.4s ease-in-out infinite}
.draw{stroke-dasharray:100;--anim:draw 2.4s ease-in-out infinite}.load{transform-origin:left;--anim:load 3s ease-in-out infinite}
@keyframes phase-wave{0%,100%{transform:scale(1)}15%{transform:scale(1.06)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}
@keyframes draw{0%{stroke-dashoffset:0}10%{stroke-dashoffset:100}70%,100%{stroke-dashoffset:0}}@keyframes load{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.45)}}
.scanline{--anim:scan 1.6s ease-in-out infinite alternate}.focus{--anim:focus 1.6s ease-in-out infinite}.bars{transform-origin:bottom;--anim:bars 2.4s ease-in-out infinite}
@keyframes scan{from{transform:translateY(-90px)}to{transform:translateY(90px)}}@keyframes focus{0%,100%{transform:scale(1)}50%{transform:scale(.96)}}
@keyframes bars{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.4)}}
`;
