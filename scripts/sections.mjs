// README sections, each drawn as an SVG that mirrors a portfolio component.
// Full-width art uses a 1000-unit viewBox; 2-up cards 500 and 3-up cards 333, so text renders at the
// same size everywhere once GitHub scales them into its ~830px README column.
import { MONO, SANS, card, chipRow, esc, grainDefs, icon, r1, svgDoc, textWidth, wrap } from "./lib.mjs";
import { COVER_H, COVER_W, coverCss, coverMarkup } from "./covers.mjs";
import { awards, certifications, education, experience, journey, profile, projects, publications, toolbox } from "./data.mjs";

export const FULL = 1000;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, pct) => {
  const [x, y] = [hex(a), hex(b)];
  return `#${x.map((v, i) => Math.round(v * pct + y[i] * (1 - pct)).toString(16).padStart(2, "0")).join("")}`;
};

const eyebrow = (t, text, x, y, { color = t.textMuted, size = 13, anchor = "start" } = {}) =>
  `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}" letter-spacing="${r1(size * 0.14)}" fill="${color}">${esc(text.toUpperCase())}</text>`;

const sans = (text, x, y, size, fill, weight = 400, extra = "") =>
  `<text x="${r1(x)}" y="${r1(y)}" font-family="${SANS}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra}>${esc(text)}</text>`;

const lines = (arr, x, y, lh, size, fill, weight = 400) => arr.map((l, i) => sans(l, x, y + i * lh, size, fill, weight)).join("");

/* ---------- Section heading ---------- */
export function sectionHead(t, { eyebrow: eb, title }) {
  const size = 34;
  const tl = wrap(title, 820, size, "sans", 600);
  const h = 44 + tl.length * 42 + 8;
  const body = eyebrow(t, eb, 0, 22) + tl.map((l, i) => sans(l, 0, 68 + i * 42, size, t.text, 700, 'letter-spacing="-0.3"')).join("");
  return svgDoc({ w: FULL, h, title: `${eb}: ${title}`, body, fonts: true });
}

/* ---------- Buttons (theme-free: navy works on light and dark GitHub) ---------- */
export function button({ label, iconName, primary = false }) {
  const size = 16;
  const pad = 20;
  const iconW = 20;
  const textW = textWidth(label, size, "mono");
  const w = Math.ceil(pad + iconW + 12 + textW + 14 + 16 + pad);
  const h = 52;
  const bg = primary ? "#2342b8" : "#0f1d57";
  const border = primary ? "#1a3190" : "#07103a";
  const shadow = primary ? "#0f1d57" : "#0a1440";
  const body =
    `<rect x="4" y="4" width="${w - 5}" height="${h - 5}" rx="6" fill="${shadow}"/>` +
    `<rect x=".5" y=".5" width="${w - 5}" height="${h - 5}" rx="6" fill="${bg}" stroke="${border}"/>` +
    icon(iconName, pad, (h - 4) / 2 - 10, 20, "#f4f6fb") +
    `<text x="${pad + iconW + 12}" y="${(h - 4) / 2 + 5.5}" font-family="${MONO}" font-size="${size}" fill="#f4f6fb">${esc(label)}</text>` +
    icon("arrow-up-right", w - pad - 16 - 4, (h - 4) / 2 - 8, 16, "#c3cdf2");
  return svgDoc({ w, h, title: label, body });
}

