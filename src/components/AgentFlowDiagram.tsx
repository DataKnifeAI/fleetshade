/**
 * Agent work flow: outer lifecycle + inner observe/plan/act/verify loop(s).
 */
export function AgentFlowDiagram() {
  return (
    <section className="panel wide">
      <div className="panel-head">
        <h2>Agent flow</h2>
        <span className="sub">Lifecycle · inner loops · exits</span>
      </div>
      <p className="setup-lead">
        Work is not a straight line. An agent enters a desktop space, then runs nested
        loops — reasoning, tool calls, verify/fix — until it can ship, wait, or hand
        off. Failures and new context feed back into the same loop.
      </p>

      <div className="topo-flow">
        <svg
          className="topo-svg flow-svg"
          viewBox="0 0 1140 520"
          role="img"
          aria-label="Agent lifecycle and inner work loops"
        >
          <defs>
            <marker
              id="flow-arr"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker
              id="flow-arr-warn"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(226, 179, 74, 0.85)" />
            </marker>
          </defs>

          {/* Outer rail */}
          <text className="sub" x="24" y="28">
            outer lifecycle
          </text>

          <rect className="box" x="20" y="44" width="140" height="56" />
          <text x="36" y="70">Issue</text>
          <text className="sub" x="36" y="88">
            GH / GL · priority
          </text>

          <rect className="box hi" x="200" y="44" width="160" height="56" />
          <text x="216" y="70">Provision</text>
          <text className="sub" x="216" y="88">
            Coder template space
          </text>

          <rect className="box ok" x="400" y="36" width="340" height="72" />
          <text x="418" y="64">Agent session</text>
          <text className="sub" x="418" y="84">
            desktop space · model + tools attached
          </text>

          <rect className="box" x="780" y="44" width="150" height="56" />
          <text x="796" y="70">Ship</text>
          <text className="sub" x="796" y="88">
            PR / MR · CI
          </text>

          <rect className="box" x="970" y="44" width="150" height="56" />
          <text x="986" y="70">Done</text>
          <text className="sub" x="986" y="88">
            or idle pool
          </text>

          <path className="link solid" d="M160 72 H200" markerEnd="url(#flow-arr)" />
          <path className="link solid" d="M360 72 H400" markerEnd="url(#flow-arr)" />
          <path className="link solid" d="M740 72 H780" markerEnd="url(#flow-arr)" />
          <path className="link solid" d="M930 72 H970" markerEnd="url(#flow-arr)" />

          {/* CI retry loop back to session */}
          <path
            className="link warn"
            d="M855 100 V130 H570 V108"
            markerEnd="url(#flow-arr-warn)"
          />
          <text className="sub" x="620" y="124">
            CI fail · review feedback → re-enter loop
          </text>

          {/* Inner loop frame */}
          <rect
            className="box loop-frame"
            x="40"
            y="160"
            width="1060"
            height="340"
            rx="0"
          />
          <text className="sub" x="56" y="184">
            inner agent loop (repeats until exit)
          </text>

          {/* Loop nodes */}
          <rect className="box hi" x="80" y="220" width="170" height="70" />
          <text x="96" y="248">Observe</text>
          <text className="sub" x="96" y="268">
            issue · repo · logs
          </text>

          <rect className="box hi" x="330" y="220" width="170" height="70" />
          <text x="346" y="248">Plan</text>
          <text className="sub" x="346" y="268">
            model · outside / vLLM
          </text>

          <rect className="box ok" x="580" y="220" width="170" height="70" />
          <text x="596" y="248">Act</text>
          <text className="sub" x="596" y="268">
            edit · shell · MCP
          </text>

          <rect className="box warn" x="830" y="220" width="190" height="70" />
          <text x="846" y="248">Verify</text>
          <text className="sub" x="846" y="268">
            test · lint · diff
          </text>

          {/* Forward edges */}
          <path className="link solid" d="M250 255 H330" markerEnd="url(#flow-arr)" />
          <path className="link solid" d="M500 255 H580" markerEnd="url(#flow-arr)" />
          <path className="link solid" d="M750 255 H830" markerEnd="url(#flow-arr)" />

          {/* Main feedback loop: Verify → Observe */}
          <path
            className="link loop"
            d="M925 290 V360 H165 V290"
            markerEnd="url(#flow-arr)"
          />
          <text className="sub" x="480" y="352">
            loop · more context / fix / next step
          </text>

          {/* Tool micro-loop under Act */}
          <rect className="box" x="560" y="390" width="210" height="78" />
          <text x="576" y="416">Tool loop</text>
          <text className="sub" x="576" y="434">
            call → result → call…
          </text>
          <text className="sub" x="576" y="452">
            inside / outside APIs
          </text>
          <path
            className="link loop"
            d="M665 290 V390"
            markerEnd="url(#flow-arr)"
          />
          <path
            className="link loop"
            d="M620 390 C560 390 560 300 580 290"
            markerEnd="url(#flow-arr)"
          />

          {/* Exit paths from Verify */}
          <text className="sub" x="840" y="320">
            exits
          </text>
          <path
            className="link solid"
            d="M1020 255 H1080 V72"
            markerEnd="url(#flow-arr)"
          />
          <text className="sub" x="1035" y="160">
            ready → ship
          </text>

          {/* Blocked / handoff */}
          <rect className="box" x="80" y="400" width="200" height="70" />
          <text x="96" y="428">Blocked</text>
          <text className="sub" x="96" y="448">
            wait · ask · handoff
          </text>
          <path
            className="link warn"
            d="M165 290 V400"
            markerEnd="url(#flow-arr-warn)"
          />
          <path
            className="link warn"
            d="M180 400 C120 400 100 320 165 290"
            markerEnd="url(#flow-arr-warn)"
          />

          {/* Model call annotation on Plan */}
          <text className="sub" x="346" y="200">
            think loop
          </text>
        </svg>
      </div>

      <div className="setup-grid flow-legend">
        <article className="setup-card">
          <h3>Observe → Plan → Act → Verify</h3>
          <p>
            Core cycle inside the Coder desktop space. Verify failures and partial wins
            return to Observe with new context.
          </p>
        </article>
        <article className="setup-card">
          <h3>Tool loop</h3>
          <p>
            Nested under Act: MCP / shell / git / inside APIs may round-trip many times
            before the agent returns to Verify.
          </p>
        </article>
        <article className="setup-card">
          <h3>CI / review loop</h3>
          <p>
            After Ship, CI or human review can push work back into the agent session —
            same inner loop, new observations.
          </p>
        </article>
        <article className="setup-card">
          <h3>Exit conditions</h3>
          <p>
            <strong>Ship</strong> when checks pass; <strong>Blocked</strong> when waiting
            on humans/secrets; idle pool when the space is released.
          </p>
        </article>
      </div>
    </section>
  );
}
