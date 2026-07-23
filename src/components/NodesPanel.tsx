import type { FleetNode } from "../types";
import { barTone, nodePillClass } from "../lib/format";

interface Props {
  nodes: FleetNode[];
}

export function NodesPanel({ nodes }: Props) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Kubernetes nodes</h2>
        <span className="sub">prd-apps · nprd-apps · coder</span>
      </div>
      <div className="nodes">
        {nodes.map((n) => {
          const cpuTone = barTone(n.cpuPercent);
          const memTone = barTone(n.memPercent);
          return (
            <div className="node" key={n.name}>
              <div>
                <div className="name">{n.name}</div>
                <div className="role">{n.role}</div>
              </div>
              <div className="bars">
                <div className="bar-row">
                  <span>CPU</span>
                  <div className="track">
                    <div
                      className={`fill${cpuTone !== "ok" ? ` ${cpuTone}` : ""}`}
                      style={{ width: `${clamp(n.cpuPercent)}%` }}
                    />
                  </div>
                  <span>{Math.round(n.cpuPercent)}%</span>
                </div>
                <div className="bar-row">
                  <span>MEM</span>
                  <div className="track">
                    <div
                      className={`fill${memTone !== "ok" ? ` ${memTone}` : ""}`}
                      style={{ width: `${clamp(n.memPercent)}%` }}
                    />
                  </div>
                  <span>{Math.round(n.memPercent)}%</span>
                </div>
              </div>
              <span className={`status-pill ${nodePillClass(n.status)}`}>
                {n.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
