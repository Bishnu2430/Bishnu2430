// Shared helpers for every generated SVG: the portfolio's design tokens, embedded fonts and grain,
// text measuring/wrapping, and a few drawing primitives (cards, chips, icons).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "scripts", "src");
const b64 = (file) => readFileSync(join(SRC, file)).toString("base64");

// Portfolio tokens (src/styles/global.css). Snow Storm = light, Polar Night = dark.
const shared = {
  navy: "#2342b8",
  navyDeep: "#1a3190",
  navyInk: "#0f1d57",
  onNavy: "#f4f6fb",
  onNavyMuted: "#c3cdf2",
};
export const themes = {
  light: {
    ...shared,
    name: "light",
    bg: "#eceff4",
    bgSunk: "#e2e7ef",
    surface: "#f8f9fb",
    surface2: "#e5e9f0",
    line: "#d3dae6",
    lineStrong: "#b9c3d3",
    text: "#1b2130",
    textMuted: "#4c566a",
    textFaint: "#6b768a",
    accent: "#2342b8",
    accentSoft: "#dfe5fa",
    frost: "#5e81ac",
    green: "#5f8a4a",
    amber: "#a8751c",
    red: "#b34a53",
    shadow: "#c4ccd9",
  },
  dark: {
    ...shared,
    name: "dark",
    bg: "#1b2130",
    bgSunk: "#161b27",
    surface: "#232a3a",
    surface2: "#2b3346",
    line: "#333c50",
    lineStrong: "#434d63",
    text: "#e5e9f0",
    textMuted: "#a3adbf",
    textFaint: "#7d889c",
    accent: "#8fa8ff",
    accentSoft: "#26325a",
    frost: "#88c0d0",
    green: "#a3be8c",
    amber: "#ebcb8b",
    red: "#d0747c",
    shadow: "#10141d",
  },
};

export const MONO = `'Space Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace`;
export const SANS = `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

// GitHub shows README images through <img>, which can't fetch fonts — so they travel inside the SVG.
// The files are Space Mono subset to ASCII plus a few punctuation marks (~11 KB each).
export const fontFaces = (weights = [400, 700]) =>
  weights
    .map(
      (w) =>
        `@font-face{font-family:'Space Mono';font-weight:${w};font-style:normal;src:url(data:font/woff;base64,${b64(`fonts/space-mono-${w}.woff`)}) format('woff');}`,
    )
    .join("");

// Embed only the weights a drawing actually uses.
const usedWeights = (markup) => {
  const bold = /font-weight="700"|font-weight:700|mono-sm|big-mono|node-letter|\bket\b|\bverdict\b/.test(markup);
  const regular = /<text(?![^>]*font-weight="700")[^>]*Space Mono|mono-xs|\blabel\b/.test(markup);
  return [regular && 400, bold && 700].filter(Boolean);
};

export const portraitURI = () => `data:image/webp;base64,${b64("portrait.webp")}`;

// Matte grain as a small tiled PNG (cheaper to paint than a live feTurbulence filter under animation).
export const grainDefs = (id, t) => {
  const file = t === "on-navy" ? "grain-dark-ink.png" : t.name === "light" ? "grain-soft-ink.png" : "grain-light-ink.png";
  return `<pattern id="${id}" width="96" height="96" patternUnits="userSpaceOnUse"><image href="data:image/png;base64,${b64(file)}" width="96" height="96"/></pattern>`;
};

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const r1 = (n) => Math.round(n * 10) / 10;

// Advance widths (em) for the system sans stack: the wider of Segoe UI and Arial per glyph, plus 3%.
// Erring wide means wrapped lines and inline tags never collide on Windows, macOS or Linux.
const metrics = JSON.parse(readFileSync(join(SRC, "sans-metrics.json"), "utf8"));
export const textWidth = (s, size, font = "sans", weight = 400) => {
  if (font === "mono") return [...s].length * 0.6125 * size;
  const table = metrics[weight >= 600 ? "600" : "400"];
  return [...s].reduce((w, ch) => w + (table[ch] ?? 0.6), 0) * size;
};

export function wrap(text, maxWidth, size, font = "sans", weight = 400) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, font, weight) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Minimal stroke icons from the portfolio (Icon.astro), 24px grid.
export const iconPaths = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
  "arrow-down": '<path d="M12 4v16M6 14l6 6 6-6"/>',
  github:
    '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
  file: '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4M9 13h6M9 17h4"/>',
  "map-pin": '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  cap: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  layers: '<path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14 -1.5 7 5-3 5 3-1.5-7"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h8"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 12.5h18"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>',
  flame: '<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-9-1 2-2 3-3.5 3.5C9 7 8.5 5.5 9 4c-3 2-3 6-3 11a6 6 0 0 0 6 6z"/>',
  repo: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',
  commit: '<circle cx="12" cy="12" r="3.5"/><path d="M3 12h5.5M15.5 12H21"/>',
};

export const icon = (name, x, y, size, color, width = 1.8) =>
  `<g transform="translate(${r1(x)} ${r1(y)}) scale(${size / 24})" fill="none" stroke="${color}" stroke-width="${(width * 24) / size > 3 ? 3 : width}" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</g>`;

// A matte card: solid offset shadow, 1px border, optional grain. No blur anywhere.
export const card = (t, x, y, w, h, { r = 10, off = 4, grain, fill = t.surface, stroke = t.line } = {}) =>
  `<rect x="${x + off}" y="${y + off}" width="${w}" height="${h}" rx="${r}" fill="${t.shadow}"/>` +
  `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill}" stroke="${stroke}"/>` +
  (grain ? `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="${r}" fill="url(#${grain})"/>` : "");

