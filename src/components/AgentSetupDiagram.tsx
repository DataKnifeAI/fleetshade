/**
 * How agent workspaces are provisioned and how they reach models / tools.
 * Coder is the base: templates → desktop agent spaces → inside/outside APIs.
 */
export function AgentSetupDiagram() {
  return (
    <section className="panel wide">
      <div className="panel-head">
        <h2>Agent workspace setup</h2>
        <span className="sub">Coder · templates · desktop spaces</span>
      </div>
      <p className="setup-lead">
        Coder deploys template agent spaces with tools and resources. Each space is a
        self-hosted desktop environment that talks inside the cluster or out through an
        API router — and can call on-cluster vLLM (Hermes / Enodios) for inference while
        coding across languages.
      </p>

      <div className="topo-flow">
        <svg
          className="topo-svg setup-svg"
          viewBox="0 0 1120 420"
          role="img"
          aria-label="Coder agent workspace setup diagram"
        >
          <defs>
            <marker
              id="arr"
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

          {/* Coder control plane */}
          <rect className="box hi" x="20" y="160" width="180" height="100" />
          <text x="36" y="192">Coder</text>
          <text className="sub" x="36" y="212">
            control plane
          </text>
          <text className="sub" x="36" y="230">
            self-hosted
          </text>

          {/* Templates */}
          <rect className="box" x="260" y="40" width="200" height="64" />
          <text x="276" y="66">dkai-agent</text>
          <text className="sub" x="276" y="86">
            agent template
          </text>

          <rect className="box" x="260" y="120" width="200" height="64" />
          <text x="276" y="146">dkai-arch / dkai-dev</text>
          <text className="sub" x="276" y="166">
            desktop · tooling
          </text>

          <rect className="box" x="260" y="200" width="200" height="64" />
          <text x="276" y="226">kubernetes</text>
          <text className="sub" x="276" y="246">
            pool · resources
          </text>

          <rect className="box" x="260" y="300" width="200" height="64" />
          <text x="276" y="326">agent-skills · MCP</text>
          <text className="sub" x="276" y="346">
            related tools
          </text>

          {/* Workspace */}
          <rect className="box ok" x="540" y="130" width="240" height="160" />
          <text x="558" y="160">Agent desktop space</text>
          <text className="sub" x="558" y="182">
            Cursor / Hermes agent
          </text>
          <text className="sub" x="558" y="200">
            languages: TS · Go · Py · …
          </text>
          <text className="sub" x="558" y="218">
            git · shell · IDE · browsers
          </text>
          <text className="sub" x="558" y="236">
            CPU · mem · GPU attach
          </text>
          <text className="sub" x="558" y="254">
            self-hosted workspace
          </text>
          <text className="sub" x="558" y="272">
            issue → branch → PR/MR
          </text>

          {/* Outside / Inside */}
          <rect className="box" x="860" y="40" width="240" height="100" />
          <text x="878" y="72">Outside router</text>
          <text className="sub" x="878" y="92">
            cloud / edge API
          </text>
          <text className="sub" x="878" y="110">
            Cursor · external LLMs
          </text>

          <rect className="box warn" x="860" y="180" width="240" height="100" />
          <text x="878" y="212">Inside · vLLM</text>
          <text className="sub" x="878" y="232">
            Hermes · Enodios
          </text>
          <text className="sub" x="878" y="250">
            GPU workers on k8s
          </text>

          <rect className="box" x="860" y="320" width="240" height="70" />
          <text x="878" y="348">Inside APIs</text>
          <text className="sub" x="878" y="368">
            Rancher · UniFi · GitOps · …
          </text>

          {/* Links */}
          <path className="link solid" d="M200 210 H260" markerEnd="url(#arr)" />
          <path className="link solid" d="M200 210 H230 V72 H260" markerEnd="url(#arr)" />
          <path className="link solid" d="M200 210 H230 V232 H260" markerEnd="url(#arr)" />
          <path className="link solid" d="M200 210 H230 V332 H260" markerEnd="url(#arr)" />

          <path className="link solid" d="M460 72 H500 V180 H540" markerEnd="url(#arr)" />
          <path className="link solid" d="M460 152 H540" markerEnd="url(#arr)" />
          <path className="link solid" d="M460 232 H500 V220 H540" markerEnd="url(#arr)" />
          <path className="link" d="M460 332 H500 V260 H540" markerEnd="url(#arr)" />

          <path className="link warn" d="M780 170 H820 V90 H860" markerEnd="url(#arr)" />
          <path className="link solid" d="M780 210 H860" markerEnd="url(#arr)" />
          <path className="link" d="M780 250 H820 V355 H860" markerEnd="url(#arr)" />

          <text className="sub" x="210" y="148">
            deploy
          </text>
          <text className="sub" x="480" y="118">
            provision
          </text>
          <text className="sub" x="790" y="70">
            outside API
          </text>
          <text className="sub" x="790" y="198">
            inside API
          </text>
          <text className="sub" x="790" y="300">
            tools API
          </text>
        </svg>
      </div>

      <div className="setup-grid">
        <article className="setup-card">
          <h3>1 · Coder base</h3>
          <p>
            Self-hosted Coder provisions workspaces from DataKnife templates (
            <code>dkai-agent</code>, <code>dkai-arch</code>, <code>dkai-dev</code>,{" "}
            <code>kubernetes</code>).
          </p>
        </article>
        <article className="setup-card">
          <h3>2 · Desktop agent space</h3>
          <p>
            Each workspace is a full desktop/dev environment: agent runtime, shells,
            language toolchains, and attached CPU/mem/GPU resources.
          </p>
        </article>
        <article className="setup-card">
          <h3>3 · Tools &amp; resources</h3>
          <p>
            Skills and MCP servers (GitOps, Rancher, UniFi, Proxmox, …) attach as
            related tools so the agent can act on inside systems via API.
          </p>
        </article>
        <article className="setup-card">
          <h3>4 · Model path</h3>
          <p>
            Work can route <strong>outside</strong> (cloud router / Cursor) or{" "}
            <strong>inside</strong> to on-cluster vLLM (Hermes / Enodios) for local
            inference.
          </p>
        </article>
      </div>
    </section>
  );
}