/* ---------- Currently ---------- */
export function currently(t) {
  const size = 29;
  const lh = 46;
  const maxW = 930;
  const tagFont = 22;
  // Tokens: plain words, or inline tags with a small mono mark like the portfolio's .tag.
  const tag = (mark, label, tone) => ({ tag: true, mark, label, tone });
  const words = (s) => s.split(" ").map((w) => ({ word: w }));
  const tokens = [
    ...words("I'm finishing my B.Tech at"),
    tag("G", "GIET", "plain"),
    ...words("and building"),
    tag("Q", "Q-CONSENSUS", "navy"),
    ...words(", where five AI agents debate, a"),
    tag("⟩", "QAOA", "amber"),
    ...words("optimizer picks the consensus, and every step is anchored on a blockchain. This summer I was a generative AI intern at"),
    tag("M", "CTTC, Ministry of MSME", "plain"),
    { word: "." },
  ];
  // Words are set as whole runs (natural spacing); only tag positions depend on measured widths,
  // which err wide, so a tag can gain a hair of space but never overlap the text before it.
  const measure = (s) => textWidth(s, size, "sans", 600) * 0.975;
  const space = measure(" ");
  const tagW = (tk) => 8 + 28 + 9 + textWidth(tk.label, tagFont, "sans", 600) + 10;
  const top = 62;
  let out = "";
  let line = 0;
  let x = 0; // cursor: end of the last word or tag on this line
  let run = { x: 0, text: "" };
  const flush = () => {
    if (run.text) out += sans(run.text, run.x, top + line * lh, size, t.text, 650, 'letter-spacing="-0.2"');
    run = { x: 0, text: "" };
  };
  const isGlued = (tk) => !!tk?.word && /^[,.]/.test(tk.word);
  tokens.forEach((tk, i) => {
    if (tk.tag) {
      const tail = isGlued(tokens[i + 1]) ? measure(tokens[i + 1].word) : 0;
      const w = tagW(tk);
      let lead = x === 0 ? 0 : space;
      if (x > 0 && x + lead + w + tail > maxW) {
        flush();
        line++;
        x = 0;
        lead = 0;
      }
      flush();
      const bx = x + lead;
      const base = top + line * lh;
      const by = base - 27;
      const markFill = tk.tone === "navy" ? t.navy : tk.tone === "amber" ? t.amber : t.surface2;
      const markInk = tk.tone === "navy" ? "#f4f6fb" : tk.tone === "amber" ? "#1b2130" : t.text;
      out +=
        `<rect x="${r1(bx + 2)}" y="${by + 2}" width="${r1(w - 4)}" height="36" rx="6" fill="${t.shadow}"/>` +
        `<rect x="${r1(bx) + 0.5}" y="${by + 0.5}" width="${r1(w - 4)}" height="35" rx="6" fill="${t.surface}" stroke="${t.lineStrong}"/>` +
        `<rect x="${r1(bx + 5)}" y="${by + 5}" width="26" height="26" rx="4" fill="${markFill}"/>` +
        `<text x="${r1(bx + 18)}" y="${by + 23}" text-anchor="middle" font-family="${MONO}" font-size="15" font-weight="700" fill="${markInk}">${esc(tk.mark)}</text>` +
        sans(tk.label, bx + 40, base - 2, tagFont, t.text, 600);
      x = bx + w;
      return;
    }
    const glued = isGlued(tk);
    const w = measure(tk.word);
    if (!run.text) {
      let start = x === 0 ? 0 : x + (glued ? 1 : space);
      if (x > 0 && start + w > maxW) {
        line++;
        start = 0;
      }
      run = { x: start, text: tk.word };
      x = start + w;
      return;
    }
    const next = x + (glued ? 0 : space) + w;
    if (next > maxW) {
      flush();
      line++;
      run = { x: 0, text: tk.word };
      x = w;
    } else {
      run.text += glued ? tk.word : ` ${tk.word}`;
      x = next;
    }
  });
  flush();
  const statementBottom = top + line * lh + 24;

  const facts = [
    { icon: "cap", label: "Education", value: `B.Tech CSE · ${education.cgpa} CGPA` },
    { icon: "spark", label: "Focus", value: "ML · LLM agents · Explainability" },
    { icon: "layers", label: "Exploring", value: "Quantum ML · QAOA" },
    { icon: "map-pin", label: "Based in", value: profile.location },
  ];
  const fy = statementBottom + 30;
  const fh = 112;
  const cw = FULL / 4;
  let strip =
    `<clipPath id="facts"><rect x="0" y="${fy}" width="${FULL}" height="${fh}" rx="10"/></clipPath>` +
    `<g clip-path="url(#facts)"><rect x="0" y="${fy}" width="${FULL}" height="${fh}" fill="${t.line}"/>`;
  facts.forEach((f, i) => {
    const cx = i * cw + (i ? 0.5 : 0);
    strip +=
      `<rect x="${cx + (i ? 0.5 : 1)}" y="${fy + 1}" width="${cw - (i ? 1 : 1.5)}" height="${fh - 2}" fill="${t.bg}"/>` +
      `<rect x="${cx + (i ? 0.5 : 1)}" y="${fy + 1}" width="${cw - (i ? 1 : 1.5)}" height="${fh - 2}" fill="url(#grain)"/>` +
      icon(f.icon, cx + 22, fy + 20, 18, t.textMuted) +
      eyebrow(t, f.label, cx + 22, fy + 62, { size: 11 }) +
      sans(f.value, cx + 22, fy + 88, 15.5, t.text, 600);
  });
  strip += `</g><rect x=".5" y="${fy + 0.5}" width="${FULL - 1}" height="${fh - 1}" rx="10" fill="none" stroke="${t.line}"/>`;

  const h = fy + fh + 4;
  return svgDoc({
    w: FULL,
    h,
    title: "Currently: finishing a B.Tech at GIET and building Q-CONSENSUS; generative AI intern at CTTC, Ministry of MSME this summer",
    defs: grainDefs("grain", t),
    body: eyebrow(t, "Currently", 0, 18) + out + strip,
  });
}