// Chip: small mono label in a bordered box. Returns { svg, w }.
export function chip(t, text, x, y, { size = 12, color = t.textMuted, border = t.lineStrong, fill = t.surface2, padX = 8, h = 24 } = {}) {
  const w = textWidth(text, size, "mono") + padX * 2 + text.length * size * 0.04;
  return {
    w,
    svg:
      `<rect x="${r1(x) + 0.5}" y="${y + 0.5}" width="${r1(w)}" height="${h}" rx="4" fill="${fill}" stroke="${border}"/>` +
      `<text x="${r1(x + padX)}" y="${r1(y + h / 2 + size * 0.36)}" font-family="${MONO}" font-size="${size}" letter-spacing="${size * 0.04}" fill="${color}">${esc(text)}</text>`,
  };
}

// Lay chips out left-to-right, wrapping at maxWidth. Returns { svg, height }.
export function chipRow(t, items, x, y, maxWidth, opts = {}) {
  const gap = opts.gap ?? 6;
  const h = opts.h ?? 24;
  let cx = x;
  let cy = y;
  let svg = "";
  for (const item of items) {
    const probe = chip(t, item.text ?? item, 0, 0, { ...opts, ...item });
    if (cx > x && cx + probe.w > x + maxWidth) {
      cx = x;
      cy += h + gap;
    }
    const c = chip(t, item.text ?? item, cx, cy, { ...opts, ...item });
    svg += c.svg;
    cx += c.w + gap;
  }
  return { svg, height: cy - y + h };
}

export function svgDoc({ w, h, title, css = "", defs = "", body, fonts = true }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(title)}">` +
    `<title>${esc(title)}</title>` +
    `<style>${fonts ? fontFaces(usedWeights(body + css)) : ""}${css}` +
    `@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>` +
    (defs ? `<defs>${defs}</defs>` : "") +
    body +
    `</svg>`
  );
}

export function write(rel, content) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  return { rel, bytes: Buffer.byteLength(content) };
}

// Same PRNG as the portfolio (scripts/three/util.ts), so seeded art matches it exactly.
export function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
