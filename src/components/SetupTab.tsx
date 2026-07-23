import type { FleetStatus } from "../types";
import { Topology } from "./Topology";
import { AgentSetupDiagram } from "./AgentSetupDiagram";

interface Props {
  status: FleetStatus;
}

export function SetupTab({ status }: Props) {
  return (
    <div className="grid setup-view">
      <AgentSetupDiagram />
      <Topology status={status} />

      <section className="panel wide">
        <div className="panel-head">
          <h2>How agents do work</h2>
          <span className="sub">Issue → space → model → change</span>
        </div>
        <ol className="work-steps">
          <li>
            <span className="step-n">01</span>
            <div>
              <strong>Backlog</strong>
              <p>GitHub / GitLab issues land in Dioptra, sorted by priority.</p>
            </div>
          </li>
          <li>
            <span className="step-n">02</span>
            <div>
              <strong>Provision</strong>
              <p>
                Coder starts (or reuses) a template agent desktop space with the right
                tools and resource profile.
              </p>
            </div>
          </li>
          <li>
            <span className="step-n">03</span>
            <div>
              <strong>Reason</strong>
              <p>
                The agent calls an outside router or internal vLLM over API, then uses
                MCP/skills against inside services as needed.
              </p>
            </div>
          </li>
          <li>
            <span className="step-n">04</span>
            <div>
              <strong>Ship</strong>
              <p>
                Code changes across languages land as branches / PRs / MRs; fleet health
                stays visible on the Fleet tab.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
