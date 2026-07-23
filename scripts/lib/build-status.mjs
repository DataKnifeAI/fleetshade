/**
 * Shared status builder for publish-status CLI and the read-only API.
 * Uses Node fetch only (no curl/gh required in the API image).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const root = resolve(__dirname, "../..");

const PRIORITY_RE = /\bP([0-3])\b/i;
const LABEL_PRIORITY_RE = /^(priority[:\s-]*)?p([0-3])$/i;

function parsePriority(labels = []) {
  for (const label of labels) {
    const m = String(label).trim().match(LABEL_PRIORITY_RE);
    if (m) return `P${m[2]}`;
    const loose = String(label).trim().match(PRIORITY_RE);
    if (loose) return `P${loose[1]}`;
  }
  return "P3";
}

function priorityRank(p) {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[p] ?? 99;
}

function sortTop(issues, n) {
  return [...issues]
    .sort((a, b) => {
      const pr = priorityRank(a.priority) - priorityRank(b.priority);
      if (pr !== 0) return pr;
      return b.number - a.number;
    })
    .slice(0, n);
}

export function readJson(path, fallback) {
  if (!path || !existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

async function httpJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "dioptra-status-builder",
      ...headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }
  return res.json();
}

async function ghApi(path, qs = "") {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return httpJson(`https://api.github.com${path}${qs}`, headers);
}

function mapGithubIssue(i, fallbackRepo) {
  const labels = (i.labels || []).map((l) => (typeof l === "string" ? l : l.name));
  const repo =
    i.repository?.name ||
    (i.repository_url || "").split("/").slice(-1)[0] ||
    fallbackRepo ||
    "unknown";
  return {
    id: `gh-${i.number}-${repo}`,
    number: i.number,
    title: i.title,
    repo,
    priority: parsePriority(labels),
    labels,
    url: i.html_url,
    updatedAt: i.updated_at,
  };
}

async function fetchGithubIssues(topN) {
  const org = process.env.DIOPTRA_GITHUB_ORG || "DataKnifeAI";
  const repos = (process.env.DIOPTRA_GITHUB_REPOS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  /** @type {any[]} */
  let items = [];
  let totalOpen = 0;

  if (repos.length === 0) {
    const q = encodeURIComponent(`org:${org} is:issue is:open`);
    const data = await ghApi("/search/issues", `?q=${q}&per_page=100&sort=updated`);
    items = data.items || [];
    totalOpen = Number(data.total_count ?? items.length);
  } else {
    for (const repo of repos) {
      const full = repo.includes("/") ? repo : `${org}/${repo}`;
      const [owner, name] = full.split("/");
      const page = await ghApi(
        `/repos/${owner}/${name}/issues`,
        "?state=open&per_page=100",
      );
      const open = page.filter((i) => !i.pull_request);
      items.push(
        ...open.map((i) => ({
          ...i,
          repository_url: `https://api.github.com/repos/${full}`,
        })),
      );
      // Link header may have more pages; for totals use search per repo when needed
      const countData = await ghApi(
        "/search/issues",
        `?q=${encodeURIComponent(`repo:${full} is:issue is:open`)}&per_page=1`,
      );
      totalOpen += Number(countData.total_count ?? open.length);
    }
  }

  const mapped = items.filter((i) => !i.pull_request).map((i) => mapGithubIssue(i));

  return {
    platform: "github",
    totalOpen: totalOpen || mapped.length,
    top: sortTop(mapped, topN),
  };
}

async function fetchGitlabIssues(topN) {
  const token = process.env.GITLAB_TOKEN;
  const group = process.env.DIOPTRA_GITLAB_GROUP;
  const gitlabUrl = (process.env.GITLAB_URL || "https://gitlab.com").replace(/\/$/, "");
  if (!token || !group) return null;

  const base = `${gitlabUrl}/api/v4/groups/${encodeURIComponent(group)}/issues?state=opened&per_page=100&order_by=updated_at`;
  const res = await fetch(base, {
    headers: {
      "PRIVATE-TOKEN": token,
      Accept: "application/json",
      "User-Agent": "dioptra-status-builder",
    },
  });
  if (!res.ok) throw new Error(`gitlab HTTP ${res.status}`);
  const items = await res.json();
  const totalHeader = res.headers.get("x-total");
  const totalOpen = totalHeader ? Number(totalHeader) : items.length;

  const mapped = items.map((i) => {
    const labels = i.labels || [];
    return {
      id: `gl-${i.iid}-${i.project_id}`,
      number: i.iid,
      title: i.title,
      repo: i.references?.full?.split("#")[0] || String(i.project_id),
      priority: parsePriority(labels),
      labels,
      url: i.web_url,
      updatedAt: i.updated_at,
    };
  });
  return {
    platform: "gitlab",
    totalOpen,
    top: sortTop(mapped, topN),
  };
}

function onlineCount(agents, kind) {
  return agents.filter(
    (a) =>
      a.kind === kind &&
      !["idle", "standby", "down", "unknown"].includes(String(a.status).toLowerCase()),
  ).length;
}

function inProgressCount(agents) {
  return agents.filter((a) => a.task && String(a.task).trim() && a.task !== "—").length;
}

/**
 * Build a FleetStatus snapshot. Uses env for tokens/org; seeds nodes/agents from
 * existing snapshot files when live collectors for those are not configured.
 */
export async function buildStatus(options = {}) {
  const topN = Number(options.topN || process.env.DIOPTRA_TOP_N || 10);
  const seedPath = resolve(root, options.seedPath || "public/status.json");
  const existing = readJson(seedPath, {});

  const nodes =
    readJson(process.env.DIOPTRA_NODES_JSON, null) || existing.nodes || [];
  const agents =
    readJson(process.env.DIOPTRA_AGENTS_JSON, null) || existing.agents || [];

  const github = await fetchGithubIssues(topN);
  const gitlab =
    (await fetchGitlabIssues(topN)) ||
    existing.backlog?.gitlab || {
      platform: "gitlab",
      totalOpen: 0,
      top: [],
    };

  const nodesReady = nodes.filter((n) => String(n.status).toLowerCase() === "ready").length;
  const agentsCursor = onlineCount(agents, "cursor");
  const agentsHermes = onlineCount(agents, "hermes");

  return {
    generatedAt: new Date().toISOString(),
    refreshSeconds: Number(process.env.DIOPTRA_REFRESH_SECONDS || 30),
    summary: {
      nodesReady,
      nodesTotal: nodes.length,
      agentsOnline: agentsCursor + agentsHermes,
      agentsCursor,
      agentsHermes,
      issuesOpen: github.totalOpen + gitlab.totalOpen,
      issuesGithub: github.totalOpen,
      issuesGitlab: gitlab.totalOpen,
      inProgress: inProgressCount(agents),
    },
    nodes,
    agents,
    backlog: { github, gitlab },
  };
}
