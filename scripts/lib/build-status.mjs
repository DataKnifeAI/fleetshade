/**
 * Shared status builder for publish-status CLI and the read-only API.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
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

function ghApi(path, qs = "") {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const url = `https://api.github.com${path}${qs}`;
  if (token) {
    const res = spawnSync(
      "curl",
      [
        "-fsSL",
        "-H",
        `Authorization: Bearer ${token}`,
        "-H",
        "Accept: application/vnd.github+json",
        url,
      ],
      { encoding: "utf8" },
    );
    if (res.status !== 0) throw new Error(res.stderr || `curl failed ${url}`);
    return JSON.parse(res.stdout);
  }
  const res = spawnSync("gh", ["api", `${path}${qs}`], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(res.stderr || `gh api failed ${path}`);
  return JSON.parse(res.stdout);
}

async function fetchGithubIssues(topN) {
  const org = process.env.DIOPTRA_GITHUB_ORG || "DataKnifeAI";
  const repos = (process.env.DIOPTRA_GITHUB_REPOS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  /** @type {any[]} */
  let items = [];
  if (repos.length === 0) {
    const q = encodeURIComponent(`org:${org} is:issue is:open`);
    const data = ghApi("/search/issues", `?q=${q}&per_page=100&sort=updated`);
    items = data.items || [];
  } else {
    for (const repo of repos) {
      const full = repo.includes("/") ? repo : `${org}/${repo}`;
      const [owner, name] = full.split("/");
      const page = ghApi(`/repos/${owner}/${name}/issues`, "?state=open&per_page=100");
      items.push(
        ...page
          .filter((i) => !i.pull_request)
          .map((i) => ({
            ...i,
            repository_url: `https://api.github.com/repos/${full}`,
          })),
      );
    }
  }

  const mapped = items
    .filter((i) => !i.pull_request)
    .map((i) => {
      const labels = (i.labels || []).map((l) => (typeof l === "string" ? l : l.name));
      const repo =
        i.repository?.name ||
        (i.repository_url || "").split("/").slice(-1)[0] ||
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
    });

  return {
    platform: "github",
    totalOpen: mapped.length,
    top: sortTop(mapped, topN),
  };
}

async function fetchGitlabIssues(topN) {
  const token = process.env.GITLAB_TOKEN;
  const group = process.env.DIOPTRA_GITLAB_GROUP;
  const gitlabUrl = (process.env.GITLAB_URL || "https://gitlab.com").replace(/\/$/, "");
  if (!token || !group) return null;

  const url = `${gitlabUrl}/api/v4/groups/${encodeURIComponent(group)}/issues?state=opened&per_page=100&order_by=updated_at`;
  const res = spawnSync("curl", ["-fsSL", "-H", `PRIVATE-TOKEN: ${token}`, url], {
    encoding: "utf8",
  });
  if (res.status !== 0) throw new Error(res.stderr || "gitlab fetch failed");
  const items = JSON.parse(res.stdout);
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
    totalOpen: mapped.length,
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
  const agentsCursor = agents.filter((a) => a.kind === "cursor").length;
  const agentsHermes = agents.filter((a) => a.kind === "hermes").length;

  return {
    generatedAt: new Date().toISOString(),
    refreshSeconds: Number(process.env.DIOPTRA_REFRESH_SECONDS || 30),
    summary: {
      nodesReady,
      nodesTotal: nodes.length,
      agentsOnline: onlineCount(agents, "cursor") + onlineCount(agents, "hermes"),
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