/* ---------- Work cards ---------- */
const CARD = { large: { w: 500, pad: 22, title: 23, hook: 16, ctx: 13.5 }, medium: { w: 333, pad: 17, title: 19, hook: 15, ctx: 13 } };

function cardBody(t, p, spec, innerW) {
  const x = spec.pad;
  const maxW = innerW - spec.pad * 2;
  let y = 0;
  let svg = "";
  const chips = [p.year, ...p.categories].map((text) => ({ text }));
  if (p.status) chips.push({ text: p.status, color: t.green, border: mix(t.green, t.surface, 0.55) });
  const row = chipRow(t, chips, x, y, maxW, { size: 11, h: 22, padX: 7 });
  svg += row.svg;
  y += row.height + 12;
  if (p.award) {
    const fs = spec.w > 400 ? 12 : 11;
    // Narrow cards split the badge at its "·" instead of running past the edge.
    const full = 32 + textWidth(p.award, fs, "mono") + 12;
    const al = full <= maxW ? [p.award] : p.award.split(" · ").map((s, k) => (k === 0 ? `${s} ·` : s));
    const aw = Math.min(maxW, 32 + Math.max(...al.map((l) => textWidth(l, fs, "mono"))) + 12);
    const ah = 27 + (al.length - 1) * 17;
    svg +=
      `<rect x="${x + 0.5}" y="${y + 0.5}" width="${r1(aw)}" height="${ah}" rx="4" fill="${mix(t.amber, t.surface, 0.16)}" stroke="${mix(t.amber, t.line, 0.5)}"/>` +
      icon("award", x + 9, y + 5.5, 16, t.amber) +
      al.map((l, k) => `<text x="${x + 32}" y="${y + 18 + k * 17}" font-family="${MONO}" font-size="${fs}" fill="${t.text}">${esc(l)}</text>`).join("");
    y += ah + 14;
  }
  const tl = wrap(p.title.toUpperCase(), maxW, spec.title, "mono");
  y += spec.title * 0.8;
  svg += tl.map((l, i) => `<text x="${x}" y="${r1(y + i * spec.title * 1.15)}" font-family="${MONO}" font-weight="700" font-size="${spec.title}" fill="${t.text}">${esc(l)}</text>`).join("");
  y += (tl.length - 1) * spec.title * 1.15 + 14;
  const hl = wrap(p.hook, maxW, spec.hook);
  const hlh = spec.hook * 1.5;
  y += spec.hook * 0.9;
  svg += lines(hl, x, y, hlh, spec.hook, t.text);
  y += (hl.length - 1) * hlh + 12;
  const cl = wrap(p.context, maxW, spec.ctx);
  y += spec.ctx * 0.95;
  svg += lines(cl, x, y, spec.ctx * 1.45, spec.ctx, t.textFaint);
  y += (cl.length - 1) * spec.ctx * 1.45 + 22;
  const linkY = y;
  return { svg, height: y + 6 + spec.pad, linkY };
}

