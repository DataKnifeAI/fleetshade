import type { BacklogIssue, Priority } from "../types";
import { PRIORITY_ORDER } from "../types";

const PRIORITY_RE = /\bP([0-3])\b/i;
const LABEL_PRIORITY_RE = /^(priority[:\s-]*)?p([0-3])$/i;

export function parsePriorityFromLabels(labels: string[] = []): Priority | null {
  for (const label of labels) {
    const m = label.trim().match(LABEL_PRIORITY_RE);
    if (m) return `P${m[2]}` as Priority;
    const loose = label.trim().match(PRIORITY_RE);
    if (loose) return `P${loose[1]}` as Priority;
  }
  return null;
}

export function priorityRank(p: Priority): number {
  return PRIORITY_ORDER[p] ?? 99;
}

/** Sort by priority ascending (P0 first), then issue number descending. */
export function sortBacklog(issues: BacklogIssue[]): BacklogIssue[] {
  return [...issues].sort((a, b) => {
    const pr = priorityRank(a.priority) - priorityRank(b.priority);
    if (pr !== 0) return pr;
    return b.number - a.number;
  });
}

export function topByPriority(issues: BacklogIssue[], limit = 10): BacklogIssue[] {
  return sortBacklog(issues).slice(0, limit);
}
