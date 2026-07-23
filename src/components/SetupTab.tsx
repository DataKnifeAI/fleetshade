import type { FleetStatus } from "../types";
import { Topology } from "./Topology";
import { AgentSetupDiagram } from "./AgentSetupDiagram";
import { AgentFlowDiagram } from "./AgentFlowDiagram";

interface Props {
  status: FleetStatus;
}

export function SetupTab({ status }: Props) {
  return (
    <div className="grid setup-view">
      <AgentSetupDiagram />
      <AgentFlowDiagram />
      <Topology status={status} />
    </div>
  );
}