export function workCard(t, p, rowBodyH) {
  const spec = CARD[p.size];
  const W = spec.w;
  const innerW = W - 6;
  const coverH = (innerW * COVER_H) / COVER_W;
  const measured = cardBody(t, p, spec, innerW);
  const bodyH = rowBodyH ?? measured.height;
  const H = coverH + spec.pad + bodyH + 6;
  const bodyTop = coverH + spec.pad;
  const linkY = bodyTop + bodyH - spec.pad - 6;
  const body =
    card(t, 0, 0, innerW, H - 6, { r: 10, off: 4 }) +
    `<clipPath id="cov"><path d="M1 11A10 10 0 0 1 11 1H${innerW - 11}A10 10 0 0 1 ${innerW - 1} 11V${r1(coverH)}H1Z"/></clipPath>` +
    `<g clip-path="url(#cov)"><svg x="0" y="0" width="${innerW}" height="${r1(coverH)}" viewBox="0 0 ${COVER_W} ${COVER_H}">${coverMarkup(p.visual)}</svg></g>` +
    `<line x1="1" x2="${innerW - 1}" y1="${r1(coverH) + 0.5}" y2="${r1(coverH) + 0.5}" stroke="${t.line}"/>` +
    `<rect x="1" y="${r1(coverH) + 1}" width="${innerW - 2}" height="${r1(H - 8 - coverH)}" fill="url(#grain)" rx="0"/>` +
    `<g transform="translate(0 ${r1(bodyTop)})">${measured.svg}</g>` +
    `<text x="${spec.pad}" y="${r1(linkY)}" font-family="${MONO}" font-size="12.5" letter-spacing=".75" fill="${t.accent}">READ CASE STUDY</text>` +
    icon("arrow-up-right", spec.pad + textWidth("READ CASE STUDY", 12.5, "mono") + 16, linkY - 11.5, 14, t.accent);
  return {
    bodyH: measured.height,
    svg: svgDoc({
      w: W,
      h: Math.ceil(H),
      title: `${p.title}: ${p.hook}`,
      css: coverCss(t),
      defs: grainDefs("grain", t),
      body,
    }),
  };
}

/* ---------- Tiles under the grid ---------- */
export function tile(t, { iconName, title, sub }) {
  const W = 333;
  const H = 132;
  const body =
    card(t, 0, 0, W - 6, H - 6, { grain: "grain" }) +
    icon(iconName, 22, 22, 26, t.text) +
    icon("arrow-up-right", W - 6 - 36, 22, 16, t.textFaint) +
    `<text x="22" y="82" font-family="${MONO}" font-weight="700" font-size="18" fill="${t.text}">${esc(title.toUpperCase())}</text>` +
    sans(sub, 22, 106, 14.5, t.textFaint);
  return svgDoc({ w: W, h: H, title: `${title}: ${sub}`, defs: grainDefs("grain", t), body });
}

/* ---------- Journey ---------- */
const kindLabel = { work: "Work", build: "Build", paper: "Paper", award: "Award", learn: "Learning" };
export function journeySvg(t) {
  const kindColor = { work: t.accent, build: t.frost, paper: t.green, award: t.amber, learn: t.textFaint };
  const railX = 222;
  const colX = 262;
  const colW = FULL - colX;
  let y = 8;
  let svg = "";
  journey.forEach((yr, yi) => {
    const groupTop = y;
    svg += `<text x="0" y="${y + 38}" font-family="${MONO}" font-weight="700" font-size="40" fill="${t.accent}">${yr.year}</text>`;
    svg += lines(wrap(yr.note, 180, 14.5), 0, y + 66, 21, 14.5, t.textMuted);
    yr.milestones.forEach((m, mi) => {
      const detail = wrap(m.detail, colW, 14.5);
      const title = wrap(m.title, colW, 17, "sans", 600);
      const top = y + 6;
      const kc = kindColor[m.kind];
      svg +=
        `<rect x="${railX - 6}" y="${top + 4}" width="12" height="12" fill="${kc}"/>` +
        `<text x="${colX}" y="${top + 14}" font-family="${MONO}" font-size="12" letter-spacing="1.2" fill="${t.textFaint}">${esc(m.date.toUpperCase())}<tspan dx="12" fill="${kc}">${esc(kindLabel[m.kind].toUpperCase())}</tspan></text>` +
        lines(title, colX, top + 40, 24, 17, t.text, 600) +
        lines(detail, colX, top + 40 + title.length * 24, 21, 14.5, t.textMuted);
      y = top + 40 + title.length * 24 + (detail.length - 1) * 21 + 20;
      const last = mi === yr.milestones.length - 1;
      if (!last) svg += `<line x1="${colX}" x2="${FULL}" y1="${y - 4.5}" y2="${y - 4.5}" stroke="${t.line}" stroke-dasharray="4 4"/>`;
    });
    y = Math.max(y, groupTop + 100) + 16;
    if (yi < journey.length - 1) svg += `<line x1="0" x2="${FULL}" y1="${y - 8.5}" y2="${y - 8.5}" stroke="${t.lineStrong}"/>`;
  });
  const rail = `<line x1="${railX}" x2="${railX}" y1="10" y2="${y - 20}" stroke="${t.lineStrong}" stroke-width="2"/>`;
  return svgDoc({ w: FULL, h: Math.ceil(y), title: "Journey so far: milestones from 2024 to 2027", body: rail + svg });
}

