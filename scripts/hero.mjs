// The hero banner: the portfolio's navy hero with its 3D lattice, rebuilt as a self-contained SVG.
//
// The lattice is the same seeded feed-forward "network" the portfolio renders with Three.js
// (lattice-data.ts). GitHub READMEs can't run JavaScript, so the camera orbit is projected ahead of
// time into SMIL keyframes, and amber signals are scheduled hop by hop along real edges, lighting the
// cubes they reach. The result loops seamlessly and needs nothing but the browser's SVG renderer.
import { MONO, SANS, esc, fontFaces, grainDefs, mulberry32, portraitURI, r1, wrap } from "./lib.mjs";
import { profile } from "./data.mjs";

const W = 1200;
const H = 600;
const LOOP = 24; // seconds for one full orbit cycle
const FRAMES = 24;

function buildLattice(seed = 2430) {
  const rand = mulberry32(seed);
  const layerShape = [3, 4, 5, 5, 4, 3, 2];
  const nodes = [];
  const layerOf = [];
  const layerStart = [];
  layerShape.forEach((n, l) => {
    layerStart.push(nodes.length);
    const x = (l - (layerShape.length - 1) / 2) * 1.75;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        nodes.push([x + (rand() - 0.5) * 0.25, (i - (n - 1) / 2) * 0.9 + (rand() - 0.5) * 0.12, (j - (n - 1) / 2) * 0.9 + (rand() - 0.5) * 0.12]);
        layerOf.push(l);
      }
  });
  layerStart.push(nodes.length);
  const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  const edges = [];
  const outgoing = nodes.map(() => []);
  for (let a = 0; a < nodes.length; a++) {
    const l = layerOf[a];
    if (l === layerShape.length - 1) continue;
    const candidates = [];
    for (let b = layerStart[l + 1]; b < layerStart[l + 2]; b++) candidates.push(b);
    candidates.sort((p, q) => dist2(nodes[a], nodes[p]) - dist2(nodes[a], nodes[q]));
    const count = 2 + Math.floor(rand() * 2);
    for (let k = 0; k < count; k++) {
      const pick = candidates[Math.min(candidates.length - 1, k + Math.floor(rand() * 3))];
      if (outgoing[a].some((e) => edges[e][1] === pick)) continue;
      outgoing[a].push(edges.length);
      edges.push([a, pick]);
    }
  }
  return { nodes, layerOf, edges, outgoing };
}

// Same camera as the portfolio scene: perspective, fov 30, z = 15.
function project(nodes, rotY, rotX, camZ = 15, fov = 30) {
  const f = 1 / Math.tan(((fov / 2) * Math.PI) / 180);
  const cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
  return nodes.map(([x, y, z]) => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;
    const depth = camZ - z2;
    return { x: (x1 * f) / depth, y: (-y2 * f) / depth, depth };
  });
}

// A slow orbit around the portfolio's resting angle (rotY −0.55, rotX 0.1).
const orbit = (t) => {
  const a = (t / LOOP) * Math.PI * 2;
  return { rotY: -0.55 + Math.sin(a) * 0.34, rotX: 0.1 + Math.cos(a) * 0.08 };
};

