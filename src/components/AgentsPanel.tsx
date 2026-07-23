import type { FleetAgent } from "../types";
import { agentPillClass } from "../lib/format";

interface Props {
  agents: FleetAgent[];
}

export function AgentsPanel({ agents }: Props) {
  const cursor = agents.filter((a) => a.kind === "cursor");
  const hermes = agents.filter((a) => a.kind === "hermes");

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Agent health</h2>
        <span className="sub">Cursor · Hermes</span>
      </div>

      <div className="family">Cursor</div>
      <div className="agents">
        {cursor.map((a) => (
          <AgentRow key={a.id} agent={a} glyph="C" />
        ))}
      </div>

      <div className="family" style={{ marginTop: 18 }}>
        Hermes
      </div>
      <div className="agents">
        {hermes.map((a) => (
          <AgentRow key={a.id} agent={a} glyph="H" />
        ))}
      </div>
    </section>
  );
}

function AgentRow({ agent, glyph }: { agent: FleetAgent; glyph: string }) {
  return (
    <div className="agent">
      <div className="glyph">{glyph}</div>
      <div>
        <div className="title">{agent.name}</div>
        <div className="detail">{agent.detail}</div>
        <div className="task">{agent.task || "—"}</div>
      </div>
      <span className={`status-pill ${agentPillClass(agent.status)}`}>
        {agent.status}
      </span>
    </div>
  );
}