/* ---------- Paper trail: experience + education ---------- */
export function experienceSvg(t) {
  const gap = 22;
  const cw = (FULL - gap - 6) / 2;
  const pad = 22;
  const items = [
    ...experience.map((e) => ({ title: e.role, date: e.period, org: e.org, points: e.points })),
    { title: education.degree, date: education.period, org: `${education.school}, ${education.place} · CGPA ${education.cgpa}`, points: [] },
  ];
  const layout = items.map((it) => {
    const tw = cw - pad * 2 - textWidth(it.date, 12, "mono") - 16;
    const title = wrap(it.title, tw, 17, "sans", 600);
    const org = wrap(it.org, cw - pad * 2, 14.5);
    const pts = it.points.map((p) => wrap(p, cw - pad * 2 - 18, 14.5));
    const h = pad + 20 + (title.length - 1) * 24 + 8 + org.length * 21 + (pts.length ? 10 + pts.reduce((s, p) => s + p.length * 21 + 6, 0) : 0) + pad - 4;
    return { ...it, titleL: title, orgL: org, ptsL: pts, h };
  });
  let svg = eyebrow(t, "Experience", 0, 16) + `<line x1="0" x2="${FULL}" y1="32.5" y2="32.5" stroke="${t.line}"/>`;
  let y = 52;
  for (let i = 0; i < layout.length; i += 2) {
    const rowH = Math.max(layout[i].h, layout[i + 1]?.h ?? 0);
    [layout[i], layout[i + 1]].forEach((it, k) => {
      if (!it) return;
      const x = k * (cw + gap);
      let yy = y + pad + 17;
      svg += card(t, x, y, cw, rowH, { off: 4, grain: "grain" });
      svg += `<text x="${r1(x + cw - pad)}" y="${yy - 2}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${t.textFaint}">${esc(it.date)}</text>`;
      svg += lines(it.titleL, x + pad, yy, 24, 17, t.text, 600);
      yy += (it.titleL.length - 1) * 24 + 26;
      svg += lines(it.orgL, x + pad, yy, 21, 14.5, t.textMuted);
      yy += it.orgL.length * 21 + 10;
      it.ptsL.forEach((pl) => {
        svg += `<rect x="${x + pad + 2}" y="${yy - 8}" width="5" height="5" fill="${t.textFaint}"/>`;
        svg += lines(pl, x + pad + 18, yy, 21, 14.5, t.textMuted);
        yy += pl.length * 21 + 6;
      });
    });
    y += rowH + 22;
  }
  return svgDoc({ w: FULL, h: Math.ceil(y - 12), title: "Experience and education", defs: grainDefs("grain", t), body: svg });
}

