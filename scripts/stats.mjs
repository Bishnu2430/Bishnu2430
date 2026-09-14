// Builds assets/stats-{light,dark}.svg from live GitHub data.  Run: node scripts/stats.mjs
// Replaces the third-party stat cards (their public instances went offline) with one card drawn in the
// portfolio's style. The profile workflow reruns this daily.
import { MONO, SANS, card, esc, grainDefs, icon, r1, svgDoc, textWidth, themes, write } from "./lib.mjs";
import { FULL, mix } from "./sections.mjs";
import { fetchStats, languages, streaks } from "./github.mjs";

const LOGIN = process.env.PROFILE_LOGIN ?? "Bishnu2430";
const EXCLUDE = ["Jupyter Notebook"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso, withYear = true) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}${withYear ? ` ${d.getUTCFullYear()}` : ""}`;
};
const range = (a, b) => {
  if (!a) return "No active streak";
  const sameYear = a.slice(0, 4) === b.slice(0, 4);
  return a === b ? fmtDate(a) : `${fmtDate(a, !sameYear)} – ${fmtDate(b)}`;
};

function render(t, s) {
  const st = streaks(s.days, s.now);
  const langs = languages(s.repos, EXCLUDE);
  let svg = "";

  // Row 1: four figures.
  const tiles = [
    { icon: "commit", label: "Contributions", value: st.total.toLocaleString("en-US"), sub: `Since ${fmtDate(st.first)}` },
    { icon: "flame", label: "Current streak", value: `${st.current.length} ${st.current.length === 1 ? "day" : "days"}`, sub: range(st.current.start, st.current.end), hot: st.current.length > 0 },
    { icon: "award", label: "Longest streak", value: `${st.longest.length} days`, sub: range(st.longest.start, st.longest.end) },
    { icon: "repo", label: "Public repos", value: String(s.totalRepos), sub: "Original work, forks excluded" },
  ];
  const gap = 18;
  const tw = (FULL - 6 - gap * 3) / 4;
  const th = 136;
  tiles.forEach((tl, i) => {
    const x = i * (tw + gap);
    svg +=
      card(t, x, 0, tw, th, { grain: "grain" }) +
      icon(tl.icon, x + 20, 20, 18, tl.hot ? t.amber : t.textMuted) +
      `<text x="${x + 46}" y="34" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${t.textMuted}">${esc(tl.label.toUpperCase())}</text>` +
      `<text x="${x + 20}" y="88" font-family="${MONO}" font-weight="700" font-size="34" fill="${t.text}">${esc(tl.value)}</text>` +
      `<text x="${x + 20}" y="116" font-family="${SANS}" font-size="13.5" fill="${t.textFaint}">${esc(tl.sub)}</text>`;
  });

  // Row 2: the contribution calendar as a pixel grid, the hero's blinking squares in miniature.
  const cy = th + 24;
  const weeks = s.lastYear.weeks;
  const cell = 14;
  const step = 17;
  const pad = 24;
  const calH = 72 + 7 * step + 18;
  const gx = pad + 34;
  const counts = weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)).filter((c) => c > 0).sort((a, b) => a - b);
  const q = (p) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))] ?? 1;
  const cuts = [q(0.25), q(0.5), q(0.8)];
  const ink = t.name === "dark" ? t.accent : t.navy;
  const levels = [t.surface2, mix(ink, t.surface2, 0.3), mix(ink, t.surface2, 0.55), mix(ink, t.surface2, 0.8), ink];
  const level = (c) => (c === 0 ? 0 : c <= cuts[0] ? 1 : c <= cuts[1] ? 2 : c <= cuts[2] ? 3 : 4);
  svg += card(t, 0, cy, FULL - 6, calH, { grain: "grain" });
  svg += `<text x="${pad}" y="${cy + 38}" font-family="${SANS}" font-size="17" font-weight="600" fill="${t.text}">${s.lastYear.totalContributions.toLocaleString("en-US")} contributions in the last year</text>`;
  const legendX = FULL - 6 - pad - (5 * 16 + 84);
  svg += `<text x="${legendX}" y="${cy + 37}" font-family="${MONO}" font-size="11" fill="${t.textFaint}">LESS</text>`;
  levels.forEach((c, i) => (svg += `<rect x="${legendX + 40 + i * 16}" y="${cy + 27}" width="12" height="12" fill="${c}" ${i === 0 ? `stroke="${t.line}"` : ""}/>`));
  svg += `<text x="${legendX + 40 + 5 * 16 + 4}" y="${cy + 37}" font-family="${MONO}" font-size="11" fill="${t.textFaint}">MORE</text>`;
  const top = cy + 72;
  let lastMonth = -1;
  const lastDay = weeks.at(-1).contributionDays.at(-1).date;
  weeks.forEach((w, wi) => {
    const x = gx + wi * step;
    const m = new Date(`${w.contributionDays[0].date}T00:00:00Z`).getUTCMonth();
    if (m !== lastMonth && wi < weeks.length - 2) {
      if (lastMonth !== -1 || w.contributionDays[0].weekday === 0)
        svg += `<text x="${x}" y="${top - 10}" font-family="${MONO}" font-size="11" fill="${t.textFaint}">${MONTHS[m].toUpperCase()}</text>`;
      lastMonth = m;
    }
    w.contributionDays.forEach((d) => {
      const lv = level(d.contributionCount);
      const today = d.date === lastDay;
      svg += `<rect x="${x}" y="${top + d.weekday * step}" width="${cell}" height="${cell}" fill="${levels[lv]}"${lv === 0 ? ` stroke="${t.line}" stroke-width=".8"` : ""}${today ? ' class="today"' : ""}/>`;
    });
  });
  ["MON", "WED", "FRI"].forEach((dname, i) => (svg += `<text x="${pad}" y="${top + (1 + i * 2) * step + 10}" font-family="${MONO}" font-size="10" fill="${t.textFaint}">${dname}</text>`));

  // Row 3: languages by code size.
  const ly = cy + calH + 24;
  const shown = langs.slice(0, 6);
  const other = langs.slice(6).reduce((a, l) => a + l.share, 0);
  const palette = [ink, t.frost, t.green, t.amber, t.red, t.name === "dark" ? "#b48ead" : "#8f6a8a", t.textFaint];
  const entries = [...shown, ...(other > 0.0005 ? [{ name: "Other", share: other }] : [])];
  const langH = 150;
  svg += card(t, 0, ly, FULL - 6, langH, { grain: "grain" });
  svg += `<text x="${pad}" y="${ly + 38}" font-family="${SANS}" font-size="17" font-weight="600" fill="${t.text}">Languages</text>`;
  const note = `By code size across ${s.repos.length} public repos · notebooks excluded`;
  svg += `<text x="${FULL - 6 - pad}" y="${ly + 37}" text-anchor="end" font-family="${SANS}" font-size="13" fill="${t.textFaint}">${esc(note)}</text>`;
  const barW = FULL - 6 - pad * 2;
  let bx = pad;
  entries.forEach((l, i) => {
    const w = Math.max(3, l.share * barW - 3);
    svg += `<rect x="${r1(bx)}" y="${ly + 56}" width="${r1(w)}" height="14" fill="${palette[i]}"/>`;
    bx += l.share * barW;
  });
  const colW = barW / 4;
  entries.forEach((l, i) => {
    const x = pad + (i % 4) * colW;
    const y = ly + 100 + Math.floor(i / 4) * 28;
    const pct = `${(l.share * 100).toFixed(1)}%`;
    svg +=
      `<rect x="${x}" y="${y - 10}" width="11" height="11" fill="${palette[i]}"/>` +
      `<text x="${x + 20}" y="${y}" font-family="${SANS}" font-size="14.5" fill="${t.text}">${esc(l.name)}</text>` +
      `<text x="${r1(x + 20 + textWidth(l.name, 14.5) + 8)}" y="${y}" font-family="${MONO}" font-size="12" fill="${t.textFaint}">${pct}</text>`;
  });

  const updated = fmtDate(s.now.toISOString().slice(0, 10));
  const h = ly + langH + 34;
  svg += `<text x="0" y="${h - 6}" font-family="${MONO}" font-size="11" letter-spacing=".6" fill="${t.textFaint}">UPDATED ${esc(updated.toUpperCase())} · GENERATED BY SCRIPTS/STATS.MJS FROM THE GITHUB API</text>`;

  return svgDoc({
    w: FULL,
    h,
    title: `GitHub activity: ${st.total} contributions since ${fmtDate(st.first)}, current streak ${st.current.length} days, longest ${st.longest.length} days, ${s.totalRepos} public repos`,
    css: `.today{animation:blink 2.4s steps(1) infinite}@keyframes blink{50%{opacity:.35}}`,
    defs: grainDefs("grain", t),
    body: svg,
  });
}

const s = await fetchStats(LOGIN);
for (const t of Object.values(themes)) console.log(write(`assets/stats-${t.name}.svg`, render(t, s)));
