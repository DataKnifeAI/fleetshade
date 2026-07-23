import type { FleetStatus } from "../types";

interface Props {
  status: FleetStatus;
}

export function SummaryStrip({ status }: Props) {
  const s = status.summary;
  const pressure = status.nodes.filter((n) =>
    (n.conditions || []).some((c) => c.toLowerCase().includes("pressure")) ||
    n.status.toLowerCase().includes("pressure"),
  ).length;

  return (
    <div className="summary">
      <div className="stat ok">
        <div className="label">Cluster nodes</div>
        <div className="value">
          {s.nodesReady}/{s.nodesTotal}
        </div>
        <div className="hint">
          Ready{pressure ? ` · ${pressure} pressure` : ""}
        </div>
      </div>
      <div className="stat accent">
        <div className="label">Agents online</div>
        <div className="value">{s.agentsOnline}</div>
        <div className="hint">
          {s.agentsCursor} Cursor · {s.agentsHermes} Hermes
        </div>
      </div>
      <div className={`stat ${s.issuesOpen > 0 ? "warn" : ""}`}>
        <div className="label">Open issues</div>
        <div className="value">{s.issuesOpen}</div>
        <div className="hint">
          {s.issuesGithub} GitHub · {s.issuesGitlab} GitLab
        </div>
      </div>
      <div className="stat">
        <div className="label">In progress</div>
        <div className="value">{s.inProgress}</div>
        <div className="hint">agents on issues</div>
      </div>
    </div>
  );
}