/* ---------- Paper trail: publications + awards ---------- */
export function papersSvg(t) {
  const colW = 470;
  const rightX = FULL - colW;
  let svg = "";
  const colTitle = (text, x) => eyebrow(t, text, x, 16) + `<line x1="${x}" x2="${x + colW}" y1="32.5" y2="32.5" stroke="${t.line}"/>`;
  svg += colTitle("Publications", 0) + colTitle("Awards", rightX);
  let y = 40;
  publications.forEach((p) => {
    const tl = wrap(p.title, colW - 62, 16, "sans", 600);
    const vl = wrap(p.venue, colW - 62, 14);
    svg += `<text x="0" y="${y + 26}" font-family="${MONO}" font-size="14" fill="${t.accent}">${p.year}</text>`;
    svg += lines(tl, 62, y + 26, 23, 16, t.text, 600) + lines(vl, 62, y + 26 + tl.length * 23, 20, 14, t.textMuted);
    y += 26 + tl.length * 23 + (vl.length - 1) * 20 + 22;
    svg += `<line x1="0" x2="${colW}" y1="${y - 0.5}" y2="${y - 0.5}" stroke="${t.line}" stroke-dasharray="4 4"/>`;
  });
  let ay = 40;
  awards.forEach((a) => {
    svg += icon("award", rightX, ay + 12, 20, t.amber);
    svg += sans(a.title, rightX + 40, ay + 26, 16, t.text, 600) + sans(a.event, rightX + 40, ay + 49, 14, t.textMuted);
    ay += 72;
    svg += `<line x1="${rightX}" x2="${FULL}" y1="${ay - 0.5}" y2="${ay - 0.5}" stroke="${t.line}" stroke-dasharray="4 4"/>`;
  });
  return svgDoc({ w: FULL, h: Math.ceil(Math.max(y, ay) + 4), title: "Publications and awards", body: svg });
}

/* ---------- Certifications (one linked card each) ---------- */
export function certCard(t, c, h = 150) {
  const W = 250;
  const pad = 18;
  const nl = wrap(c.name, W - 6 - pad * 2, 15.5, "sans", 600);
  const il = wrap(c.issuer, W - 6 - pad * 2, 13.5);
  const need = pad + 20 + nl.length * 22 + il.length * 19 + 40;
  if (h === null) return need;
  const body =
    card(t, 0, 0, W - 6, h - 6, { off: 3, grain: "grain" }) +
    lines(nl, pad, pad + 20, 22, 15.5, t.text, 600) +
    lines(il, pad, pad + 20 + nl.length * 22 + 2, 19, 13.5, t.textMuted) +
    `<text x="${pad}" y="${h - 6 - pad}" font-family="${MONO}" font-size="11.5" letter-spacing=".7" fill="${t.accent}">VIEW PDF</text>` +
    icon("arrow-up-right", pad + textWidth("VIEW PDF", 11.5, "mono") + 10, h - 6 - pad - 11, 13, t.accent);
  return svgDoc({ w: W, h, title: `${c.name}, ${c.issuer}`, defs: grainDefs("grain", t), body });
}
export const certHeight = (t) => Math.ceil(Math.max(...certifications.map((c) => certCard(t, c, null))));

/* ---------- Toolbox ---------- */
export function toolboxSvg(t) {
  const cols = { idx: 0, story: 46, chips: 510, used: 820 };
  let svg = eyebrow(t, "How I work, and with what", 0, 16) + `<line x1="0" x2="${FULL}" y1="32.5" y2="32.5" stroke="${t.line}"/>`;
  let y = 33;
  toolbox.forEach((row, i) => {
    const story = wrap(row.story, cols.chips - cols.story - 36, 15);
    const chips = chipRow(t, row.tools, cols.chips, y + 22, cols.used - cols.chips - 28, { size: 12, h: 25 });
    const top = y + 22;
    svg += `<text x="0" y="${top + 16}" font-family="${MONO}" font-size="13" fill="${t.accent}">${String(i + 1).padStart(2, "0")}</text>`;
    svg += sans(row.job, cols.story, top + 16, 17, t.text, 600) + lines(story, cols.story, top + 42, 22, 15, t.textMuted);
    svg += chips.svg;
    svg += eyebrow(t, "Used in", cols.used, top + 12, { size: 10 });
    row.usedIn.forEach((u, k) => (svg += sans(u, cols.used, top + 34 + k * 21, 14.5, u.startsWith("Every") || u.includes("internship") ? t.textMuted : t.accent)));
    const h = Math.max(42 + story.length * 22 - 6, chips.height, 34 + row.usedIn.length * 21 - 6);
    y = top + h + 20;
    svg += `<line x1="0" x2="${FULL}" y1="${y - 0.5}" y2="${y - 0.5}" stroke="${t.line}" stroke-dasharray="4 4"/>`;
  });
  return svgDoc({ w: FULL, h: Math.ceil(y + 2), title: "How I work, and with what", body: svg });
}