function lattice(data, { cx, cy, width }) {
  const rest = project(data.nodes, -0.55, 0.1);
  const xs = rest.map((p) => p.x);
  const scale = width / (Math.max(...xs) - Math.min(...xs));
  const toScreen = (p) => [cx + p.x * scale, cy + p.y * scale];
  const at = (t) => {
    const { rotY, rotX } = orbit(((t % LOOP) + LOOP) % LOOP);
    return project(data.nodes, rotY, rotX).map(toScreen);
  };
  const frames = Array.from({ length: FRAMES + 1 }, (_, k) => at((k / FRAMES) * LOOP));
  const n = (v) => Math.round(v);

  // Edges: one path whose geometry is keyframed across the orbit.
  const edgePath = (pts) => data.edges.map(([a, b]) => `M${n(pts[a][0])} ${n(pts[a][1])}L${n(pts[b][0])} ${n(pts[b][1])}`).join("");
  const edges =
    `<path d="${edgePath(frames[0])}" fill="none" stroke="#c3cdf2" stroke-opacity="0.24" stroke-width="1.3">` +
    `<animate attributeName="d" dur="${LOOP}s" repeatCount="indefinite" values="${frames.map(edgePath).join(";")}"/></path>`;

  // Signals: each rides entry edge → output layer with a fixed hop time and its own phase.
  const rand = mulberry32(99);
  const entryEdges = data.edges.map((e, i) => (data.layerOf[e[0]] === 0 ? i : -1)).filter((i) => i >= 0);
  const heat = data.nodes.map(() => []);
  let pulses = "";
  for (let p = 0; p < 22; p++) {
    const hop = 1.05 + rand() * 0.75;
    const phase = rand() * LOOP;
    let edge = entryEdges[Math.floor(rand() * entryEdges.length)];
    const route = [data.edges[edge][0]];
    while (edge !== undefined) {
      const reached = data.edges[edge][1];
      route.push(reached);
      const next = data.outgoing[reached];
      edge = next.length ? next[Math.floor(rand() * next.length)] : undefined;
    }
    const travel = (route.length - 1) * hop;
    const docTime = (local) => (((local - phase) % LOOP) + LOOP) % LOOP;
    const pos = route.map((node, k) => at(docTime(k * hop))[node]);
    route.forEach((node, k) => k > 0 && heat[node].push(docTime(k * hop)));
    const keyTimes = [...route.map((_, k) => (k * hop) / LOOP), 1].map((v) => v.toFixed(4)).join(";");
    const values = [...pos, pos[pos.length - 1]].map(([x, y]) => `${r1(x)} ${r1(y)}`).join(";");
    pulses +=
      `<rect x="-4.5" y="-4.5" width="9" height="9" fill="#ebcb8b" opacity="0">` +
      `<animateTransform attributeName="transform" type="translate" dur="${LOOP}s" begin="-${phase.toFixed(2)}s" repeatCount="indefinite" calcMode="linear" keyTimes="${keyTimes}" values="${values}"/>` +
      `<animate attributeName="opacity" dur="${LOOP}s" begin="-${phase.toFixed(2)}s" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${(travel / LOOP).toFixed(4)}" values="1;0"/></rect>`;
  }

  // Cubes: a small matte box per node (front, lit top, shaded side), painted far to near.
  const restDepth = rest.map((p) => p.depth);
  const order = rest.map((_, i) => i).sort((a, b) => restDepth[b] - restDepth[a]);
  const base = "#8fa3e6";
  const hot = "#ebcb8b";
  const cubes = order
    .map((i) => {
      const size = (0.22 * 3.732 * scale) / restDepth[i];
      const shade = Math.max(0.5, Math.min(1, 1.35 - restDepth[i] / 22));
      const values = frames.map((pts) => `${r1(pts[i][0])} ${r1(pts[i][1])}`).join(";");
      // Heat: flash amber on arrival, cool back over ~0.9s (skip overlaps and loop edges).
      const hits = heat[i].sort((a, b) => a - b).filter((t, k, arr) => t > 0.05 && t < LOOP - 1 && (k === 0 || t - arr[k - 1] > 1));
      let fillAnim = "";
      if (hits.length) {
        const kt = ["0"];
        const kv = [base];
        hits.forEach((t) => {
          kt.push((t / LOOP).toFixed(4), ((t + 0.05) / LOOP).toFixed(4), ((t + 0.95) / LOOP).toFixed(4));
          kv.push(base, hot, base);
        });
        kt.push("1");
        kv.push(base);
        fillAnim = `<animate attributeName="fill" dur="${LOOP}s" repeatCount="indefinite" keyTimes="${kt.join(";")}" values="${kv.join(";")}"/>`;
      }
      return (
        `<g opacity="${shade.toFixed(2)}"><animateTransform attributeName="transform" type="translate" dur="${LOOP}s" repeatCount="indefinite" values="${values}"/>` +
        `<use href="#cube" fill="${base}" transform="scale(${(size / 20).toFixed(3)})">${fillAnim}</use></g>`
      );
    })
    .join("");

  const cubeDef =
    `<g id="cube"><rect x="-10" y="-10" width="20" height="20"/>` +
    `<path d="M-10 -10 L-4 -16 L16 -16 L10 -10Z" fill="#dfe6fb" fill-opacity="0.55"/>` +
    `<path d="M10 -10 L16 -16 L16 4 L10 10Z" fill="#0f1d57" fill-opacity="0.4"/></g>`;

  return { defs: cubeDef, markup: edges + cubes + pulses };
}

