import type { FleetStatus } from "../types";

interface Props {
  status: FleetStatus;
}

export function Topology({ status }: Props) {
  const { summary } = status;
  return (
    <section className="panel wide">
      <div className="panel-head">
        <h2>Fleet wiring</h2>
        <span className="sub">Issues · agents · cluster</span>
      </div>
      <div className="topo-flow">
        <svg
          className="topo-svg"
          viewBox="0 0 1100 280"
          role="img"
          aria-label="Agent infrastructure topology"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>

          <rect className="box" x="20" y="36" width="160" height="70" />
          <text x="36" y="64">GitHub</text>
          <text className="sub" x="36" y="84">
            {summary.issuesGithub} open issues
          </text>

          <rect className="box" x="20" y="174" width="160" height="70" />
          <text x="36" y="202">GitLab</text>
          <text className="sub" x="36" y="222">
            {summary.issuesGitlab} open issues
          </text>

          <rect className="box hi" x="280" y="90" width="180" height="100" />
          <text x="298" y="128">DIOPTRA</text>
          <text className="sub" x="298" y="148">
            backlog merge
          </text>
          <text className="sub" x="298" y="166">
            priority sort
          </text>

          <rect className="box ok" x="560" y="28" width="200" height="88" />
          <text x="578" y="56">Cursor</text>
          <text className="sub" x="578" y="76">
            cloud agents
          </text>
          <text className="sub" x="578" y="94">
            {summary.agentsCursor} online · Coder
          </text>

          <rect className="box ok" x="560" y="164" width="200" height="88" />
          <text x="578" y="192">Hermes</text>
          <text className="sub" x="578" y="212">
            Enodios · vLLM
          </text>
          <text className="sub" x="578" y="230">
            {summary.agentsHermes} online · GPU
          </text>

          <rect className="box" x="860" y="90" width="220" height="100" />
          <text x="878" y="128">Kubernetes</text>
          <text className="sub" x="878" y="148">
            {summary.nodesReady}/{summary.nodesTotal} nodes ready
          </text>
          <text className="sub" x="878" y="166">
            prd / nprd / coder
          </text>

          <path className="link" d="M180 71 H250 V120 H280" markerEnd="url(#arrow)" />
          <path className="link" d="M180 209 H250 V160 H280" markerEnd="url(#arrow)" />
          <path className="link solid" d="M460 120 H520 V72 H560" markerEnd="url(#arrow)" />
          <path className="link solid" d="M460 160 H520 V208 H560" markerEnd="url(#arrow)" />
          <path className="link solid" d="M760 72 H820 V120 H860" markerEnd="url(#arrow)" />
          <path className="link warn" d="M760 208 H820 V160 H860" markerEnd="url(#arrow)" />

          <text className="sub" x="200" y="52">
            open issues
          </text>
          <text className="sub" x="200" y="248">
            open issues
          </text>
          <text className="sub" x="470" y="100">
            dispatch
          </text>
          <text className="sub" x="470" y="188">
            dispatch
          </text>
          <text className="sub" x="780" y="58">
            runs on
          </text>
          <text className="sub" x="780" y="248">
            runs on
          </text>
        </svg>
      </div>
    </section>
  );
}
