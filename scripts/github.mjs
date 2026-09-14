// Fetches the numbers behind the activity card straight from the GitHub GraphQL API.
// In Actions the workflow's GITHUB_TOKEN is enough; locally it falls back to `gh auth token`.
import { execSync } from "node:child_process";

const token = () => {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { encoding: "utf8" }).trim();
  } catch {
    throw new Error("Set GITHUB_TOKEN (or sign in with the gh CLI) to fetch stats.");
  }
};

async function gql(query, variables) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token()}`, "Content-Type": "application/json", "User-Agent": "profile-stats" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub API: ${JSON.stringify(json.errors ?? json)}`);
  return json.data;
}

const CALENDAR = `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){createdAt
  contributionsCollection(from:$from,to:$to){contributionCalendar{totalContributions weeks{contributionDays{date contributionCount weekday}}}}}}`;

const REPOS = `query($login:String!,$cursor:String){user(login:$login){repositories(first:100,after:$cursor,ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC){
  totalCount pageInfo{hasNextPage endCursor} nodes{name stargazerCount languages(first:12,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}}}}}`;

export async function fetchStats(login) {
  const now = new Date();
  const first = await gql(CALENDAR, { login, from: new Date(now - 365 * 864e5).toISOString(), to: now.toISOString() });
  const createdAt = new Date(first.user.createdAt);
  const lastYear = first.user.contributionsCollection.contributionCalendar;

  // All-time days, one year window at a time (the API caps a window at a year).
  const days = new Map();
  for (let to = now; to > createdAt; ) {
    const from = new Date(Math.max(createdAt, to - 365 * 864e5));
    const data = to === now ? first : await gql(CALENDAR, { login, from: from.toISOString(), to: to.toISOString() });
    for (const w of data.user.contributionsCollection.contributionCalendar.weeks)
      for (const d of w.contributionDays) days.set(d.date, d.contributionCount);
    to = new Date(from - 1000);
  }

  let repos = [];
  let cursor = null;
  let totalRepos = 0;
  do {
    const data = await gql(REPOS, { login, cursor });
    const page = data.user.repositories;
    totalRepos = page.totalCount;
    repos = repos.concat(page.nodes);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);

  return { createdAt, lastYear, days, repos, totalRepos, now };
}

// Streaks: today with no contributions yet doesn't break a streak (the day isn't over).
export function streaks(days, today) {
  const dates = [...days.keys()].sort();
  let longest = { length: 0, start: null, end: null };
  let run = { length: 0, start: null, end: null };
  for (const d of dates) {
    if (days.get(d) > 0) {
      run = run.length ? { ...run, length: run.length + 1, end: d } : { length: 1, start: d, end: d };
      if (run.length > longest.length) longest = { ...run };
    } else run = { length: 0, start: null, end: null };
  }
  const key = (dt) => dt.toISOString().slice(0, 10);
  let cursor = new Date(`${key(today)}T00:00:00Z`);
  if (!(days.get(key(cursor)) > 0)) cursor = new Date(cursor - 864e5);
  let current = { length: 0, start: null, end: key(cursor) };
  while (days.get(key(cursor)) > 0) {
    current = { ...current, length: current.length + 1, start: key(cursor) };
    cursor = new Date(cursor - 864e5);
  }
  const total = [...days.values()].reduce((a, b) => a + b, 0);
  return { total, first: dates[0], longest, current };
}

export function languages(repos, exclude = []) {
  const sizes = new Map();
  for (const r of repos)
    for (const e of r.languages.edges) {
      if (exclude.includes(e.node.name)) continue;
      sizes.set(e.node.name, (sizes.get(e.node.name) ?? 0) + e.size);
    }
  const total = [...sizes.values()].reduce((a, b) => a + b, 0);
  return [...sizes.entries()].sort((a, b) => b[1] - a[1]).map(([name, size]) => ({ name, size, share: size / total }));
}
