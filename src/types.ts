export type Priority = "P0" | "P1" | "P2" | "P3";

export type AgentKind = "cursor" | "hermes";

export type AgentStatus =
  | "active"
  | "running"
  | "healthy"
  | "idle"
  | "standby"
  | "degraded"
  | "down"
  | "unknown";

export type NodeStatus = "Ready" | "NotReady" | "Unknown" | string;

export interface FleetNode {
  name: string;
  role: string;
  status: NodeStatus;
  cpuPercent: number;
  memPercent: number;
  conditions?: string[];
}

export interface FleetAgent {
  id: string;
  kind: AgentKind;
  name: string;
  detail: string;
  status: AgentStatus;
  task?: string | null;
}

export interface BacklogIssue {
  id: string;
  number: number;
  title: string;
  repo: string;
  priority: Priority;
  labels?: string[];
  url?: string;
  updatedAt?: string;
}

export interface PlatformBacklog {
  platform: "github" | "gitlab";
  totalOpen: number;
  top: BacklogIssue[];
}

export interface FleetStatus {
  generatedAt: string;
  refreshSeconds?: number;
  summary: {
    nodesReady: number;
    nodesTotal: number;
    agentsOnline: number;
    agentsCursor: number;
    agentsHermes: number;
    issuesOpen: number;
    issuesGithub: number;
    issuesGitlab: number;
    inProgress: number;
  };
  nodes: FleetNode[];
  agents: FleetAgent[];
  backlog: {
    github: PlatformBacklog;
    gitlab: PlatformBacklog;
  };
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};