/* ---------- Footer band (theme-free navy) ---------- */
export function footerSvg() {
  const H = 330;
  // Footer.astro's stepped top edge: the band alternates between 12px and 24px tall.
  const pts = [[0, 24], [0, 12]];
  const stops = [4, 9, 16, 22, 31, 35, 48, 55, 63, 67, 78, 86, 93];
  let high = false;
  stops.forEach((s) => {
    const x = (s / 100) * FULL;
    pts.push([x, high ? 0 : 12], [x, high ? 12 : 0]);
    high = !high;
  });
  pts.push([FULL, high ? 0 : 12], [FULL, 0]);
  const top = `M${pts.map(([x, y]) => `${r1(x)} ${y}`).join("L")}L${FULL} 24Z`;
  const body =
    `<defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M0 .5H64M.5 0V64" stroke="#fff" stroke-opacity="0.06"/></pattern>${grainDefs("grain", "on-navy")}</defs>` +
    `<path d="${top}" fill="#2342b8"/>` +
    `<rect y="23" width="${FULL}" height="${H - 23 - 44}" fill="#2342b8"/><rect y="23" width="${FULL}" height="${H - 23 - 44}" fill="url(#g)"/><rect y="23" width="${FULL}" height="${H - 23 - 44}" fill="url(#grain)"/>` +
    `<rect y="${H - 44}" width="${FULL}" height="44" fill="#1a3190"/><line x1="0" x2="${FULL}" y1="${H - 44.5}" y2="${H - 44.5}" stroke="#fff" stroke-opacity=".12"/>` +
    `<text x="48" y="92" font-family="${MONO}" font-size="13" letter-spacing="1.8" fill="#c3cdf2">CONTACT</text>` +
    `<text x="46" y="150" font-family="${MONO}" font-weight="700" font-size="42" fill="#f4f6fb">CURIOUS ABOUT INTELLIGENCE.</text>` +
    `<text x="46" y="198" font-family="${MONO}" font-weight="700" font-size="42" fill="#f4f6fb">SERIOUS ABOUT SHIPPING IT.</text>` +
    `<rect x="48" y="234" width="10" height="10" fill="#a3be8c"/><rect x="45" y="231" width="16" height="16" fill="none" stroke="#a3be8c" stroke-opacity=".3" stroke-width="3"/>` +
    `<text x="74" y="244" font-family="${MONO}" font-size="14" letter-spacing=".8" fill="#c3cdf2">${esc(profile.availability.toUpperCase())}</text>` +
    `<text x="${74 + textWidth(profile.availability, 14, "mono") + profile.availability.length * 0.8 + 18}" y="244" font-family="${MONO}" font-size="14" fill="#c3cdf2" fill-opacity=".5">/</text>` +
    icon("map-pin", 74 + textWidth(profile.availability, 14, "mono") + profile.availability.length * 0.8 + 44, 230, 16, "#c3cdf2") +
    `<text x="${74 + textWidth(profile.availability, 14, "mono") + profile.availability.length * 0.8 + 68}" y="244" font-family="${MONO}" font-size="14" letter-spacing=".8" fill="#c3cdf2">${esc(profile.location.toUpperCase())}</text>` +
    `<text x="48" y="${H - 17}" font-family="${MONO}" font-size="11.5" letter-spacing=".7" fill="#c3cdf2">GENERATED FROM THE SAME DATA AS MY PORTFOLIO · STATS REFRESH DAILY</text>` +
    `<text x="${FULL - 48}" y="${H - 17}" text-anchor="end" font-family="${MONO}" font-size="11.5" letter-spacing=".7" fill="#c3cdf2">© ${new Date().getFullYear()} ${esc(profile.name.toUpperCase())}</text>`;
  return svgDoc({ w: FULL, h: H, title: "Contact: curious about intelligence, serious about shipping it", body });
}
