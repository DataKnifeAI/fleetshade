import type { AgentStatus, Priority } from "../types";

export function formatUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "Z");
}

export function barTone(pct: number): "ok" | "warn" | "bad" {
  if (pct >= 85) return "bad";
  if (pct >= 70) return "warn";
  return "ok";
}

export function nodePillClass(status: string): "ok" | "warn" | "bad" | "idle" {
  const s = status.toLowerCase();
  if (s === "ready") return "ok";
  if (s.includes("pressure") || s.includes("disk") || s.includes("pid")) return "warn";
  if (s === "notready" || s.includes("notready")) return "bad";
  return "idle";
}

export function agentPillClass(status: AgentStatus): "ok" | "warn" | "bad" | "idle" {
  switch (status) {
    case "active":
    case "running":
    case "healthy":
      return "ok";
    case "degraded":
      return "warn";
    case "down":
      return "bad";
    case "idle":
    case "standby":
    case "unknown":
    default:
      return "idle";
  }
}

export function priorityClass(p: Priority): string {
  return p.toLowerCase();
}