export function hero() {
  // Pixel squares that blink on the grid, kept to the edges (same spots as the portfolio).
  const pixels = [
    { x: 2, y: 9, d: 0 }, { x: 62, y: 12, d: 2.4 }, { x: 88, y: 30, d: 1.1 }, { x: 1, y: 84, d: 3.2 },
    { x: 54, y: 3, d: 0.6 }, { x: 76, y: 8, d: 4 }, { x: 96, y: 58, d: 1.8 }, { x: 40, y: 91, d: 5 },
  ];
  // Stepped pixel bottom edge (Hero.astro clip-path), in % of width.
  const e = [
    [0, 0], [100, 0], [100, 24], [92, 24], [92, 12], [81, 12], [81, 0], [70, 0], [70, 12], [57, 12], [57, 24], [44, 24],
    [44, 12], [30, 12], [30, 0], [17, 0], [17, 12], [6, 12], [6, 24], [0, 24],
  ];
  const clip = e.map(([px, up], i) => `${i ? "L" : "M"}${(px / 100) * W} ${i < 2 ? 0 : H - up}`).join("") + "Z";

  const pw = 440;
  const ph = Math.round((pw * 1377) / 1400);
  const px = W - 64 - pw;
  const py = H - ph;
  // The portfolio's halo is 2.1× the portrait; slightly smaller here so it clears the headline.
  const net = lattice(buildLattice(), { cx: px + pw / 2 + 36, cy: py + ph * 0.34, width: pw * 1.9 });

  const lede = wrap(profile.summary, 470, 20);
  const statusY = 548;

  const css =
    fontFaces() +
    `.px{animation:blink 7s infinite steps(1,end)}@keyframes blink{0%,100%{opacity:1}35%{opacity:.25}60%{opacity:.8}}` +
    `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(`${profile.name}, ${profile.title}, building AI that shows its work`)}">
<title>${esc(`${profile.name} · ${profile.title}`)}</title>
<style>${css}</style>
<defs>
<clipPath id="hero"><path d="${clip}"/></clipPath>
<pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse" x="${(W / 2) % 64}" y="${(H / 2) % 64}"><path d="M0 .5H64M.5 0V64" stroke="#fff" stroke-opacity="0.065"/></pattern>
${grainDefs("grain", "on-navy")}
<filter id="silhouette" x="-5%" y="-5%" width="115%" height="115%"><feFlood flood-color="#0f1d57"/><feComposite in2="SourceAlpha" operator="in"/><feOffset dx="15" dy="11"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
${net.defs}
</defs>
<g clip-path="url(#hero)">
<rect width="${W}" height="${H}" fill="#2342b8"/>
${pixels.map((p) => `<rect class="px" x="${(p.x / 100) * W}" y="${(p.y / 100) * H}" width="64" height="64" fill="#1a3190" style="animation-delay:${p.d}s"/>`).join("")}
<rect width="${W}" height="${H}" fill="url(#grid)"/>
<rect width="${W}" height="${H}" fill="url(#grain)"/>
<g>${net.markup}</g>
<image href="${portraitURI()}" x="${px}" y="${py}" width="${pw}" height="${ph}" filter="url(#silhouette)"/>
<text x="64" y="138" font-family="${MONO}" font-size="24" letter-spacing="1.9" fill="#c3cdf2">I'M ${esc(profile.firstName.toUpperCase())}</text>
<text x="60" y="240" font-family="${MONO}" font-weight="700" font-size="86" letter-spacing="-0.9" fill="#f4f6fb">AI/ML ENGINEER</text>
<text x="64" y="302" font-family="${MONO}" font-weight="700" font-size="42" letter-spacing="-0.4" fill="#dfe6fb">BUILDING AI THAT</text>
<text x="64" y="346" font-family="${MONO}" font-weight="700" font-size="42" letter-spacing="-0.4" fill="#dfe6fb">SHOWS ITS WORK</text>
${lede.map((l, i) => `<text x="64" y="${404 + i * 30}" font-family="${SANS}" font-size="20" fill="#c3cdf2">${esc(l)}</text>`).join("")}
<rect x="64" y="${statusY - 11}" width="11" height="11" fill="#a3be8c"/><rect x="61" y="${statusY - 14}" width="17" height="17" fill="none" stroke="#a3be8c" stroke-opacity="0.3" stroke-width="3"/>
<text x="90" y="${statusY}" font-family="${MONO}" font-size="15" letter-spacing="0.9" fill="#c3cdf2">${esc(profile.availability.toUpperCase())}  <tspan fill-opacity="0.5">/</tspan>  ${esc(profile.location.toUpperCase())}</text>
</g>
</svg>`;
}
